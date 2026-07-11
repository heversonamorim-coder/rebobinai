'use client';

import { useState } from 'react';

/**
 * Miniatura do produto físico. Mostra a foto do /public; enquanto o cliente não
 * subir a imagem (ou se ela falhar), cai num placeholder com o emoji da marca —
 * assim o layout nunca fica com imagem quebrada.
 *
 * Quando `onZoom` é passado e a imagem carrega, ganha um ícone de lupa e vira um
 * gatilho pra ampliar a foto (o cliente vê como o produto vai ficar). Fica dentro
 * do botão de seleção do produto, então o clique da lupa não seleciona o produto
 * (stopPropagation).
 */
export function ProductThumb({
  src,
  emoji,
  alt,
  onZoom,
}: {
  src: string;
  emoji: string;
  alt: string;
  onZoom?: (src: string, alt: string) => void;
}) {
  const [broken, setBroken] = useState(false);

  if (broken || !src) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-tape/60 text-2xl">
        {emoji}
      </span>
    );
  }

  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setBroken(true)}
        className="h-14 w-14 rounded-lg border border-[var(--line)] object-cover"
      />
      {onZoom && (
        <span
          aria-hidden
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-cyan/60 bg-tape text-cyan shadow"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.2-4.2" />
          </svg>
        </span>
      )}
    </>
  );

  if (!onZoom) {
    return <span className="relative block h-14 w-14 shrink-0">{inner}</span>;
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Ampliar imagem: ${alt}`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onZoom(src, alt);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          e.preventDefault();
          onZoom(src, alt);
        }
      }}
      className="relative block h-14 w-14 shrink-0 cursor-zoom-in rounded-lg outline-none ring-cyan focus-visible:ring-2"
    >
      {inner}
    </span>
  );
}
