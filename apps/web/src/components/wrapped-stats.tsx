'use client';

import { useEffect, useRef, useState } from 'react';
import { daysSince, type GiftStat } from '../lib/gift';

interface ResolvedStat {
  key: string;
  value: number | null; // null = sem count-up (ex.: "∞")
  suffix?: string;
  label: string;
}

/**
 * "Os números de vocês" (wrapped) — seção separada, logo após a linha do tempo.
 * Números grandes com count-up disparado por IntersectionObserver, em stagger.
 * Valor em magenta, legenda em ciano. Sufixo "∞" pula o count-up. Cabe num
 * print 9:16, com a marca ◄◄ rebobinaí discreta no rodapé.
 */
export function WrappedStats({ stats, targetDate }: { stats: GiftStat[]; targetDate?: string }) {
  const days = daysSince(targetDate);
  const resolved: ResolvedStat[] = [];
  stats.forEach((s, i) => {
    if (s.auto) {
      if (days == null) return; // sem data → sem card automático
      resolved.push({ key: `a${i}`, value: days, suffix: 'dias', label: s.label });
    } else {
      const infinite = s.suffix === '∞' || s.value == null;
      resolved.push({
        key: `m${i}`,
        value: infinite ? null : (s.value ?? 0),
        suffix: s.suffix,
        label: s.label,
      });
    }
  });
  if (resolved.length === 0) return null;

  return (
    <div className="flex min-h-full flex-col items-center justify-center py-6 text-center">
      {/* ponte narrativa entre o último momento e a seção */}
      <p className="mb-8 max-w-[16rem] font-mono text-[0.7rem] uppercase leading-relaxed tracking-[0.25em] text-dim">
        e somando tudo isso…
      </p>

      <div className="grid w-full gap-7">
        {resolved.map((r, i) => (
          <StatItem key={r.key} stat={r} index={i} />
        ))}
      </div>

      <p className="mt-10 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-dim/60">
        <span className="rb-rew">◄◄</span> rebobinaí
      </p>
    </div>
  );
}

function StatItem({ stat, index }: { stat: ResolvedStat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  // Dispara o count-up quando o card entra em cena.
  useEffect(() => {
    if (stat.value == null) return; // ∞ / sem número não anima
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [stat.value]);

  // Animação count-up com stagger (um por vez).
  useEffect(() => {
    if (!started || stat.value == null) return;
    const target = stat.value;
    const dur = 1000;
    const delay = index * 1100; // um começa depois do outro
    let raf = 0;
    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (startTs === null) startTs = ts;
      const t = Math.min(1, (ts - startTs) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const to = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(to);
      cancelAnimationFrame(raf);
    };
  }, [started, stat.value, index]);

  const figure = stat.value == null ? (stat.suffix ?? '∞') : display.toLocaleString('pt-BR');

  return (
    <div ref={ref}>
      <p className="font-display text-5xl font-bold leading-none text-magenta sm:text-6xl">
        {figure}
        {stat.value != null && stat.suffix && (
          <span className="ml-2 text-xl font-semibold text-magenta/80">{stat.suffix}</span>
        )}
      </p>
      <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-cyan">
        {stat.label}
      </p>
    </div>
  );
}
