'use client';

import { useCallback, useEffect } from 'react';

export interface LightboxPhoto {
  id: string;
  url: string;
}

/**
 * Visualizador de foto em tamanho real com navegação (◄ ►), fechar no X, clique
 * no fundo ou Esc, e setas do teclado. Usado na seção de fotos e na rebobinada.
 */
export function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: LightboxPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const prev = useCallback(() => onIndex((index - 1 + photos.length) % photos.length), [index, photos.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % photos.length), [index, photos.length, onIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tape/95 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-[var(--line)] bg-tape/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-glow hover:text-magenta"
        aria-label="Fechar"
      >
        ✕
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--line)] bg-tape/70 px-3 py-4 font-display text-xl text-glow hover:text-cyan sm:left-6"
            aria-label="Foto anterior"
          >
            ◄
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--line)] bg-tape/70 px-3 py-4 font-display text-xl text-glow hover:text-cyan sm:right-6"
            aria-label="Próxima foto"
          >
            ►
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85svh] max-w-full rounded-lg border border-[var(--line)] object-contain"
      />

      {photos.length > 1 && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          {index + 1} / {photos.length}
        </span>
      )}
    </div>
  );
}
