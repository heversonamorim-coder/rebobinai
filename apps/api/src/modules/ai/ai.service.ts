import Anthropic from '@anthropic-ai/sdk';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { AI_SPAN_OP, Sentry } from '../../infra/sentry';
import { AnalyticsService } from '../analytics/analytics.service';
import { GiftService } from '../gift/gift.service';
import { brDay } from '../gift/geo';
import { AiUsageRepository } from './ai-usage.repository';
import { aiDraftSchema } from './dto/ai.schemas';

const OCCASIONS = ['namorados', 'conjuge', 'pais', 'avos', 'casamento', 'aniversario'];

const SYSTEM = `Você é o compositor do Rebobinaí, um app de presentes digitais que "rebobinam" a história de duas pessoas com estética VHS/retrô.

A pessoa vai te contar, em um parágrafo, a história que quer transformar em presente. Sua tarefa é montar um RASCUNHO editável — o cliente vai ajustar depois.

Devolva SOMENTE um objeto JSON válido (sem markdown, sem texto antes ou depois) com exatamente estes campos:
- "title": título curto e afetivo (máx. ~60 caracteres).
- "occasion": uma destas chaves ou null: ${OCCASIONS.join(', ')}.
- "recipientName": nome de quem recebe, ou null se não souber.
- "senderName": nome de quem envia, ou null.
- "letter": um recado curto de capa (1 a 2 frases, até ~160 caracteres), na voz de quem envia, em português do Brasil.
- "startDate": a data em que a história começou no formato "AAAA-MM-DD", SOMENTE se a pessoa citar (ex.: "desde março de 2019" → "2019-03-01"). Se não der pra saber, null.
- "closingMessage": um rascunho de recado final curto e emocionante (1 a 2 frases) pra fechar o presente. Sempre preencha.
- "timeline": de 3 a 5 momentos marcantes, cada um { "date": texto curto ou null, "title": frase curta, "description": 1 frase ou null }, em ordem cronológica.

Regras:
- Use só o que a pessoa contou; quando faltar um dado, infira com bom senso ou use null — não invente nomes reais nem datas que a pessoa não mencionou.
- Tom emotivo, leve e verdadeiro. Nada brega demais.
- Recuse (retorne todos os campos vazios/null e timeline []) qualquer conteúdo impróprio: envolvendo menores de forma sexual, ódio, violência explícita ou ilegal.
- Não inclua nenhuma explicação: a resposta é apenas o JSON.`;

