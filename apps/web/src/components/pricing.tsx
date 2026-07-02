import Link from 'next/link';
import { priceDisplay, type Plan } from '../lib/plans';

/** Grade de planos com preço de lançamento tachado dirigido por dado (F1-9). */
export function PricingGrid({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => (
        <PricingCard key={plan.id} plan={plan} highlight={plan.key === 'forever'} />
      ))}
    </div>
  );
}

function PricingCard({ plan, highlight }: { plan: Plan; highlight?: boolean }) {
  const price = priceDisplay(plan);

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-panel/40 p-6 ${
        highlight ? 'border-magenta' : 'border-[var(--line)]'
      }`}
    >
      {highlight && (
        <span className="mb-3 self-start rounded-full bg-magenta px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-tape">
          mais amado
        </span>
      )}

      <h3 className="font-display text-xl font-semibold text-glow">{plan.name}</h3>
      {plan.tagline && <p className="mt-1 text-sm text-dim">{plan.tagline}</p>}

      <div className="mt-5">
        {price.strikethrough && (
          <span className="mr-2 font-mono text-sm text-dim/60 line-through">
            {price.strikethrough}
          </span>
        )}
        <span className="font-display text-3xl font-bold text-cyan">{price.current}</span>
      </div>
      {price.note && (
        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-magenta">
          {price.note}
        </p>
      )}

      <ul className="mt-5 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-glow/85">
            <span className="text-cyan">◄</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/criar"
        className={`mt-6 rounded-lg px-4 py-3 text-center font-display text-sm font-semibold uppercase tracking-[0.15em] transition hover:brightness-110 ${
          plan.key === 'free'
            ? 'border border-[var(--line)] text-glow'
            : 'bg-magenta text-tape'
        }`}
      >
        {plan.key === 'free' ? 'criar grátis' : 'começar'}
      </Link>
    </div>
  );
}
