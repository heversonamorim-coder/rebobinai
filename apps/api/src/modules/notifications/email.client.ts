import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Anexo de e-mail; com `contentId` vira imagem inline (referenciada por cid:). */
export interface EmailAttachment {
  filename: string;
  content: string; // base64
  contentId?: string;
  contentType?: string;
}

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

  async send(input: {
    to: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
  }): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn(`E-mail não enviado (RESEND_API_KEY ausente): "${input.subject}"`);
      return;
    }
    const payload: Record<string, unknown> = {
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    };
    if (input.attachments?.length) {
      // Resend usa snake_case no corpo (content_id p/ inline, content_type).
      payload.attachments = input.attachments.map((a) => ({
        filename: a.filename,
        content: a.content,
        ...(a.contentId ? { content_id: a.contentId } : {}),
        ...(a.contentType ? { content_type: a.contentType } : {}),
      }));
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Resend ${res.status}: ${await res.text()}`);
    }
  }
}
