'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { assetUrl, type GiftAsset, type GiftPayload } from '../lib/gift';
import { spotifyEmbedUrl } from '../lib/spotify';
import { Lightbox } from './lightbox';

type SlideKind = 'cover' | 'photos' | 'timeline' | 'music';

export interface StoriesViewerProps {
  payload: GiftPayload;
  /** Ocasião — guardada, mas não exibida na rebobinada (uso futuro). */
  occasion?: string | null;
  assets?: GiftAsset[];
  /** Marca d'água de prévia (rascunho não pago). */
  watermark?: boolean;
  /** Prévia acompanha o passo atual do editor: pula pro slide correspondente. */
  focus?: SlideKind;
}

type Slide = { key: string; kind: SlideKind };

/**
 * A rebobinada navegável no estilo "stories" do Instagram: cada seção é um
 * slide. Toque/clique na porção esquerda volta, na direita avança; o conteúdo
 * rola na vertical quando é maior que a tela. O slide de capa tem um ▶ play.
 * Usado na prévia da criação e na página pública /p/:slug.
 */
export function StoriesViewer({
  payload,
  assets,
  watermark = false,
  focus,
}: StoriesViewerProps) {
  const photos = useMemo(
    () => (assets ?? []).filter((a) => a.type === 'image' && assetUrl(a)).map((a) => ({ id: a.id, url: assetUrl(a) })),
    [assets],
  );
  const embed = spotifyEmbedUrl(payload.spotifyTrackUrl);

  const slides = useMemo<Slide[]>(() => {
    // A história (título + recado) fica na própria capa — não vira slide à parte.
    const s: Slide[] = [{ key: 'cover', kind: 'cover' }];
    if (photos.length > 0) s.push({ key: 'photos', kind: 'photos' });
    if ((payload.timeline ?? []).length > 0) s.push({ key: 'timeline', kind: 'timeline' });
    if (embed) s.push({ key: 'music', kind: 'music' });
    return s;
  }, [payload.timeline, photos.length, embed]);

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Se o número de slides muda (editor ao vivo), mantém o índice válido.
  const clamped = Math.min(index, slides.length - 1);
  useEffect(() => {
    if (index !== clamped) setIndex(clamped);
  }, [index, clamped]);

  // Prévia acompanha o passo do editor: pula pro slide da seção em foco — tanto
  // ao trocar de passo quanto quando aquela seção passa a existir (ex.: colou o
  // link do Spotify e o slide de trilha aparece).
  useEffect(() => {
    if (!focus) return;
    const i = slides.findIndex((s) => s.kind === focus);
    if (i >= 0) setIndex(i);
  }, [focus, slides]);

  // Ao trocar de slide, volta o scroll pro topo.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [clamped]);

  function go(dir: -1 | 1) {
    setIndex((i) => Math.max(0, Math.min(slides.length - 1, i + dir)));
  }

  // Clique na porção esquerda/direita navega; o miolo é livre pra rolar e
  // interagir. Elementos interativos marcam data-interactive e são ignorados.
  function onFrameClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('[data-interactive]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (x < 0.32) go(-1);
    else if (x > 0.68) go(1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightbox !== null) return; // o lightbox trata suas próprias setas
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, slides.length]);

  const slide = slides[clamped];

  return (
    <div
      className="rb-scanlines rb-vignette relative mx-auto flex h-[70svh] max-h-[680px] w-full max-w-md select-none flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-tape-2"
      onClick={onFrameClick}
    >
      {/* Barra de progresso segmentada (um traço por slide) */}
      <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-3 pt-3">
        {slides.map((s, i) => (
          <span key={s.key} className="h-1 flex-1 overflow-hidden rounded-full bg-glow/15">
            <span
              className="block h-full rounded-full bg-cyan transition-all duration-300"
              style={{ width: i <= clamped ? '100%' : '0%' }}
            />
          </span>
        ))}
      </div>

      {/* Rótulos do OSD — abaixo da barra pra não sobrepor os textos */}
      <div className="rb-osd pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-between px-6 sm:px-8">
        <span className="rb-rec">● PLAY</span>
        <span>◄◄ REBOBINAÍ</span>
      </div>

      {/* Conteúdo do slide (rola na vertical) */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 pb-10 pt-20 sm:px-8">
        {slide?.kind === 'cover' && (
          <CoverSlide payload={payload} hasNext={slides.length > 1} onPlay={() => go(1)} />
        )}
        {slide?.kind === 'photos' && (
          <PhotosSlide photos={photos} onOpen={(i) => setLightbox(i)} />
        )}
        {slide?.kind === 'timeline' && (
          <TimelineSlide items={payload.timeline ?? []} assets={assets ?? []} />
        )}
        {slide?.kind === 'music' && embed && <MusicSlide embedUrl={embed} />}
      </div>

      {/* Setas de navegação — botões sempre clicáveis (funcionam até sobre o
          iframe do Spotify, onde as zonas de toque não alcançam). */}
      {clamped > 0 && (
        <button
          type="button"
          data-interactive
          onClick={() => go(-1)}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-tape/60 font-display text-lg text-glow/70 hover:text-cyan"
        >
          ‹
        </button>
      )}
      {clamped < slides.length - 1 && (
        <button
          type="button"
          data-interactive
          onClick={() => go(1)}
          aria-label="Próximo"
          className="absolute right-2 top-1/2 z-30 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-tape/60 font-display text-lg text-glow/70 hover:text-cyan"
        >
          ›
        </button>
      )}

      {watermark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 flex select-none flex-wrap content-center items-center justify-center gap-x-10 gap-y-8 opacity-[0.14]"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="-rotate-[24deg] font-display text-lg font-bold uppercase tracking-[0.3em] text-glow"
            >
              ◄◄ prévia · rebobinaí
            </span>
          ))}
        </div>
      )}

      {lightbox !== null && photos.length > 0 && (
        <Lightbox
          photos={photos}
          index={lightbox}
          onIndex={(i) => setLightbox(i)}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function CoverSlide({
  payload,
  hasNext,
  onPlay,
}: {
  payload: GiftPayload;
  hasNext: boolean;
  onPlay: () => void;
}) {
  const { title, recipientName, senderName, letter } = payload;
  return (
    <div className="flex min-h-full flex-col items-center justify-center text-center">
      <h1 className="rb-chroma font-display text-3xl font-bold leading-tight text-glow sm:text-4xl">
        {title || 'A nossa história'}
      </h1>
      {(recipientName || senderName) && (
        <p className="mt-4 font-mono text-xs tracking-[0.2em] text-dim">
          {recipientName ? `para ${recipientName}` : ''}
          {recipientName && senderName ? ' · ' : ''}
          {senderName ? `de ${senderName}` : ''}
        </p>
      )}
      {letter?.trim() && (
        <p className="mt-6 max-w-prose whitespace-pre-wrap text-base leading-relaxed text-glow/90">
          {letter}
        </p>
      )}
      {hasNext && (
        <button
          type="button"
          data-interactive
          onClick={onPlay}
          className="mt-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan text-cyan transition hover:scale-105 hover:bg-cyan/10"
          aria-label="Tocar a rebobinada"
        >
          <span className="ml-1 text-2xl">▶</span>
        </button>
      )}
      <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/70">
        aperta o play ◄◄
      </p>
    </div>
  );
}

function PhotosSlide({
  photos,
  onOpen,
}: {
  photos: { id: string; url: string }[];
  onOpen: (i: number) => void;
}) {
  return (
    <div className="py-2">
      <p className="mb-5 text-center font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        as fotos
      </p>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={p.id}
            src={p.url}
            alt=""
            data-interactive
            onClick={() => onOpen(i)}
            className="aspect-square w-full cursor-pointer rounded-lg border border-[var(--line)] object-cover transition hover:brightness-110"
          />
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/70">
        toque numa foto pra ampliar
      </p>
    </div>
  );
}

function TimelineSlide({ items, assets }: { items: GiftPayload['timeline']; assets: GiftAsset[] }) {
  const byId = new Map(assets.map((a) => [a.id, a]));
  return (
    <div className="py-2">
      <p className="mb-6 text-center font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        linha do tempo
      </p>
      <ol className="space-y-6">
        {(items ?? []).map((item, i) => {
          const asset = item.photoAssetId ? byId.get(item.photoAssetId) : undefined;
          const photo = asset ? assetUrl(asset) : '';
          return (
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
              {photo && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={photo}
                  alt=""
                  className="mt-3 max-h-56 w-full rounded-lg border border-[var(--line)] object-cover"
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MusicSlide({ embedUrl }: { embedUrl: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-4">
      <p className="mb-6 text-center font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        a nossa trilha
      </p>
      <iframe
        data-interactive
        title="Spotify"
        src={embedUrl}
        width="100%"
        height="352"
        frameBorder="0"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        className="rounded-xl"
      />
    </div>
  );
}
