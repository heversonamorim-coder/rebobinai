import type { NextConfig } from 'next';

const securityHeaders = [
  // Impede que a página seja embutida em <iframe> em outros domínios (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Impede que o navegador tente adivinhar o Content-Type da resposta.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Envia apenas a origem no Referer para requisições cross-origin.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desabilita acesso a câmera, microfone e geolocalização via JavaScript.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Força HTTPS por 1 ano, incluindo subdomínios.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // CSP básico: permite recursos do próprio domínio + CDNs necessárias.
  // Ajuste os domínios de script/style/img conforme as fontes reais do projeto.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // unsafe-eval necessário para Next.js dev; googletagmanager/googleadservices/
      // google-analytics para o GA4 (layout) e a tag de conversão do Google Ads (/criar);
      // us[-assets].i.posthog.com para os scripts do PostHog (web-vitals, surveys,
      // dead-clicks, config, etc. carregados sob demanda pelo SDK).
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.googleadservices.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://us-assets.i.posthog.com https://us.i.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https:",
      // PostHog roda parte do processamento (ex.: session replay) em Web Worker
      // criado a partir de blob:; sem isto o worker-src cai no default-src 'self'.
      "worker-src 'self' blob:",
      // player Spotify + mapa "onde se conheceram" (Google Maps: maps.google.com
      // no embed keyless, que pode redirecionar pra www.google.com, e a Embed API) +
      // frames de conversão do Google Ads (doubleclick).
      'frame-src https://open.spotify.com https://maps.google.com https://www.google.com https://td.doubleclick.net https://googleads.g.doubleclick.net',
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ['@rebobinai/ui'],
  async headers() {
    return [
      {
        // Aplica os cabeçalhos de segurança em todas as rotas.
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Canonicalização do domínio: força o apex sem www (rebobinai.com.br). Dois
  // domínios servindo 200 com o mesmo conteúdo dividem a autoridade no SEO.
  // (permanent = 308; o Google trata como 301.) O apex precisa estar
  // configurado e resolvendo no Vercel para o destino existir.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.rebobinai.com.br' }],
        destination: 'https://rebobinai.com.br/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
