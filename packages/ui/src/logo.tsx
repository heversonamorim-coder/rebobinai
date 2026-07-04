const sizes = {
  hero: 'text-[clamp(3.5rem,17vw,9rem)]',
  md: 'text-[clamp(1.6rem,7vw,2.4rem)]',
  sm: 'text-xl',
} as const;

export interface LogoProps {
  /** hero = home; md = headers; sm = footer/e-mail */
  size?: keyof typeof sizes;
  /** desliga o glitch animado (o estático permanece) */
  static?: boolean;
}

/** Wordmark REBOBINAÍ com aberração cromática — o "AÍ" em cyan é o duplo sentido (rebobina aí + AI). */
export function Logo({ size = 'md', static: isStatic = false }: LogoProps) {
  return (
    <span
      className={`inline-block font-[family-name:var(--display)] font-bold leading-none tracking-[-0.01em] text-[var(--glow)] ${
        isStatic ? 'rb-chroma' : 'rb-chroma-glitch'
      } ${sizes[size]}`}
    >
      REBOBIN<span className="text-[var(--cyan)] [text-shadow:none]">AÍ</span>
    </span>
  );
}
