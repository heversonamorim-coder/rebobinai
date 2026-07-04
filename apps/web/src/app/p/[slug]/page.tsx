import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { CopyLink } from '../../../components/copy-link';
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

  const url = `${await siteBaseUrl()}/p/${slug}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${gift.payload.title ?? 'Um presente pra você'} ◄◄ ${url}`)}`;
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 320,
    color: { dark: '#0A0713', light: '#F1ECFF' },
  });

  return (
    <main className="mx-auto min-h-svh w-full max-w-2xl px-5 py-10 sm:py-16">
      <StoriesViewer
        payload={gift.payload}
        occasion={gift.occasion}
        assets={gift.assets}
        watermark={gift.watermark}
      />

      <section className="mt-8 flex flex-col items-center gap-6">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim">
          <span className="text-cyan">{gift.viewCount}</span>{' '}
          {gift.viewCount === 1 ? 'abertura' : 'aberturas'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
          >
            compartilhar no whatsapp
          </a>
          <CopyLink url={url} />
        </div>

        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt={`QR code do presente ${slug}`}
            width={160}
            height={160}
            className="rounded-lg border border-[var(--line)]"
          />
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/70">
            aponte a câmera
          </span>
        </div>
      </section>

      <footer className="mt-12 text-center">
        <a
          href="/criar"
          className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim underline underline-offset-4 hover:text-cyan"
        >
          <span className="rb-rew">◄◄</span> criar a minha rebobinada
        </a>
      </footer>
    </main>
  );
}
