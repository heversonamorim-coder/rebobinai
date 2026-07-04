'use client';

import { Logo, Mark } from '@rebobinai/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const COUNT = 3;
const INTERVAL = 6500;

/**
 * Carrossel do hero: 1) a marca (como sempre), 2) chamada pra namorada/namorado,
 * 3) chamada pro pai. Auto-avança, pausa no hover e tem indicadores (dots).
 */
export function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % COUNT), INTERVAL);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="flex w-full flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div key={i} className="rb-fade-in flex flex-col items-center">
        {i === 0 && <SlideMarca />}
        {i === 1 && (
          <AdSlide
            kicker="pra namorada · namorado"
            title="Um presente que rebobina vocês dois"
            copy="Fuja do óbvio. Monte a linha do tempo de vocês — fotos, recado e a música que é a cara do casal — e veja a pessoa se emocionar do play ao fim."
            cta="criar pra quem eu amo ►"
          />
        )}
        {i === 2 && (
          <AdSlide
            kicker="pra o pai"
            title="Pro seu pai, algo que ele nunca viu"
            copy="Nada de gravata. Rebobine a história de vocês num presente digital e criativo — dos causos antigos ao orgulho de hoje."
            cta="criar pro meu pai ►"
          />
        )}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2.5">
        {Array.from({ length: COUNT }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Ir para o slide ${idx + 1}`}
            aria-current={i === idx}
            onClick={() => setI(idx)}
            className={`h-2 rounded-full transition-all ${
              i === idx ? 'w-6 bg-cyan' : 'w-2 bg-glow/25 hover:bg-glow/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/** Slide 1 — a marca, idêntico ao hero original. */
function SlideMarca() {
  return (
    <>
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
    </>
  );
}

function AdSlide({
  kicker,
  title,
  copy,
  cta,
}: {
  kicker: string;
  title: string;
  copy: string;
  cta: string;
}) {
  return (
    <div className="flex max-w-2xl flex-col items-center">
      <Mark size={64} />
      <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">{kicker}</p>
      <h2 className="rb-chroma mt-3 font-display text-3xl font-bold leading-tight text-glow sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-dim sm:text-lg">{copy}</p>
      <Link
        href="/criar"
        className="mt-10 rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
      >
        {cta}
      </Link>
    </div>
  );
}
