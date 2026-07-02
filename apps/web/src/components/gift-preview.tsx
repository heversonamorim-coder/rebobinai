import { Osd } from '@rebobinai/ui';
import { occasionLabel, type GiftPayload } from '../lib/gift';

export interface GiftPreviewProps {
  payload: GiftPayload;
  occasion?: string | null;
  /** Quando true, sobrepõe a marca d'água (rascunho não pago). */
  watermark?: boolean;
}

/**
 * Renderização do presente na estética da marca (VHS/Y2K sobre CRT).
 * Componente presentacional puro — sem hooks — para ser usado tanto no editor
 * (preview do rascunho) quanto no SSR de /p/:slug (F1-3).
 */
export function GiftPreview({ payload, occasion, watermark = false }: GiftPreviewProps) {
  const { title, recipientName, senderName, letter, timeline, spotifyTrackUrl } = payload;
  const occ = occasionLabel(occasion);

  return (
    <div className="rb-scanlines rb-vignette relative overflow-hidden rounded-2xl border border-[var(--line)] bg-tape-2 px-6 py-10 sm:px-10 sm:py-14">
      <Osd left="● PLAY" right="◄◄ REBOBINAÍ" />

      {occ && (
        <p className="mt-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
          {occ}
        </p>
      )}

      <h1 className="rb-chroma mt-3 text-center font-display text-3xl font-bold leading-tight text-glow sm:text-5xl">
        {title || 'A nossa história'}
      </h1>

      {(recipientName || senderName) && (
        <p className="mt-3 text-center font-mono text-xs tracking-[0.2em] text-dim">
          {recipientName ? `para ${recipientName}` : ''}
          {recipientName && senderName ? ' · ' : ''}
          {senderName ? `de ${senderName}` : ''}
        </p>
      )}

      <div className="rb-tracking-bar mx-auto mt-8 max-w-md" aria-hidden />

      {letter && (
        <p className="mx-auto mt-8 max-w-prose whitespace-pre-wrap text-center text-lg leading-relaxed text-glow/90">
          {letter}
        </p>
      )}

      {timeline && timeline.length > 0 && (
        <ol className="mx-auto mt-10 max-w-md space-y-5">
          {timeline.map((item, i) => (
            <li key={i} className="border-l-2 border-magenta/60 pl-4">
              {item.date && (
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan">
                  {item.date}
                </span>
              )}
              <p className="font-display text-lg text-glow">{item.title}</p>
              {item.description && (
                <p className="mt-1 text-sm leading-relaxed text-dim">{item.description}</p>
              )}
            </li>
          ))}
        </ol>
      )}

      {spotifyTrackUrl && (
        <p className="mt-10 text-center">
          <a
            href={spotifyTrackUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-[0.2em] text-purple underline underline-offset-4"
          >
            ♫ tocar a nossa música
          </a>
        </p>
      )}

      {watermark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none flex-wrap content-center items-center justify-center gap-x-10 gap-y-8 opacity-[0.14]"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="-rotate-[24deg] font-display text-xl font-bold uppercase tracking-[0.3em] text-glow"
            >
              ◄◄ prévia · rebobinaí
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
