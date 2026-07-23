import type { Plan } from './plans';
import { SITE_DESCRIPTION, SITE_INSTAGRAM, SITE_LEGAL_NAME, SITE_NAME, SITE_URL } from './site';

/**
 * Builders de schema.org (JSON-LD) — SEO (rich results) e AEO (motores de
 * resposta citam quem tem estrutura legível). Mantidos aqui para as mesmas
 * entidades servirem home e landings de ocasião sem duplicar shape.
 */

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    sameAs: [SITE_INSTAGRAM],
  };
}

export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/**
 * Product com AggregateOffer a partir dos planos pagos (preço vigente de
 * lançamento). `url` permite apontar o Product da landing de ocasião para a
 * própria página.
 */
export function productSchema(plans: Plan[], url: string = SITE_URL): Record<string, unknown> {
  const paid = plans.filter((p) => p.active && p.launchPrice > 0);
  const prices = paid.map((p) => p.launchPrice / 100);
  const low = prices.length ? Math.min(...prices) : 19.9;
  const high = prices.length ? Math.max(...prices) : 69.9;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${SITE_NAME} — presente digital personalizado`,
    description: SITE_DESCRIPTION,
    brand: { '@type': 'Brand', name: SITE_NAME },
    url,
    image: `${SITE_URL}/icon.png`,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: low.toFixed(2),
      highPrice: high.toFixed(2),
      offerCount: Math.max(paid.length, 1),
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/#planos`,
    },
  };
}

export function faqSchema(faq: { q: string; a: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function howToSchema(steps: { title: string; body: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Como criar uma rebobinada (presente digital personalizado)',
    totalTime: 'PT5M',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };
}

/** ItemList dos exemplos exibidos numa landing de ocasião. */
export function itemListSchema(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
