import { Injectable } from '@nestjs/common';
import { EmailClient } from './email.client';

/**
 * Bounded context: notifications. Orquestra e-mails transacionais (recibo +
 * link do presente, F1-8). Chamado por outros módulos via serviço exportado.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly email: EmailClient) {}

  /** E-mail com o link do presente liberado, disparado no gift.paid (F1-6/F1-8). */
  sendGiftLink(to: string, giftTitle: string, url: string): Promise<void> {
    return this.email.send({
      to,
      subject: `◄◄ ${giftTitle} está no ar!`,
      html: giftLinkHtml(giftTitle, url),
    });
  }

  /** E-mail com o código de rastreio do produto físico (Tarefa 6). */
  sendTrackingCode(
    to: string,
    data: { productName: string; trackingCode: string; giftTitle?: string },
  ): Promise<void> {
    return this.email.send({
      to,
      subject: '◄◄ Seu pedido saiu para entrega — código de rastreio',
      html: trackingHtml(data),
    });
  }
}

function trackingHtml(data: { productName: string; trackingCode: string; giftTitle?: string }): string {
  const track = `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(
    data.trackingCode,
  )}`;
  const sub = data.giftTitle ? ` (${escapeHtml(data.giftTitle)})` : '';
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#0A0713;color:#F1ECFF;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0713;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#150B26;border-radius:16px;padding:40px 32px;">
            <tr><td align="center" style="font-size:14px;letter-spacing:4px;color:#18E9FF;text-transform:uppercase;">◄◄ Rebobinaí</td></tr>
            <tr><td align="center" style="padding-top:20px;font-size:24px;font-weight:bold;color:#F1ECFF;">Seu pedido está a caminho! 📦</td></tr>
            <tr><td align="center" style="padding-top:12px;font-size:16px;color:#A08FC4;">A sua <strong style="color:#F1ECFF;">${escapeHtml(
              data.productName,
            )}</strong>${sub} já foi postada nos Correios.</td></tr>
            <tr>
              <td align="center" style="padding-top:24px;">
                <div style="font-size:11px;letter-spacing:2px;color:#A08FC4;text-transform:uppercase;">código de rastreio</div>
                <div style="margin-top:8px;font-size:22px;font-weight:bold;letter-spacing:3px;color:#18E9FF;font-family:'Courier New',monospace;">${escapeHtml(
                  data.trackingCode,
                )}</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:24px;">
                <a href="${escapeHtml(track)}" style="display:inline-block;background:#FF2E9A;color:#0A0713;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:10px;letter-spacing:1px;text-transform:uppercase;font-size:14px;">rastrear meu pedido ►</a>
              </td>
            </tr>
            <tr><td align="center" style="padding-top:20px;font-size:13px;color:#A08FC4;">Pode levar algumas horas até os Correios atualizarem a primeira movimentação. 💜</td></tr>
            <tr><td align="center" style="padding-top:32px;font-size:11px;letter-spacing:2px;color:#5b4d7a;text-transform:uppercase;">rebobinai.app · toda história merece um replay</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function giftLinkHtml(title: string, url: string): string {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#0A0713;color:#F1ECFF;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0713;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#150B26;border-radius:16px;padding:40px 32px;">
            <tr><td align="center" style="font-size:14px;letter-spacing:4px;color:#18E9FF;text-transform:uppercase;">◄◄ Rebobinaí</td></tr>
            <tr><td align="center" style="padding-top:20px;font-size:24px;font-weight:bold;color:#F1ECFF;">Seu presente está no ar!</td></tr>
            <tr><td align="center" style="padding-top:12px;font-size:16px;color:#A08FC4;">${escapeHtml(title)} já pode ser compartilhado — sem marca d'água.</td></tr>
            <tr>
              <td align="center" style="padding-top:28px;">
                <a href="${escapeHtml(url)}" style="display:inline-block;background:#FF2E9A;color:#0A0713;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:10px;letter-spacing:1px;text-transform:uppercase;font-size:14px;">abrir o presente ►</a>
              </td>
            </tr>
            <tr><td align="center" style="padding-top:20px;font-size:12px;color:#A08FC4;word-break:break-all;">${escapeHtml(url)}</td></tr>
            <tr><td align="center" style="padding-top:32px;font-size:11px;letter-spacing:2px;color:#5b4d7a;text-transform:uppercase;">rebobinai.app · toda história merece um replay</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
