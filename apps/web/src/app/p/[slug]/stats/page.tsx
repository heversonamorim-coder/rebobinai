import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Logo } from '@rebobinai/ui';
import { StatsBrazilMap } from '../../../../components/stats-brazil-map';
import { StatsWeeklyChart } from '../../../../components/stats-weekly-chart';
import { getGiftStats } from '../../../../lib/api';

// Sempre dinâmico e fora do índice de busca (é privado do cliente).
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Estatísticas · Rebobinaí ◄◄',
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ slug: string }> };

export default async function StatsPage({ params }: Params) {
  const { slug } = await params;
  const stats = await getGiftStats(slug);
  if (!stats) notFound();

  return (
    <main className="mx-auto min-h-svh w-full max-w-3xl px-5 py-12">
      <header className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" aria-label="Início">
          <Logo size="sm" static withMark />
        </Link>
        <Link
          href={`/p/${slug}`}
          className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim transition hover:text-cyan"
        >
          ◄ abrir o presente
        </Link>
      </header>

      <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">estatísticas</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-glow sm:text-3xl">
        {stats.title || 'Sua rebobinada'}
      </h1>

      {!stats.eligible ? (
        <div className="mt-10 rounded-2xl border border-[var(--line)] bg-panel/40 p-8 text-center">
          <p className="text-5xl">📈</p>
          <h2 className="mt-4 font-display text-xl font-semibold text-glow">
            Estatísticas fazem parte do plano Pra Sempre
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dim">
            Veja quantas pessoas abriram o presente, acessos únicos e de onde vieram — disponível
            no plano vitalício, sem marca d&apos;água.
          </p>
          <Link
            href="/#planos"
            className="mt-6 inline-block rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
          >
            conhecer os planos ►
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--line)] bg-panel/40 p-6">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim">total de acessos</p>
              <p className="mt-2 font-display text-4xl font-bold text-magenta">
                {(stats.total ?? 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-panel/40 p-6">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim">acessos únicos</p>
              <p className="mt-2 font-display text-4xl font-bold text-cyan">
                {(stats.unique ?? 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-[var(--line)] bg-panel/40 p-6">
            <p className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
              últimos 7 dias
            </p>
            <StatsWeeklyChart daily={stats.daily ?? []} />
          </section>

          <section className="mt-8 rounded-2xl border border-[var(--line)] bg-panel/40 p-6">
            <p className="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
              de onde abriram
            </p>
            <StatsBrazilMap byUf={stats.byUf ?? []} />
          </section>

          <p className="mt-8 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/60">
            ◄◄ localização aproximada, derivada do IP
          </p>
        </>
      )}
    </main>
  );
}
