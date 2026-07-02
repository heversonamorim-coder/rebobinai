import type { Metadata } from 'next';
import { Chakra_Petch, Space_Grotesk, Space_Mono } from 'next/font/google';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
