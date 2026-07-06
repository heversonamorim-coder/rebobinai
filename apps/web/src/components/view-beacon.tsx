'use client';

import { useEffect } from 'react';
import { recordGiftView } from '../lib/api';

/**
 * Dispara o beacon de acesso quando quem recebe abre o presente. Roda no
 * navegador (não no SSR) pra a API enxergar o IP real do visitante — base do
 * analytics de acessos. Uma vez por carga de página.
 */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    recordGiftView(slug);
  }, [slug]);
  return null;
}
