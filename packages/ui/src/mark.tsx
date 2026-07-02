export interface MarkProps {
  /** diâmetro em px */
  size?: number;
  /** circle = avatar; squircle = ícone de app */
  shape?: 'circle' | 'squircle';
}

/** Mark ◄◄ — avatar, favicon, botão rewind, selo do quadro físico. */
export function Mark({ size = 66, shape = 'circle' }: MarkProps) {
  return (
    <span
      className={`rb-mark-gradient grid place-items-center ${
        shape === 'circle' ? 'rounded-full' : 'rounded-[24%]'
      }`}
      style={{ width: size, height: size, boxShadow: '0 0 40px -8px var(--purple)' }}
      aria-hidden
    >
      <span
        className="font-[family-name:var(--display)] font-bold tracking-[-0.08em] text-[var(--tape)]"
        style={{ fontSize: size * 0.38, transform: 'translateX(-2%)' }}
      >
        ◄◄
      </span>
    </span>
  );
}