/**
 * Bounded context: ai. Texto → rascunho do presente via Claude (F3-1).
 * Gated: sem ANTHROPIC_API_KEY responde 503; o resto da app sobe normal.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client?: Anthropic;
  private readonly model: string;
  /** Cota grátis por IP/dia (freemium anti-abuso). Configurável por env. */
  private readonly freeDailyLimit: number;

  constructor(
    config: ConfigService,
    private readonly usage: AiUsageRepository,
    private readonly gifts: GiftService,
    private readonly analytics: AnalyticsService,
  ) {
    const apiKey = config.get<string>('ANTHROPIC_API_KEY');
    this.model = config.get<string>('ANTHROPIC_MODEL') ?? 'claude-opus-4-8';
    this.freeDailyLimit = Number(config.get<string>('AI_FREE_DAILY_LIMIT') ?? 3);
    if (apiKey) this.client = new Anthropic({ apiKey });
  }

  get enabled(): boolean {
    return Boolean(this.client);
  }

  /**
   * Gera o rascunho e devolve { occasion, payload, remaining }. Cota anti-abuso
   * por IP/dia; ao estourar, 429 com upsell (não gera). Quando vem giftMeta,
   * marca o rascunho como composedWithAi (trava o Digital no checkout).
   */
  async draftFromText(
    text: string,
    ip: string | undefined,
    giftMeta?: { giftId: string; editToken: string },
  ) {
    if (!this.client) {
      throw new ServiceUnavailableException('IA indisponível: ANTHROPIC_API_KEY não configurada.');
    }

    // Cota grátis por IP (sem login, o IP é a âncora possível). Servidor é a
    // fonte de verdade — a "válvula de escape" do checkout não reseta isto.
    const ipHash = createHash('sha256').update(ip ?? 'unknown').digest('hex');
    const day = brDay();
    const used = await this.usage.count(ipHash, day);
    if (used >= this.freeDailyLimit) {
      throw new HttpException(
        {
          code: 'ai_quota_exceeded',
          remaining: 0,
          message: `Você usou suas ${this.freeDailyLimit} gerações grátis de IA de hoje. Dá pra seguir montando na mão — ou a IA ilimitada faz parte dos planos Pra Sempre e +Lembrança Física.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // A geração vira um span próprio (novo trace) — sempre amostrado, mesmo com
    // o tracing geral desligado (ver infra/sentry.ts). Aqui saem latência,
    // tokens e erros da IA; o `setUser(ipHash)` liga o span ao usuário.
    return Sentry.startNewTrace(() =>
      Sentry.startSpan(
        {
          name: 'ai.draft',
          op: AI_SPAN_OP,
          attributes: {
            'gen_ai.request.model': this.model,
            'ai.input_length': text.length,
            'ai.has_gift': Boolean(giftMeta),
          },
        },
        async (span) => {
          Sentry.setUser({ id: ipHash });

          let inputTokens = 0;
          let outputTokens = 0;
          const first = await this.callModel(text, false);
          inputTokens += first.inputTokens;
          outputTokens += first.outputTokens;
          let draft = this.tryParse(first.text);
          if (!draft) {
            const retry = await this.callModel(text, true);
            inputTokens += retry.inputTokens;
            outputTokens += retry.outputTokens;
            draft = this.tryParse(retry.text);
          }
          if (!draft) {
            throw new UnprocessableEntityException('Não consegui montar o rascunho a partir do texto.');
          }

          // Só conta e marca depois de uma geração de sucesso.
          await this.usage.increment(ipHash, day);
          if (giftMeta) {
            await this.gifts
              .markComposedWithAi(giftMeta.giftId, giftMeta.editToken)
              .catch((e) => this.logger.error(`markComposedWithAi falhou: ${e instanceof Error ? e.message : e}`));
          }

          const remaining = Math.max(0, this.freeDailyLimit - used - 1);

          span.setAttributes({
            'gen_ai.usage.input_tokens': inputTokens,
            'gen_ai.usage.output_tokens': outputTokens,
            'ai.occasion': draft.occasion ?? 'none',
            'ai.remaining': remaining,
          });

          // Evento de produto: 1 por geração, com distinctId = hash do IP. É o
          // que responde "quantos usuários distintos usaram a IA" no PostHog.
          this.analytics.capture(ipHash, 'ai_draft_generated', {
            occasion: draft.occasion ?? null,
            model: this.model,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            has_gift: Boolean(giftMeta),
            remaining,
          });

          // Mapeia os campos "planos" da IA pro formato do payload: startDate vira
          // o contador (counter.targetDate); closingMessage segue como está.
          const { occasion, startDate, closingMessage, ...rest } = draft;
          const payload = {
            ...rest,
            ...(startDate ? { counter: { targetDate: startDate } } : {}),
            ...(closingMessage ? { closingMessage } : {}),
          };
          return { occasion, payload, remaining };
        },
      ),
    );
  }

  private async callModel(
    text: string,
    stricter: boolean,
  ): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
    const system = stricter
      ? `${SYSTEM}\n\nATENÇÃO: sua última resposta não foi um JSON válido. Responda AGORA apenas com o objeto JSON.`
      : SYSTEM;

    const message = await this.client!.messages.create({
      model: this.model,
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: text }],
    });

    if (message.stop_reason === 'refusal') {
      throw new UnprocessableEntityException('Conteúdo não permitido.');
    }

    let out = '';
    for (const block of message.content) {
      if (block.type === 'text') out += block.text;
    }
    return {
      text: out,
      inputTokens: message.usage?.input_tokens ?? 0,
      outputTokens: message.usage?.output_tokens ?? 0,
    };
  }

  private tryParse(raw: string) {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      const obj = JSON.parse(raw.slice(start, end + 1));
      const result = aiDraftSchema.safeParse(obj);
      if (!result.success) {
        this.logger.warn('Rascunho da IA fora do schema esperado.');
        return null;
      }
      return result.data;
    } catch {
      return null;
    }
  }
}
