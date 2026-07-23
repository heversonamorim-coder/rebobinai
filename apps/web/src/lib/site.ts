/**
 * Identidade canônica do site para SEO/AEO — uma única fonte de verdade para
 * URL base, nome e descrição usados em metadata, sitemap, robots e JSON-LD.
 *
 * O domínio canônico é rebobinai.com.br. Em ambientes de preview, defina
 * NEXT_PUBLIC_SITE_URL. IMPORTANTE: qualquer outro domínio que sirva o site
 * (ex.: rebobinai.app) deve redirecionar 301 para o canônico — dois domínios
 * respondendo 200 com o mesmo conteúdo dividem a autoridade no Google.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rebobinai.com.br').replace(
  /\/+$/,
  '',
);

export const SITE_NAME = 'Rebobinaí';

export const SITE_DESCRIPTION =
  'O presente digital que rebobina a história de vocês — feito com IA em 5 minutos. Preview grátis, link + QR pra compartilhar no WhatsApp.';

/** Razão social exibida no rodapé — usada também no schema.org Organization. */
export const SITE_LEGAL_NAME = 'HJCM Tecnologia';

export const SITE_INSTAGRAM = 'https://instagram.com/rebobinai.app';

/** URL absoluta a partir de um path do site. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
