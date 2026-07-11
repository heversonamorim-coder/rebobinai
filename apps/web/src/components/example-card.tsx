import Link from 'next/link';
import { Osd } from '@rebobinai/ui';
import { assetUrl, type GiftPayload } from '../lib/gift';

/**
 * Pôster de um exemplo na galeria: capa em estética de story que leva à
 * prévia em tela cheia (/exemplos/:seoSlug) — exatamente como quem recebe o
 * link vai ver. A foto de capa (1ª do payload) entra ao fundo, esmaecida.
 */
export function ExampleCard({ seoSlug, payload }: { seoSlug: string; payload: GiftPayload }) {
  const { title, recipientName, senderName } = payload;
  const cover = (payload.assets ?? []).find((a) => a.type === 'image' && assetUrl(a));

  return (
    <Link
      href={`/exemplos/${seoSlug}`}
      aria-label={`Ver a rebobinada: ${title ?? 'exemplo'}`}
      className="rb-scanlines rb-vignette group relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-tape-2 transition hover:border-cyan"
    >
      {cover && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={assetUrl(cover)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-300 group-hover:opacity-40"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-tape via-tape/40 to-transparent" />

      <Osd left="● PLAY" right="◄◄ REBOBINAÍ" />

      <div className="relative z-10 flex flex-1 flex-col px-6 py-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="rb-chroma font-display text-2xl font-bold leading-tight text-glow sm:text-3xl">
            {title || 'A nossa história'}
          </h2>
          {(recipientName || senderName) && (
            <p className="mt-3 font-mono text-[0.7rem] tracking-[0.2em] text-dim">
              {recipientName ? `para ${recipientName}` : ''}
              {recipientName && senderName ? ' · ' : ''}
              {senderName ? `de ${senderName}` : ''}
            </p>
          )}
          <div className="rb-tracking-bar mt-6 w-32" aria-hidden />
        </div>

        <div className="flex items-center justify-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cyan transition group-hover:text-glow">
          <span className="text-base leading-none">▶</span> ver a rebobinada
        </div>
      </div>
    </Link>
  );
}
