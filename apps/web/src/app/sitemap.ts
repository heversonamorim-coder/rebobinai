import type { MetadataRoute } from 'next';
import { getExamplesCached } from '../lib/api';
import { OCCASIONS_CONFIG } from '../lib/occasions.config';
import { SITE_URL } from '../lib/site';

/**
 * sitemap.xml — todas as páginas indexáveis: home, galeria, landings de
 * ocasião (F2-6) e cada exemplo da galeria (que também é página indexável).
 * Páginas de presente /p/:slug ficam de fora de propósito (conteúdo privado,
 * noindex). Revalida a cada hora para captar exemplos novos.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const examples = await getExamplesCached();

  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/exemplos`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/criar`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const occasions: MetadataRoute.Sitemap = OCCASIONS_CONFIG.map((o) => ({
    url: `${SITE_URL}/${o.slug}`,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const examplePages: MetadataRoute.Sitemap = examples.map((ex) => ({
    url: `${SITE_URL}/exemplos/${ex.seoSlug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...statics, ...occasions, ...examplePages];
}
