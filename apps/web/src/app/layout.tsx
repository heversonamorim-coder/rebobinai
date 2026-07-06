import type { Metadata } from 'next';
import { Chakra_Petch, Space_Grotesk, Space_Mono } from 'next/font/google';
import Script from 'next/script';
import { AnalyticsProvider } from '../components/analytics-provider';
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
  title: 'Rebobinaí ◄◄ · rebobina a nossa história',
  description: 'O presente digital que rebobina a história de vocês — feito com IA em 5 minutos.',
  metadataBase: new URL('https://rebobinai.app'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
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
