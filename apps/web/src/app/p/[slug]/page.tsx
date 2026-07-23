import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { StoriesViewer } from '../../../components/stories-viewer';
import { ViewBeacon } from '../../../components/view-beacon';
import { getPublicGift } from '../../../lib/api';
import { SITE_URL } from '../../../lib/site';

// Contador ao vivo: sem cache estático, renderiza a cada abertura.
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

/**
 * URL base do site a partir da requisição — assim o link/QR sempre batem com o
 * domínio em que a página foi aberta (Vercel, preview ou domínio próprio), sem
 * depender de um valor fixo. Cai em NEXT_PUBLIC_SITE_URL se o host não vier.
 */
async function siteBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return SITE_URL;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const gift = await getPublicGift(slug).catch(() => null);
  if (!gift) return { title: 'Presente não encontrado · Rebobinaí ◄◄' };

  const title = gift.payload.title || 'Uma rebobinada pra você';
  const description =
    gift.payload.letter?.slice(0, 150) || 'Alguém rebobinou a história de vocês. Aperta o play ◄◄';
  const url = `${await siteBaseUrl()}/p/${slug}`;

  return {
    title: `${title} · Rebobinaí ◄◄`,
    description,
    alternates: { canonical: url },
    // Presente é conteúdo privado do cliente — fora do índice do Google
    // (o robots.txt também bloqueia /p/). OG tags ficam: o unfurl no WhatsApp
    // não depende de indexação.
    robots: { index: false, follow: false },
    openGraph: { title, description, url, type: 'website', siteName: 'Rebobinaí' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function GiftPublicPage({ params }: Params) {
  const { slug } = await params;
  const gift = await getPublicGift(slug);
  if (!gift) notFound();

  // Quem recebe o link vê só a rebobinada, em tela cheia — sem links nem QR.
  // O shareUrl habilita o último slide de compartilhar como story (Tarefa 4).
  const url = `${await siteBaseUrl()}/p/${slug}`;
  return (
    <main className="flex min-h-svh w-full items-stretch justify-center bg-tape sm:items-center sm:py-6">
      <ViewBeacon slug={slug} />
      <StoriesViewer
        payload={gift.payload}
        occasion={gift.occasion}
        assets={gift.assets}
        watermark={gift.watermark}
        fullscreen
        shareUrl={url}
      />
    </main>
  );
}
