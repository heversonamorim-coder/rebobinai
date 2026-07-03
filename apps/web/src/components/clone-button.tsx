'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cloneExample } from '../lib/api';
import { saveDraftRef } from '../lib/gift';

/** "Usar como base": clona o exemplo num rascunho e leva pro editor (F2-5). */
export function CloneButton({ exampleId }: { exampleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function clone() {
    setLoading(true);
    try {
      const gift = await cloneExample(exampleId);
      saveDraftRef({ id: gift.id, editToken: gift.editToken });
      router.push('/criar');
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={clone}
      disabled={loading}
      className="w-full rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
    >
      {loading ? 'criando…' : 'usar como base ►'}
    </button>
  );
}
