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
      <p className="mt-12 font-[family-name:var(--mono)] text-xs tracking-[0.3em] uppercase text-[var(--dim)]">
        em construção · rebobinai.app
      </p>
    </main>
  );
}
