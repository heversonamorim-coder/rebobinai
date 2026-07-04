'use client';

import QRCode from 'qrcode';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  assetUrl,
  defaultCounterLabel,
  type GiftAsset,
  type GiftCounter,
  type GiftPayload,
} from '../lib/gift';
import { spotifyEmbedUrl } from '../lib/spotify';
import { CountdownTimecode } from './countdown-timecode';
import { Lightbox } from './lightbox';
import { WrappedStats } from './wrapped-stats';

type SlideKind = 'cover' | 'photos' | 'timeline' | 'wrapped' | 'music' | 'closing' | 'share';

export interface StoriesViewerProps {
  payload: GiftPayload;
  /** Ocasião — guardada, mas não exibida na rebobinada (uso futuro). */
  occasion?: string | null;
  assets?: GiftAsset[];
  /** Marca d'água de prévia (rascunho não pago). */
  watermark?: boolean;
  /** Prévia acompanha o passo atual do editor: pula pro slide correspondente. */
  focus?: SlideKind;
  /** Ocupa a tela toda (página pública /p): full no celular, retrato no desktop. */
  fullscreen?: boolean;
  /**
   * URL pública do presente. Quando presente (página do destinatário), habilita
   * o último slide de compartilhar como story no Instagram (Tarefa 4).
   */
  shareUrl?: string;
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
  occasion,
  assets,
  watermark = false,
  focus,
  fullscreen = false,
  shareUrl,
}: StoriesViewerProps) {
  const photos = useMemo(
    () => (assets ?? []).filter((a) => a.type === 'image' && assetUrl(a)).map((a) => ({ id: a.id, url: assetUrl(a) })),
    [assets],
  );
  const embed = spotifyEmbedUrl(payload.spotifyTrackUrl);

  const stats = payload.stats ?? [];
  const counterLabel = payload.counter?.label || defaultCounterLabel(occasion);
  // Wrapped existe se há stat manual OU (data preenchida + card automático).
  const hasWrapped =
    stats.some((s) => !s.auto) ||
    (Boolean(payload.counter?.targetDate) && stats.some((s) => s.auto));

  const closingMessage = payload.closingMessage?.trim();

  const slides = useMemo<Slide[]>(() => {
    // A história (título + recado) fica na própria capa — não vira slide à parte.
    const s: Slide[] = [{ key: 'cover', kind: 'cover' }];
    if (photos.length > 0) s.push({ key: 'photos', kind: 'photos' });
    if ((payload.timeline ?? []).length > 0) s.push({ key: 'timeline', kind: 'timeline' });
    // Wrapped fica logo APÓS a linha do tempo (não mistura com os momentos).
    if (hasWrapped) s.push({ key: 'wrapped', kind: 'wrapped' });
    if (embed) s.push({ key: 'music', kind: 'music' });
    // Recado final (Tarefa 3) — fecho da rebobinada.
    if (closingMessage) s.push({ key: 'closing', kind: 'closing' });
    // Compartilhar como story (Tarefa 4) — só pra quem recebe (tem shareUrl).
    if (shareUrl) s.push({ key: 'share', kind: 'share' });
    return s;
  }, [payload.timeline, photos.length, hasWrapped, embed, closingMessage, shareUrl]);

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

  // Tela cheia (/p): preenche o celular; no desktop vira um retrato centralizado.
  const frameClass = fullscreen
    ? 'rb-scanlines rb-vignette relative mx-auto flex h-svh w-full select-none flex-col overflow-hidden bg-tape-2 sm:h-[calc(100svh-3rem)] sm:max-h-[860px] sm:max-w-md sm:rounded-2xl sm:border sm:border-[var(--line)]'
    : 'rb-scanlines rb-vignette relative mx-auto flex h-[70svh] max-h-[680px] w-full max-w-md select-none flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-tape-2';

  return (
    <div className={frameClass} onClick={onFrameClick}>
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
          <CoverSlide
            payload={payload}
            counterLabel={counterLabel}
            hasNext={slides.length > 1}
            onPlay={() => go(1)}
          />
        )}
        {slide?.kind === 'photos' && (
          <PhotosSlide photos={photos} onOpen={(i) => setLightbox(i)} />
        )}
        {slide?.kind === 'timeline' && (
          <TimelineSlide items={payload.timeline ?? []} assets={assets ?? []} />
        )}
        {slide?.kind === 'wrapped' && (
          <WrappedStats stats={stats} targetDate={payload.counter?.targetDate} />
        )}
        {slide?.kind === 'music' && embed && <MusicSlide embedUrl={embed} />}
        {slide?.kind === 'closing' && closingMessage && (
          <ClosingSlide message={closingMessage} senderName={payload.senderName} />
        )}
        {slide?.kind === 'share' && shareUrl && (
          <ShareSlide
            shareUrl={shareUrl}
            title={payload.title}
            recipientName={payload.recipientName}
          />
        )}
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
  counterLabel,
  hasNext,
  onPlay,
}: {
  payload: GiftPayload;
  counterLabel: string;
  hasNext: boolean;
  onPlay: () => void;
}) {
  const { title, recipientName, senderName, letter, counter } = payload as GiftPayload & {
    counter?: GiftCounter;
  };
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
      {counter?.targetDate && (
        <div className="mt-6">
          <CountdownTimecode targetDate={counter.targetDate} label={counterLabel} />
        </div>
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

/** Slide de recado final (Tarefa 3) — o fecho da rebobinada. */
function ClosingSlide({ message, senderName }: { message: string; senderName?: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center text-center">
      <p className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        pra fechar
      </p>
      <p className="rb-chroma max-w-prose whitespace-pre-wrap font-display text-2xl font-semibold leading-snug text-glow sm:text-3xl">
        {message}
      </p>
      {senderName && (
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-dim">— {senderName}</p>
      )}
      <p className="mt-8 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/60">◄◄</p>
    </div>
  );
}

/**
 * Último slide (Tarefa 4) — só aparece pra quem recebe (tem shareUrl). Permite
 * compartilhar a rebobinada como story no Instagram: usa a Web Share API
 * (abre a folha nativa do celular → Instagram) e oferece baixar uma imagem
 * 1080×1920 pronta pro story, com o QR do presente.
 */
function ShareSlide({
  shareUrl,
  title,
  recipientName,
}: {
  shareUrl: string;
  title?: string;
  recipientName?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  async function share() {
    const data = {
      title: title || 'A nossa rebobinada ◄◄',
      text: `${title || 'Olha a nossa história'} ◄◄`,
      url: shareUrl,
    };
    try {
      if (navigator.share) await navigator.share(data);
      else await copy();
    } catch {
      /* usuário cancelou ou share indisponível — ignora */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  }

  async function downloadStoryImage() {
    setBusy(true);
    try {
      const dataUrl = await buildStoryImage(shareUrl, title, recipientName);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'rebobinai-story.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      /* falhou ao gerar — o botão de compartilhar segue disponível */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center text-center">
      <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        gostou? compartilha ◄◄
      </p>
      <h2 className="rb-chroma font-display text-2xl font-bold leading-tight text-glow sm:text-3xl">
        Poste no seu story
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-glow/80">
        Baixe a imagem pronta pro story do Instagram ou compartilhe o link com quem você ama.
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <button
          type="button"
          data-interactive
          onClick={downloadStoryImage}
          disabled={busy}
          className="w-full rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? 'gerando imagem…' : '📸 baixar imagem pro story'}
        </button>
        {canShare && (
          <button
            type="button"
            data-interactive
            onClick={share}
            className="w-full rounded-lg border border-cyan px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-cyan transition hover:bg-cyan hover:text-tape"
          >
            compartilhar link
          </button>
        )}
        <button
          type="button"
          data-interactive
          onClick={copy}
          className="w-full rounded-lg border border-[var(--line)] px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-dim transition hover:border-cyan hover:text-cyan"
        >
          {copied ? '✓ link copiado' : 'copiar link'}
        </button>
      </div>

      <p className="mt-6 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/60">
        ◄◄ rebobinaí
      </p>
    </div>
  );
}

/**
 * Monta uma imagem 1080×1920 (formato story) no canvas: fundo da marca, título,
 * QR do presente e chamada pra apontar a câmera. Sem libs extras — usa o
 * `qrcode` já presente. Devolve um data URL PNG.
 */
async function buildStoryImage(
  shareUrl: string,
  title?: string,
  recipientName?: string,
): Promise<string> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas indisponível');

  // Fundo — degradê da marca (tape → magenta/roxo sutil).
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0A0713');
  bg.addColorStop(0.55, '#150b26');
  bg.addColorStop(1, '#1c1033');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Scanlines sutis.
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);

  ctx.textAlign = 'center';

  // Selo topo.
  ctx.fillStyle = '#18E9FF';
  ctx.font = '600 34px "Space Mono", monospace';
  ctx.fillText('◄◄ REBOBINAÍ', W / 2, 220);

  // Título (quebra em linhas).
  ctx.fillStyle = '#F1ECFF';
  const heading = title || 'A nossa história';
  wrapText(ctx, heading, W / 2, 560, W - 200, 96, 'bold 84px "Chakra Petch", sans-serif');

  // Subtítulo.
  ctx.fillStyle = 'rgba(241,236,255,0.85)';
  ctx.font = '400 40px "Space Grotesk", sans-serif';
  ctx.fillText(
    recipientName ? `feito com amor pra ${recipientName}` : 'aperta o play e se emociona',
    W / 2,
    900,
  );

  // QR num cartão claro.
  const qrSize = 520;
  const qrX = (W - qrSize) / 2;
  const qrY = 1040;
  const pad = 48;
  roundRect(ctx, qrX - pad, qrY - pad, qrSize + pad * 2, qrSize + pad * 2, 40);
  ctx.fillStyle = '#F1ECFF';
  ctx.fill();
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, shareUrl, {
    margin: 0,
    width: qrSize,
    color: { dark: '#0A0713', light: '#F1ECFF' },
  });
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // Chamada embaixo.
  ctx.fillStyle = '#18E9FF';
  ctx.font = '600 40px "Space Mono", monospace';
  ctx.fillText('aponte a câmera pra ver', W / 2, qrY + qrSize + pad + 120);

  ctx.fillStyle = 'rgba(241,236,255,0.55)';
  ctx.font = '400 32px "Space Grotesk", sans-serif';
  ctx.fillText('rebobinai.app', W / 2, H - 120);

  return canvas.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font: string,
) {
  ctx.font = font;
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  // Centraliza verticalmente o bloco em torno de y.
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
