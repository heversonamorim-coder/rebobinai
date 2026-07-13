import { Mark } from './mark';

const sizes = {
  hero: 'text-[clamp(3.5rem,17vw,9rem)]',
  md: 'text-[clamp(1.6rem,7vw,2.4rem)]',
  sm: 'text-xl',
} as const;

/** Diâmetro do mark ◄◄ no lockup, proporcional a cada tamanho do wordmark. */
const markSizes = {
  hero: 72,
  md: 34,
  sm: 26,
} as const;

export interface LogoProps {
  /** hero = home; md = headers; sm = footer/e-mail */
  size?: keyof typeof sizes;
  /** desliga o glitch animado (o estático permanece) */
  static?: boolean;
  /** lockup com o mark ◄◄ à esquerda do wordmark — usar nos headers */
  withMark?: boolean;
}

/** Wordmark REBOBINAÍ com aberração cromática — o "AÍ" em cyan é o duplo sentido (rebobina aí + AI). */
export function Logo({ size = 'md', static: isStatic = false, withMark = false }: LogoProps) {
  const wordmark = (
    <span
      className={`inline-block font-[family-name:var(--display)] font-bold leading-none tracking-[-0.01em] text-[var(--glow)] ${
        isStatic ? 'rb-chroma' : 'rb-chroma-glitch'
      } ${sizes[size]}`}
    >
      REBOBIN<span className="text-[var(--cyan)] [text-shadow:none]">AÍ</span>
    </span>
  );

  if (!withMark) return wordmark;

  return (
    <span className="inline-flex items-center" style={{ gap: Math.round(markSizes[size] * 0.32) }}>
      <Mark size={markSizes[size]} />
      {wordmark}
    </span>
  );
}
