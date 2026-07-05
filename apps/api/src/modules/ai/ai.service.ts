import Anthropic from '@anthropic-ai/sdk';
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('ANTHROPIC_API_KEY');
    this.model = config.get<string>('ANTHROPIC_MODEL') ?? 'claude-opus-4-8';
    if (apiKey) this.client = new Anthropic({ apiKey });
  }

  get enabled(): boolean {
    return Boolean(this.client);
  }

  /** Gera o rascunho e devolve { occasion, payload } pronto pro editor. */
  async draftFromText(text: string) {
    if (!this.client) {
      throw new ServiceUnavailableException('IA indisponível: ANTHROPIC_API_KEY não configurada.');
    }

    let draft = this.tryParse(await this.callModel(text, false));
    if (!draft) draft = this.tryParse(await this.callModel(text, true));
    if (!draft) {
      throw new UnprocessableEntityException('Não consegui montar o rascunho a partir do texto.');
    }

    // Mapeia os campos "planos" da IA pro formato do payload: startDate vira o
    // contador (counter.targetDate); closingMessage segue como está.
    const { occasion, startDate, closingMessage, ...rest } = draft;
    const payload = {
      ...rest,
      ...(startDate ? { counter: { targetDate: startDate } } : {}),
      ...(closingMessage ? { closingMessage } : {}),
    };
    return { occasion, payload };
  }

  private async callModel(text: string, stricter: boolean): Promise<string> {
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
    return out;
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
