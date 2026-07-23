import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/site';

/**
 * robots.txt (SEO + AEO). Política:
 * - Libera todo o conteúdo público, inclusive para crawlers de IA (GPTBot,
 *   ClaudeBot, PerplexityBot etc.) — ser citado por motores de resposta é
 *   canal de aquisição, não risco.
 * - Bloqueia /p/ (presentes dos clientes — conteúdo privado, já noindex),
 *   /admin, /pagar (checkout) e /api (rotas internas do front).
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/p/', '/admin', '/pagar', '/api/'];

  return {
    rules: [
      // Regra geral (inclui os bots de IA — listados explicitamente abaixo
      // apenas para documentar a intenção de permitir).
      { userAgent: '*', allow: '/', disallow },
      { userAgent: 'GPTBot', allow: '/', disallow },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow },
      { userAgent: 'ChatGPT-User', allow: '/', disallow },
      { userAgent: 'ClaudeBot', allow: '/', disallow },
      { userAgent: 'Claude-User', allow: '/', disallow },
      { userAgent: 'PerplexityBot', allow: '/', disallow },
      { userAgent: 'Google-Extended', allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
