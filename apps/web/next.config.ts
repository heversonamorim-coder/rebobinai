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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval necessário para Next.js dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https:",
      // player Spotify + mapa "onde se conheceram" (Google Maps: maps.google.com
      // no embed keyless, que pode redirecionar pra www.google.com, e a Embed API).
      'frame-src https://open.spotify.com https://maps.google.com https://www.google.com',
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
};

export default nextConfig;
