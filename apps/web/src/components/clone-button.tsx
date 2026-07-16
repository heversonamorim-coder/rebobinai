'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { captureError } from '../lib/analytics';
import { cloneExample } from '../lib/api';
import { saveDraftRef } from '../lib/gift';

/** "Usar como base": clona o exemplo num rascunho e leva pro editor (F2-5). */
export function CloneButton({ exampleId }: { exampleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function clone() {
    setLoading(true);
    setErr(null);
    try {
      const gift = await cloneExample(exampleId);
      saveDraftRef({ id: gift.id, editToken: gift.editToken });
      router.push('/criar');
    } catch (e) {
      // Antes o erro era engolido em silêncio — o botão "não fazia nada". Agora
      // mostra o motivo e registra no Sentry pra diagnóstico.
      captureError(e, { where: 'cloneExample', exampleId });
      setErr(e instanceof Error ? e.message : 'Não consegui abrir o exemplo. Tenta de novo.');
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={clone}
        disabled={loading}
        className="w-full rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
      >
        {loading ? 'criando…' : 'usar como base ►'}
      </button>
      {err && <p className="mt-2 text-center text-xs text-magenta">{err}</p>}
    </div>
  );
}
