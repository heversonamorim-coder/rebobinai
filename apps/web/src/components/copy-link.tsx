'use client';

import { useState } from 'react';

/** Botão de copiar o link do presente (client — usa a Clipboard API). */
export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível — ignora silenciosamente
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-[var(--line)] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-dim transition hover:border-cyan hover:text-cyan"
    >
      {copied ? '✓ copiado' : 'copiar link'}
    </button>
  );
}
