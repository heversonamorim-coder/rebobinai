'use client';

import { useState } from 'react';

/**
 * Miniatura do produto físico. Mostra a foto do /public; enquanto o cliente não
 * subir a imagem (ou se ela falhar), cai num placeholder com o emoji da marca —
 * assim o layout nunca fica com imagem quebrada.
 */
export function ProductThumb({ src, emoji, alt }: { src: string; emoji: string; alt: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-tape/60 text-2xl">
        {emoji}
      </span>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="h-14 w-14 shrink-0 rounded-lg border border-[var(--line)] object-cover"
    />
  );
}
