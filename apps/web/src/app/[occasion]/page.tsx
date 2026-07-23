import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CloneButton } from '../../components/clone-button';
import { ExampleCard } from '../../components/example-card';
import { JsonLd } from '../../components/json-ld';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { getExamplesCached, getPlans } from '../../lib/api';
import { OCCASIONS_CONFIG, getOccasionBySlug } from '../../lib/occasions.config';
import { PLANS_FALLBACK, formatBRL } from '../../lib/plans';
import { faqSchema, itemListSchema, productSchema } from '../../lib/schema';
import { absoluteUrl } from '../../lib/site';

/**
 * Landing de ocasião (F2-6, SEO programático): /presente-dia-dos-pais,
 * /presente-namorada etc. SSG dirigida pela config declarativa
 * (occasions.config.ts) — adicionar uma ocasião nova não toca neste arquivo.
 * Revalida a cada hora para captar exemplos novos da galeria.
 */
export const revalidate = 3600;
// Só as rotas da config existem; qualquer outro slug segue para o 404.
export const dynamicParams = false;

type Params = { params: Promise<{ occasion: string }> };

export function generateStaticParams() {
  return OCCASIONS_CONFIG.map((o) => ({ occasion: o.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { occasion } = await params;
  const config = getOccasionBySlug(occasion);
  if (!config) return {};
  const url = absoluteUrl(`/${config.slug}`);
  return {
    title: config.title,
    description: config.description,
    alternates: { canonical: url },
    openGraph: {
      title: config.title,
      description: config.description,
      url,
      type: 'website',
      siteName: 'Rebobinaí',
      locale: 'pt_BR',
    },
    twitter: { card: 'summary_large_image', title: config.title, description: config.description },
  };
}

const STEPS = [
  { n: '01', title: 'Conta a história', body: 'Um parágrafo sobre vocês: a ocasião, os nomes, os momentos que marcaram.' },
  { n: '02', title: 'Veja a prévia grátis', body: 'Na hora, a rebobinada ganha vida na estética retrô — sem login, sem cartão.' },
  { n: '03', title: 'Pague e compartilhe', body: 'Pix ou cartão libera o link secreto e o QR. Manda no WhatsApp e acompanha cada abertura.' },
];

export default async function OccasionLandingPage({ params }: Params) {
  const { occasion } = await params;
  const config = getOccasionBySlug(occasion);
  if (!config) notFound();

  const [allExamples, fetchedPlans] = await Promise.all([getExamplesCached(), getPlans()]);
  const plans = fetchedPlans.length > 0 ? fetchedPlans : PLANS_FALLBACK;
  const examples = allExamples.filter((ex) => ex.occasion === config.galleryOccasion).slice(0, 6);
  const fromPrice = Math.min(
    ...plans.filter((p) => p.active && p.launchPrice > 0).map((p) => p.launchPrice),
  );
  const others = OCCASIONS_CONFIG.filter((o) => o.slug !== config.slug);
  const url = absoluteUrl(`/${config.slug}`);

  return (
    <>
      {/* SEO/AEO: produto com preços, FAQ da ocasião e lista dos exemplos. */}
      <JsonLd data={productSchema(plans, url)} />
      <JsonLd data={faqSchema(config.faq)} />
      {examples.length > 0 && (
        <JsonLd
          data={itemListSchema(
            examples.map((ex) => ({
              name: ex.payload.title ?? ex.name,
              url: absoluteUrl(`/exemplos/${ex.seoSlug}`),
            })),
          )}
        />
      )}

      <SiteHeader variant="solid" />
      <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:py-16">
        {/* Hero da ocasião */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">
            ◄◄ {config.label}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-glow sm:text-4xl">
            {config.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-dim">{config.sub}</p>

          {/* Resposta direta (AEO) — o parágrafo que motores de resposta citam. */}
          <p className="mx-auto mt-6 max-w-2xl border-l-2 border-magenta/60 pl-4 text-left text-sm leading-relaxed text-dim">
            {config.directAnswer}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/criar"
              className="rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
            >
              criar meu presente ►
            </Link>
            <Link
              href={`/exemplos?ocasiao=${config.galleryOccasion}`}
              className="rounded-lg border border-cyan px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-cyan transition hover:bg-cyan hover:text-tape"
            >
              ver exemplos prontos
            </Link>
          </div>
          <p className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim/70">
            prévia grátis · a partir de {formatBRL(Number.isFinite(fromPrice) ? fromPrice : 1990)} ·
            pagamento único
          </p>
        </header>

        {/* Exemplos da persona */}
        {examples.length > 0 && (
          <section className="mt-20">
            <h2 className="text-center font-display text-2xl font-bold text-glow">
              Exemplos prontos pra usar como base
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-dim">
              Toque pra ver a rebobinada como quem recebe o link vê — curtiu, clica em{' '}
              <b className="text-glow">usar como base</b> e ajusta do seu jeito.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((ex) => (
                <div key={ex.id} className="flex flex-col gap-4">
                  <ExampleCard seoSlug={ex.seoSlug} payload={ex.payload} />
                  <CloneButton exampleId={ex.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Como funciona */}
        <section className="mt-20">
          <h2 className="text-center font-display text-2xl font-bold text-glow">
            Como funciona: 3 passos e tá no ar
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="font-display text-4xl font-bold text-magenta">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-glow">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dim">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ da ocasião */}
        <section className="mx-auto mt-20 max-w-2xl">
          <h2 className="text-center font-display text-2xl font-bold text-glow">
            Perguntas frequentes
          </h2>
          <div className="mt-8 space-y-6">
            {config.faq.map((item) => (
              <div key={item.q} className="border-l-2 border-cyan/50 pl-4">
                <h3 className="font-display text-lg text-glow">{item.q}</h3>
                <p className="mt-1 text-sm leading-relaxed text-dim">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mt-20 text-center">
          <div className="rb-tracking-bar mx-auto mb-10 max-w-xs" aria-hidden />
          <h2 className="font-display text-2xl font-bold text-glow">
            Toda história merece um replay.
          </h2>
          <Link
            href="/criar"
            className="mt-8 inline-block rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
          >
            criar minha rebobinada ►
          </Link>
        </section>

        {/* Cross-links entre ocasiões — nenhuma landing é página órfã. */}
        <nav aria-label="Presentes para outras ocasiões" className="mt-20 text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-dim">
            procurando presente pra outra pessoa?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/${o.slug}`}
                className="rounded-full border border-[var(--line)] px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim transition hover:border-cyan hover:text-cyan"
              >
                {o.label}
              </Link>
            ))}
          </div>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
