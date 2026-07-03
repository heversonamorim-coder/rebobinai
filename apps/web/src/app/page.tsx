import Link from 'next/link';
import { Logo, Osd } from '@rebobinai/ui';
import { PricingGrid } from '../components/pricing';
import { getPlans } from '../lib/api';
import { PLANS_FALLBACK } from '../lib/plans';

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
      {/* Hero */}
      <section className="rb-scanlines relative flex min-h-svh flex-col items-center justify-center px-5 text-center">
        <Osd left="● REC" right="SP · 0:00:31" />
        <Logo size="hero" />
        <p className="rb-tagline mt-8">
          <span className="rb-rew">◄◄</span> rebobina a nossa história{' '}
          <b className="font-normal text-[var(--magenta)]">· com IA</b>
        </p>
        <Link
          href="/criar"
          className="mt-12 rounded-lg bg-magenta px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110"
        >
          criar meu presente ►
        </Link>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-dim">
          grátis pra criar e ver a prévia
        </p>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-4xl px-5 py-20">
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
      <section className="mx-auto max-w-2xl px-5 pb-4 text-center">
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
      <section className="mx-auto max-w-5xl px-5 py-20">
        <SectionTitle kicker="planos" title="Escolha como vai emocionar" />
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-dim">
          Criar e ver a prévia é grátis. Você só paga pra liberar o link e compartilhar.
        </p>
        <div className="mt-12">
          <PricingGrid plans={plans} />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-5 py-20">
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
