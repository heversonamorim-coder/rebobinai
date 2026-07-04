import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { StoriesViewer } from '../../../components/stories-viewer';
import { getPublicGift } from '../../../lib/api';

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
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rebobinai.app';
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
    openGraph: { title, description, url, type: 'website', siteName: 'Rebobinaí' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function GiftPublicPage({ params }: Params) {
  const { slug } = await params;
  const gift = await getPublicGift(slug);
  if (!gift) notFound();

  // Quem recebe o link vê só a rebobinada, em tela cheia — sem links nem QR.
  return (
    <main className="flex min-h-svh w-full items-stretch justify-center bg-tape sm:items-center sm:py-6">
      <StoriesViewer
        payload={gift.payload}
        occasion={gift.occasion}
        assets={gift.assets}
        watermark={gift.watermark}
        fullscreen
      />
    </main>
  );
}
