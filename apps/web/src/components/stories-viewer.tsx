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

type SlideKind =
  | 'cover'
  | 'photos'
  | 'timeline'
  | 'wrapped'
  | 'music'
  | 'map'
  | 'astro'
  | 'roulette'
  | 'closing'
  | 'share';

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
  const closingPhoto = useMemo(() => {
    const a = payload.closingPhotoAssetId
      ? (assets ?? []).find((x) => x.id === payload.closingPhotoAssetId)
      : undefined;
    return a ? assetUrl(a) : '';
  }, [assets, payload.closingPhotoAssetId]);
  const hasClosing = Boolean(closingMessage || closingPhoto);

  const rouletteOptions = useMemo(
    () => (payload.roulette?.options ?? []).map((o) => o.trim()).filter(Boolean),
    [payload.roulette],
  );
  const hasRoulette = rouletteOptions.length >= 2;
  const metAddress = payload.metPlace?.address?.trim();
  const astroDate = payload.astro?.date;

  const slides = useMemo<Slide[]>(() => {
    // A história (título + recado) fica na própria capa — não vira slide à parte.
    const s: Slide[] = [{ key: 'cover', kind: 'cover' }];
    if (photos.length > 0) s.push({ key: 'photos', kind: 'photos' });
    if ((payload.timeline ?? []).length > 0) s.push({ key: 'timeline', kind: 'timeline' });
    // Wrapped fica logo APÓS a linha do tempo (não mistura com os momentos).
    if (hasWrapped) s.push({ key: 'wrapped', kind: 'wrapped' });
    if (embed) s.push({ key: 'music', kind: 'music' });
    // Extras "Capriche+" (Tarefa 4): mapa do local, mapa astral, roleta.
    if (metAddress) s.push({ key: 'map', kind: 'map' });
    if (astroDate) s.push({ key: 'astro', kind: 'astro' });
    if (hasRoulette) s.push({ key: 'roulette', kind: 'roulette' });
    // Recado final (Tarefa 3/4) — fecho da rebobinada (mensagem e/ou foto).
    if (hasClosing) s.push({ key: 'closing', kind: 'closing' });
    // Compartilhar como story (Tarefa 4) — só pra quem recebe (tem shareUrl).
    if (shareUrl) s.push({ key: 'share', kind: 'share' });
    return s;
  }, [payload.timeline, photos.length, hasWrapped, embed, metAddress, astroDate, hasRoulette, hasClosing, shareUrl]);

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
        {slide?.kind === 'map' && metAddress && <MapSlide address={metAddress} />}
        {slide?.kind === 'astro' && astroDate && <AstroSlide date={astroDate} />}
        {slide?.kind === 'roulette' && hasRoulette && <RouletteSlide options={rouletteOptions} />}
        {slide?.kind === 'closing' && hasClosing && (
          <ClosingSlide
            message={closingMessage}
            photoUrl={closingPhoto}
            senderName={payload.senderName}
          />
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

/**
 * Slide do mapa do local (Tarefa 4). Com uma chave do Google Maps Embed
 * (NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY) mostra o mapa interativo; sem chave, cai
 * num cartão com o endereço + botão que abre no Google Maps (sem chave).
 */
function MapSlide({ address }: { address: string }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const search = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-2 text-center">
      <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        onde tudo começou
      </p>
      <p className="mb-4 font-display text-lg text-glow">{address}</p>
      {key ? (
        <iframe
          data-interactive
          title="Mapa do local"
          className="h-64 w-full rounded-xl border border-[var(--line)]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(address)}`}
        />
      ) : (
        <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-[var(--line)] bg-panel/40 p-8">
          <span className="text-5xl">📍</span>
          <a
            data-interactive
            href={search}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
          >
            abrir no mapa ►
          </a>
        </div>
      )}
    </div>
  );
}

/** Signo (sol) a partir de uma data AAAA-MM-DD, em pt-BR. */
function zodiacFor(dateStr: string) {
  const parts = dateStr.split('-');
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const signs = [
    { until: [1, 19], sym: '♑', pt: 'Capricórnio', range: '22 dez – 19 jan', blurb: 'Determinação que constrói pra durar.' },
    { until: [2, 18], sym: '♒', pt: 'Aquário', range: '20 jan – 18 fev', blurb: 'Original, livre e cheio de ideias.' },
    { until: [3, 20], sym: '♓', pt: 'Peixes', range: '19 fev – 20 mar', blurb: 'Sensível, sonhador e romântico.' },
    { until: [4, 19], sym: '♈', pt: 'Áries', range: '21 mar – 19 abr', blurb: 'Fogo, coragem e paixão no talo.' },
    { until: [5, 20], sym: '♉', pt: 'Touro', range: '20 abr – 20 mai', blurb: 'Carinho firme e amor de raiz.' },
    { until: [6, 20], sym: '♊', pt: 'Gêmeos', range: '21 mai – 20 jun', blurb: 'Papo bom que nunca acaba.' },
    { until: [7, 22], sym: '♋', pt: 'Câncer', range: '21 jun – 22 jul', blurb: 'Aconchego e coração enorme.' },
    { until: [8, 22], sym: '♌', pt: 'Leão', range: '23 jul – 22 ago', blurb: 'Brilho, calor e lealdade.' },
    { until: [9, 22], sym: '♍', pt: 'Virgem', range: '23 ago – 22 set', blurb: 'Cuidado nos detalhes que importam.' },
    { until: [10, 22], sym: '♎', pt: 'Libra', range: '23 set – 22 out', blurb: 'Parceria, equilíbrio e charme.' },
    { until: [11, 21], sym: '♏', pt: 'Escorpião', range: '23 out – 21 nov', blurb: 'Intensidade e entrega total.' },
    { until: [12, 21], sym: '♐', pt: 'Sagitário', range: '22 nov – 21 dez', blurb: 'Aventura de mãos dadas.' },
    { until: [12, 31], sym: '♑', pt: 'Capricórnio', range: '22 dez – 19 jan', blurb: 'Determinação que constrói pra durar.' },
  ];
  for (const s of signs) {
    if (m < s.until[0]! || (m === s.until[0] && d <= s.until[1]!)) return s;
  }
  return signs[0]!;
}

/** Slide do "mapa astral" simples (Tarefa 4): signo da data + visual estelar. */
function AstroSlide({ date }: { date: string }) {
  const z = zodiacFor(date);
  const stars = [
    [18, 22],
    [78, 30],
    [30, 74],
    [70, 78],
    [50, 12],
    [12, 52],
    [88, 60],
  ];
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-2 text-center">
      <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        o mapa astral de vocês
      </p>
      <div className="relative my-4 flex h-40 w-40 items-center justify-center rounded-full border border-cyan/40 bg-[radial-gradient(circle_at_center,rgba(24,233,255,0.12),transparent_70%)]">
        {stars.map(([x, y], i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-glow/70"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))}
        <span className="rb-chroma text-6xl leading-none text-glow">{z.sym}</span>
      </div>
      <p className="font-display text-2xl font-bold text-glow">{z.pt}</p>
      <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan">{z.range}</p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-glow/80">{z.blurb}</p>
    </div>
  );
}

/**
 * Slide da roleta (Tarefa 4): quem recebe clica em "girar" no centro; a roleta
 * gira e para aleatoriamente numa opção. Roda 100% no cliente (SVG + rotação).
 */
function RouletteSlide({ options }: { options: string[] }) {
  const opts = options.slice(0, 12);
  const n = opts.length;
  const seg = 360 / n;
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function spin() {
    if (spinning) return;
    const k = Math.floor(Math.random() * n);
    setResult(null);
    setSpinning(true);
    // Rotação (graus, horário) que traz o centro do gomo k pro ponteiro (topo).
    const desired = ((360 - (k + 0.5) * seg) % 360 + 360) % 360;
    const currentMod = ((rot % 360) + 360) % 360;
    const delta = (desired - currentMod + 360) % 360;
    const newRot = rot + 360 * 6 + delta;
    setRot(newRot);
    timer.current = setTimeout(() => {
      setSpinning(false);
      setResult(k);
    }, 4300);
  }

  const colors = ['#FF2E9A', '#18E9FF'];
  return (
    <div className="flex min-h-full flex-col items-center justify-center py-2 text-center">
      <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">a roleta de vocês</p>
      <p className="mb-4 text-sm text-glow/80">Gira e sorteia o que vão fazer ◄◄</p>

      <div className="relative" data-interactive>
        {/* Ponteiro fixo no topo */}
        <svg width="240" height="240" viewBox="0 0 200 200" className="max-w-[70vw]">
          <polygon points="100,2 92,20 108,20" fill="#F1ECFF" />
          <g
            style={{
              transformOrigin: '100px 100px',
              transform: `rotate(${rot}deg)`,
              transition: 'transform 4.2s cubic-bezier(0.16, 0.84, 0.3, 1)',
            }}
          >
            {opts.map((label, i) => {
              const a0 = (i * seg * Math.PI) / 180;
              const a1 = ((i + 1) * seg * Math.PI) / 180;
              const x0 = 100 + 88 * Math.sin(a0);
              const y0 = 100 - 88 * Math.cos(a0);
              const x1 = 100 + 88 * Math.sin(a1);
              const y1 = 100 - 88 * Math.cos(a1);
              const large = seg > 180 ? 1 : 0;
              const am = (i + 0.5) * seg;
              // O flip precisa considerar a rotação da roda (rot), não só o
              // ângulo estático do gomo: como a roda inteira gira, decidir pelo
              // ângulo NA TELA (am + rot) mantém as labels de pé onde a roda
              // para — senão metade fica de cabeça pra baixo após girar.
              const screenAngle = (((am + rot) % 360) + 360) % 360;
              const flip = screenAngle > 90 && screenAngle < 270;
              const short = label.length > 14 ? `${label.slice(0, 13)}…` : label;
              return (
                <g key={i}>
                  <path
                    d={`M100 100 L ${x0.toFixed(2)} ${y0.toFixed(2)} A 88 88 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`}
                    fill={colors[i % colors.length]}
                    stroke="#0A0713"
                    strokeWidth="1"
                  />
                  <g transform={`rotate(${am} 100 100)`}>
                    <text
                      x="100"
                      y="46"
                      textAnchor="middle"
                      fontSize="8"
                      fontFamily="var(--body)"
                      fontWeight="600"
                      fill="#0A0713"
                      transform={flip ? 'rotate(180 100 46)' : undefined}
                    >
                      {short}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
          {/* Botão central "girar" */}
          <g
            role="button"
            tabIndex={0}
            onClick={spin}
            style={{ cursor: spinning ? 'default' : 'pointer' }}
          >
            <circle cx="100" cy="100" r="24" fill="#0A0713" stroke="#F1ECFF" strokeWidth="2" />
            <text x="100" y="103" textAnchor="middle" fontSize="9" fontFamily="var(--display)" fontWeight="700" fill="#F1ECFF">
              {spinning ? '...' : 'GIRAR'}
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-4 h-8">
        {result !== null && (
          <p className="rb-fade-in font-display text-lg font-bold text-cyan">→ {opts[result]}</p>
        )}
      </div>
    </div>
  );
}

/** Slide de recado final (Tarefa 3/4) — o fecho da rebobinada, com foto opcional. */
function ClosingSlide({
  message,
  photoUrl,
  senderName,
}: {
  message?: string;
  photoUrl?: string;
  senderName?: string;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center text-center">
      <p className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
        pra fechar
      </p>
      {photoUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={photoUrl}
          alt=""
          className="mb-6 max-h-56 w-auto max-w-full rounded-xl border border-[var(--line)] object-cover"
        />
      )}
      {message && (
        <p className="rb-chroma max-w-prose whitespace-pre-wrap font-display text-2xl font-semibold leading-snug text-glow sm:text-3xl">
          {message}
        </p>
      )}
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
