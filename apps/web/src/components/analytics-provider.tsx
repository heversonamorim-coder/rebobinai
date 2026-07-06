'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { initAnalytics, trackPageview } from '../lib/analytics';

/**
 * Inicializa a observabilidade no cliente e dispara pageview a cada navegação.
 * Usa só `usePathname` (não `useSearchParams`) pra não forçar CSR bailout no
 * build. No-op quando as envs não estão configuradas.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (pathname) trackPageview(pathname);
  }, [pathname]);

  return null;
}
