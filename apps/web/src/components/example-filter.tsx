import Link from 'next/link';

/**
 * Ocasiões conhecidas da galeria, na ordem de exibição dos chips.
 * O slug é o valor gravado em Example.occasion (e usado em ?ocasiao= na URL).
 */
export const OCCASION_FILTERS: { slug: string; label: string }[] = [
  { slug: 'namorados', label: 'Namoro' },
  { slug: 'casamento', label: 'Casamento' },
  { slug: 'maes', label: 'Mães' },
  { slug: 'pais', label: 'Pais' },
  { slug: 'avos', label: 'Avós' },
  { slug: 'amizade', label: 'Amizade' },
];

/**
 * Chips de filtro por ocasião da galeria de exemplos (F2-5).
 * Server component: cada chip é um <Link> que troca ?ocasiao= na URL —
 * filtro compartilhável, indexável e sem JS extra no cliente.
 * Só renderiza chips de ocasiões que têm pelo menos um exemplo ativo.
 */
export function ExampleFilter({
  available,
  active,
}: {
  /** Slugs de ocasião presentes nos exemplos carregados. */
  available: string[];
  /** Slug ativo (vindo de ?ocasiao=) ou null para "todos". */
  active: string | null;
}) {
  const chips = OCCASION_FILTERS.filter((o) => available.includes(o.slug));
  if (chips.length < 2) return null;

  return (
    <nav
      aria-label="Filtrar exemplos por ocasião"
      className="mb-8 flex flex-wrap justify-center gap-2"
    >
      <Chip href="/exemplos" label="Todos" selected={active === null} />
      {chips.map((o) => (
        <Chip
          key={o.slug}
          href={`/exemplos?ocasiao=${o.slug}`}
          label={o.label}
          selected={active === o.slug}
        />
      ))}
    </nav>
  );
}

function Chip({ href, label, selected }: { href: string; label: string; selected: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? 'page' : undefined}
      className={
        'rounded-full border px-4 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] transition ' +
        (selected
          ? 'border-magenta bg-magenta text-tape'
          : 'border-[var(--line)] text-dim hover:border-cyan hover:text-cyan')
      }
    >
      {label}
    </Link>
  );
}
