import Link from 'next/link';
import { Osd } from '@rebobinai/ui';
import { HeroCarousel } from '../components/hero-carousel';
import { JsonLd } from '../components/json-ld';
import { PricingGrid } from '../components/pricing';
import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';
import { getPlans } from '../lib/api';
import { OCCASIONS_CONFIG } from '../lib/occasions.config';
import { PLANS_FALLBACK } from '../lib/plans';
import { faqSchema, howToSchema, productSchema } from '../lib/schema';

// Landing com planos por ISR; resiliente via fallback estático.
export const revalidate = 3600;

const STEPS = [
  {
    n: '01',
    title: 'Conta a história',
    body: 'Escreve um parágrafo sobre vocês. Ocasião, nomes, os momentos que marcaram.',
  },
  {
    n: '02',
    title: 'Veja a prévia',
    body: 'Na hora, sua rebobinada ganha vida na estética retrô — grátis, sem login.',
  },
  {
    n: '03',
    title: 'Pague e compartilhe',
    body: 'Libere o link secreto e o QR. Manda no WhatsApp e vê cada abertura ao vivo.',
  },
];

const FAQ = [
  {
    q: 'Preciso criar conta?',
    a: 'Não. Você cria e vê a prévia sem login. A conta é opcional, só se quiser guardar suas rebobinadas depois.',
  },
  {
    q: 'Como funciona o pagamento?',
    a: 'Pix ou cartão, pagamento único. O link compartilhável e o QR são liberados assim que o pagamento é aprovado.',
  },
  {
    q: 'A pessoa precisa de app pra abrir?',
    a: 'Não. É um link que abre bonito no navegador e no WhatsApp — com direito a QR code pra apontar a câmera.',
  },
  {
    q: 'Por quanto tempo o presente fica no ar?',
    a: 'No plano Digital, 1 ano de hospedagem. No Pra Sempre, é vitalício e sem marca d’água.',
  },
];

export default async function Home() {
  const fetched = await getPlans();
  const plans = fetched.length > 0 ? fetched : PLANS_FALLBACK;

  return (
    <main className="overflow-hidden">
      {/* SEO/AEO: produto (preços), passos e FAQ legíveis por máquina. */}
      <JsonLd data={productSchema(plans)} />
      <JsonLd data={howToSchema(STEPS)} />
      <JsonLd data={faqSchema(FAQ)} />
      <SiteHeader />

      {/* Hero (carrossel com foto de fundo nos slides 2 e 3) */}
      <section className="rb-scanlines relative min-h-svh overflow-hidden">
        <HeroCarousel />

        {/* OSD acima dos slides (inclusive sobre as fotos) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <Osd left="● REC" right="SP · 0:00:31" />
        </div>

        {/* Indicador de que tem mais conteúdo pra baixo */}
        <a
          href="#como-funciona"
          aria-label="Rolar para baixo"
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-dim transition hover:text-cyan"
        >
          role pra ver mais
          <span className="animate-bounce text-lg leading-none">▼</span>
        </a>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-4xl px-5 py-20">
        <SectionTitle kicker="como funciona" title="3 passos e tá no ar" />
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="font-display text-4xl font-bold text-magenta">{s.n}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-glow">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Exemplos / inspiração */}
      <section id="inspiracao" className="mx-auto max-w-2xl px-5 pb-4 text-center">
        <SectionTitle kicker="inspiração" title="Sem ideia? Comece de um exemplo" />
        <p className="mx-auto mt-3 max-w-xl text-sm text-dim">
          Rebobinadas prontas por ocasião — clique em “usar como base” e ajuste do seu jeito.
        </p>
        <Link
          href="/exemplos"
          className="mt-8 inline-block rounded-lg border border-cyan px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-cyan transition hover:bg-cyan hover:text-tape"
        >
          ver exemplos ►
        </Link>
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto max-w-5xl px-5 py-20">
        <SectionTitle kicker="planos" title="Escolha como vai emocionar" />
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-dim">
          Criar e ver a prévia é grátis. Você só paga pra liberar o link e compartilhar.
        </p>
        <div className="mt-12">
          <PricingGrid plans={plans} />
        </div>
      </section>

      {/* Ocasiões — internal linking para as landings de SEO (F2-6) */}
      <section id="ocasioes" className="mx-auto max-w-3xl px-5 py-20 text-center">
        <SectionTitle kicker="ocasiões" title="Um presente pra cada história" />
        <p className="mx-auto mt-3 max-w-xl text-sm text-dim">
          Namoro, Dia das Mães, casamento, melhor amiga — veja como a rebobinada fica em cada ocasião.
        </p>
        <nav aria-label="Presentes por ocasião" className="mt-8 flex flex-wrap justify-center gap-2">
          {OCCASIONS_CONFIG.map((o) => (
            <Link
              key={o.slug}
              href={`/${o.slug}`}
              className="rounded-full border border-[var(--line)] px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim transition hover:border-cyan hover:text-cyan"
            >
              {o.label}
            </Link>
          ))}
        </nav>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-2xl px-5 py-20">
        <SectionTitle kicker="dúvidas" title="Perguntas frequentes" />
        <div className="mt-10 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q} className="border-l-2 border-cyan/50 pl-4">
              <h3 className="font-display text-lg text-glow">{item.q}</h3>
              <p className="mt-1 text-sm leading-relaxed text-dim">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <div className="rb-tracking-bar mx-auto mb-10 max-w-xs" aria-hidden />
        <h2 className="font-display text-2xl font-bold text-glow sm:text-3xl">
          Toda história merece um replay.
        </h2>
        <Link
          href="/criar"
          className="mt-8 inline-block rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
        >
          criar minha rebobinada ►
        </Link>
        <p className="mt-10 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-dim/60">
          ◄◄ rebobinai.app
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="text-center">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">{kicker}</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-glow sm:text-3xl">{title}</h2>
    </div>
  );
}
