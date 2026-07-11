import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CloneButton } from '../../../components/clone-button';
import { StoriesViewer } from '../../../components/stories-viewer';
import { getExampleBySeoSlug } from '../../../lib/api';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ seoSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { seoSlug } = await params;
  const ex = await getExampleBySeoSlug(seoSlug).catch(() => null);
  if (!ex) return { title: 'Exemplo não encontrado · Rebobinaí ◄◄' };
  const title = ex.payload.title || 'Uma rebobinada de exemplo';
  const description =
    ex.payload.letter?.slice(0, 150) ||
    'Veja um exemplo de rebobinada — exatamente como quem recebe o link vê. ◄◄';
  return {
    title: `${title} · Exemplo · Rebobinaí ◄◄`,
    description,
    openGraph: { title, description, type: 'website', siteName: 'Rebobinaí' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/**
 * Prévia de um exemplo em tela cheia — usa o MESMO StoriesViewer da página
 * pública /p/:slug, então o cliente vê exatamente como o destinatário verá o
 * link compartilhado. Sem beacon (não é acesso real) e sem marca d'água
 * (mostra o resultado final, entregue). Sem shareUrl: o story de compartilhar
 * é ação de quem recebe o presente, não faz sentido no exemplo.
 */
export default async function ExampleStoryPage({ params }: Params) {
  const { seoSlug } = await params;
  const ex = await getExampleBySeoSlug(seoSlug);
  if (!ex) notFound();

  return (
    <main className="relative flex min-h-svh w-full items-stretch justify-center bg-tape sm:items-center sm:py-6">
      <StoriesViewer payload={ex.payload} occasion={ex.occasion} assets={ex.payload.assets} fullscreen />

      {/* Voltar pra galeria — flutua sobre o player (canto superior esquerdo). */}
      <Link
        href="/exemplos"
        className="fixed left-4 top-4 z-40 flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-tape/70 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim backdrop-blur transition hover:border-cyan hover:text-cyan"
      >
        <span className="text-sm leading-none">←</span> exemplos
      </Link>

      {/* CTA de clonar — flutua no rodapé, sem entrar no fluxo do player. */}
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <div className="w-full max-w-xs rounded-xl border border-[var(--line)] bg-tape/80 p-2 backdrop-blur">
          <CloneButton exampleId={ex.id} />
        </div>
      </div>
    </main>
  );
}
