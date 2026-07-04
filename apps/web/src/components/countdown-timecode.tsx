'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Contador vivo no formato timecode de VHS — DIAS:HH:MM:SS, em Space Mono,
 * atualizando a cada segundo, com um micro-glitch de aberração cromática no
 * tick. A pergunta/label é neutra (nunca assume casal). Usado na prévia do
 * editor e na capa da rebobinada.
 */
export function CountdownTimecode({
  targetDate,
  label,
  size = 'md',
}: {
  targetDate: string;
  label?: string;
  size?: 'sm' | 'md';
}) {
  const [now, setNow] = useState<number | null>(null);
  const [glitch, setGlitch] = useState(false);
  const glitchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => {
      setNow(Date.now());
      setGlitch(true);
      clearTimeout(glitchTimer.current);
      glitchTimer.current = setTimeout(() => setGlitch(false), 120);
    }, 1000);
    return () => {
      clearInterval(t);
      clearTimeout(glitchTimer.current);
    };
  }, []);

  const code = formatTimecode(targetDate, now);
  const codeSize = size === 'sm' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="text-center">
      {label && (
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">{label}</p>
      )}
      <p
        className={`mt-1 font-mono font-bold tabular-nums tracking-widest text-glow ${codeSize} ${
          glitch ? 'rb-chroma' : ''
        }`}
      >
        {code}
      </p>
    </div>
  );
}

function formatTimecode(targetDate: string, now: number | null): string {
  if (now === null) return '··:··:··:··';
  const start = new Date(targetDate).getTime();
  if (Number.isNaN(start)) return '··:··:··:··';
  let diff = Math.max(0, now - start);
  const days = Math.floor(diff / 86_400_000);
  diff -= days * 86_400_000;
  const h = Math.floor(diff / 3_600_000);
  diff -= h * 3_600_000;
  const m = Math.floor(diff / 60_000);
  diff -= m * 60_000;
  const s = Math.floor(diff / 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${days}:${p(h)}:${p(m)}:${p(s)}`;
}
