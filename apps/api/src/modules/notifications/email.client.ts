import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Adapter de e-mail transacional (Resend). Sem RESEND_API_KEY o envio vira
 * no-op com log — o resto da app segue funcionando (e-mail "desligado" até
 * a chave ser configurada).
 */
@Injectable()
export class EmailClient {
  private readonly logger = new Logger(EmailClient.name);
  private readonly apiKey?: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('RESEND_API_KEY');
    this.from = config.get<string>('MAIL_FROM') ?? 'Rebobinaí ◄◄ <no-reply@rebobinai.app>';
  }

  get enabled(): boolean {
    return Boolean(this.apiKey);
  }

  async send(input: { to: string; subject: string; html: string }): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn(`E-mail não enviado (RESEND_API_KEY ausente): "${input.subject}"`);
      return;
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        from: this.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend ${res.status}: ${await res.text()}`);
    }
  }
}
