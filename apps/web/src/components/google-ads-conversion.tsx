'use client';

import Script from 'next/script';

/**
 * Tag de conversão do Google Ads.
 *
 * Carrega o gtag.js da conta de Ads e dispara um evento de conversão uma única
 * vez, quando o componente monta (ex.: ao abrir a página de criação do
 * presente, pra medir "Add to Cart" no Google Shopping).
 *
 * É separada do GA4 (que fica no layout, gated por NEXT_PUBLIC_GA_ID): o Ads
 * usa outra conta (AW-…). O ID da conta pode ser trocado por env; o rótulo
 * (`sendTo`) é específico do evento de conversão e vem por prop.
 */
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? 'AW-16916081421';

interface GoogleAdsConversionProps {
  /** Rótulo de conversão (`send_to`), no formato `AW-XXXX/label`. */
  sendTo: string;
  value?: number;
  currency?: string;
}

export function GoogleAdsConversion({ sendTo, value = 1.0, currency = 'BRL' }: GoogleAdsConversionProps) {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`} strategy="afterInteractive" />
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ADS_ID}');gtag('event','conversion',{send_to:'${sendTo}',value:${value},currency:'${currency}'});`}
      </Script>
    </>
  );
}
