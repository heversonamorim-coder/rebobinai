'use client';

import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

const labelClass = 'mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim';

/**
 * Ferramentas de compartilhamento pós-compra: WhatsApp, campo com a URL + botão
 * de copiar (ícone) e download do QR code. O QR é gerado no cliente a partir da
 * URL — assim bate sempre com o domínio em que a página foi aberta.
 */
export function ShareTools({ url, title }: { url: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, { margin: 1, width: 512, color: { dark: '#0A0713', light: '#F1ECFF' } })
      .then((d) => alive && setQr(d))
      .catch(() => {
        /* QR indisponível — o link ainda funciona */
      });
    return () => {
      alive = false;
    };
  }, [url]);

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title || 'Uma rebobinada pra você'} ◄◄ ${url}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível — o campo é selecionável manualmente */
    }
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        className="w-full rounded-lg bg-magenta px-6 py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
      >
        compartilhar no whatsapp
      </a>

      <div>
        <span className={labelClass}>Link do presente</span>
        <div className="flex items-stretch gap-2">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-panel px-4 py-3 text-sm text-glow focus:border-cyan focus:outline-none"
          />
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? 'Link copiado' : 'Copiar link'}
            title={copied ? 'Copiado' : 'Copiar link'}
            className="flex shrink-0 items-center justify-center rounded-lg border border-[var(--line)] px-4 text-dim transition hover:border-cyan hover:text-cyan"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
        <p className="mt-1 h-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-cyan">
          {copied ? '✓ copiado' : ''}
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--line)] bg-panel/40 p-5">
        {qr ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={qr}
            alt="QR code do presente"
            width={160}
            height={160}
            className="h-40 w-40 rounded-lg border border-[var(--line)]"
          />
        ) : (
          <div className="h-40 w-40 animate-pulse rounded-lg bg-panel" />
        )}
        <a
          href={qr ?? '#'}
          download="rebobinai-qrcode.png"
          aria-disabled={!qr}
          className={`rounded-lg border border-cyan px-6 py-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan transition hover:bg-cyan hover:text-tape ${
            qr ? '' : 'pointer-events-none opacity-50'
          }`}
        >
          baixar QR code
        </a>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/70">
          imprima ou aponte a câmera
        </span>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
