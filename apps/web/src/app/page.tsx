import Link from 'next/link';
import { Logo, Osd } from '@rebobinai/ui';

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden text-center rb-scanlines">
      <Osd left="● REC" right="SP · 0:00:31" />
      <Logo size="hero" />
      <p className="rb-tagline mt-8">
        <span className="rb-rew">◄◄</span> rebobina a nossa história{' '}
        <b className="text-[var(--magenta)] font-normal">· com IA</b>
      </p>
      <Link
        href="/criar"
        className="mt-12 rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
      >
        criar meu presente ►
      </Link>
      <p className="mt-8 font-[family-name:var(--mono)] text-xs tracking-[0.3em] uppercase text-[var(--dim)]">
        grátis pra criar e ver a prévia · rebobinai.app
      </p>
    </main>
  );
}
