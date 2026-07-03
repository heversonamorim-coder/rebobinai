import type { Metadata } from 'next';
import Link from 'next/link';
import { CloneButton } from '../../components/clone-button';
import { GiftPreview } from '../../components/gift-preview';
import { getExamples } from '../../lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Exemplos de rebobinada · Rebobinaí ◄◄',
  description: 'Inspire-se em rebobinadas prontas por ocasião e use como base — seu presente em 1 clique.',
};

export default async function ExemplosPage() {
  const examples = await getExamples();

  return (
    <main className="mx-auto min-h-svh w-full max-w-5xl px-5 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">exemplos</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-glow sm:text-3xl">
          Comece de uma rebobinada pronta
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-dim">
          Escolha um exemplo, clique em <b className="text-glow">usar como base</b> e ajuste do seu
          jeito. Sem folha em branco.
        </p>
      </header>

      {examples.length === 0 ? (
        <div className="text-center">
          <p className="text-dim">Os exemplos estão a caminho.</p>
          <Link
            href="/criar"
            className="mt-6 inline-block rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape"
          >
            criar do zero ►
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {examples.map((ex) => (
            <div key={ex.id} className="flex flex-col gap-4">
              <GiftPreview payload={ex.payload} occasion={ex.occasion} />
              <CloneButton exampleId={ex.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
