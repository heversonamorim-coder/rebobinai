import type { Metadata } from 'next';
import { Chakra_Petch, Space_Grotesk, Space_Mono } from 'next/font/google';
import Script from 'next/script';
import { AnalyticsProvider } from '../components/analytics-provider';
import { JsonLd } from '../components/json-ld';
import { organizationSchema, webSiteSchema } from '../lib/schema';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

const body = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  // Template: páginas internas definem só o próprio título e herdam o sufixo.
  title: {
    default: 'Rebobinaí ◄◄ · presente digital personalizado com a história de vocês',
    template: '%s',
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'pt_BR',
    url: SITE_URL,
    title: 'Rebobinaí ◄◄ · presente digital personalizado',
    description: SITE_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {/* Entidades globais (schema.org) — referenciadas pelos schemas das páginas. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={webSiteSchema()} />
        {children}
        <AnalyticsProvider />
        {/* Google Analytics (GA4) — só carrega quando NEXT_PUBLIC_GA_ID existe */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
