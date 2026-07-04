'use client';

import { Logo, Mark } from '@rebobinai/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const COUNT = 3;
const INTERVAL = 6500;

/**
 * Carrossel do hero: 1) a marca (institucional), 2) Dia dos Pais, 3) namorados.
 * Slides 2 e 3 têm foto de fundo com o "filtro Rebobinaí" (duotone + grain +
 * scanlines + aberração). Auto-rotação pausa em hover/touch e quando a aba
 * perde foco; dots clicáveis; swipe no mobile; respeita prefers-reduced-motion.
 */
export function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => {
      // não avança com a aba em segundo plano
      if (!document.hidden) setI((x) => (x + 1) % COUNT);
    }, INTERVAL);
    return () => clearInterval(t);
  }, [paused, reduced]);

  function go(n: number) {
    setI(((n % COUNT) + COUNT) % COUNT);
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        setPaused(false);
        if (start == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      }}
    >
      <div key={i} className="rb-fade-in absolute inset-0">
        {i === 0 && <SlideMarca />}
        {i === 1 && (
          <ImageSlide
            src="/hero/dia-dos-pais.webp"
            alt="Pai e filho caminhando abraçados num parque ao entardecer"
            kicker="pra o pai"
            title="Pro seu pai, algo que ele nunca viu"
            copy="Nada de gravata. Rebobine a história de vocês num presente digital e criativo — dos causos antigos ao orgulho de hoje."
            cta="criar pro meu pai ►"
          />
        )}
        {i === 2 && (
          <ImageSlide
            src="/hero/casal.webp"
            alt="Casal abraçado no sofá olhando pela janela ao pôr do sol"
            kicker="pra namorada · namorado"
            title="Um presente que rebobina vocês dois"
            copy="Fuja do óbvio. Monte a linha do tempo de vocês — fotos, recado e a música que é a cara do casal — e veja a pessoa se emocionar do play ao fim."
            cta="criar pra quem eu amo ►"
          />
        )}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {Array.from({ length: COUNT }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Ir para o slide ${idx + 1}`}
            aria-current={i === idx}
            onClick={() => go(idx)}
            className={`h-2 rounded-full transition-all ${
              i === idx ? 'w-6 bg-cyan' : 'w-2 bg-glow/25 hover:bg-glow/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Slide 1 — a marca, idêntico ao hero original (sem foto). */
function SlideMarca() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
      <div className="rb-vhs-tilt flex flex-col items-center gap-6">
        <Mark size={104} />
        <Logo size="hero" />
      </div>
      <p className="rb-tagline mt-8">
        <span className="rb-rew">◄◄</span> rebobina a nossa história{' '}
        <b className="font-normal text-[var(--magenta)]">· com IA</b>
      </p>
      <Link
        href="/criar"
        className="mt-12 rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
      >
        criar meu presente ►
      </Link>
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-dim">
        grátis pra criar e ver a prévia
      </p>
    </div>
  );
}

/**
 * Slide com foto de fundo + filtro Rebobinaí. O texto fica à esquerda, sobre o
 * gradiente escuro (contraste garantido); a imagem "respira" à direita.
 */
function ImageSlide({
  src,
  alt,
  kicker,
  title,
  copy,
  cta,
}: {
  src: string;
  alt: string;
  kicker: string;
  title: string;
  copy: string;
  cta: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Foto crua (grayscale pro duotone). Lazy — protege o LCP do slide 1.
          fill + sizes: o Next serve AVIF/WebP dimensionado por breakpoint. */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover object-[68%_center] [filter:grayscale(1)_contrast(1.05)_brightness(0.95)]"
      />

      {/* Duotone da marca (magenta → ciano) sobre o cinza */}
      <div className="absolute inset-0 bg-gradient-to-br from-magenta to-cyan opacity-80 mix-blend-color" />
      {/* Aprofunda as sombras rumo ao #0A0713 */}
      <div className="absolute inset-0 bg-tape opacity-40 mix-blend-multiply" />
      {/* Grain + scanlines + aberração nas bordas */}
      <div className="rb-hero-grain pointer-events-none absolute inset-0" />
      <div className="rb-scanlines pointer-events-none absolute inset-0" />
      <div className="rb-hero-aberration pointer-events-none absolute inset-0" />
      {/* Gradiente escuro do lado do texto */}
      <div className="rb-hero-fade pointer-events-none absolute inset-0" />
      {/* Vinheta inferior pra dots/scroll ficarem legíveis */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-tape/80 to-transparent" />

      {/* Copy — à esquerda, dentro da zona escura */}
      <div className="relative z-10 flex h-full max-w-2xl flex-col items-start justify-center px-6 text-left sm:px-12 lg:px-20">
        <Mark size={56} />
        <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">{kicker}</p>
        <h2 className="rb-chroma mt-3 font-display text-3xl font-bold leading-tight text-glow sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-glow/85 sm:text-base">{copy}</p>
        <Link
          href="/criar"
          className="mt-8 rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
