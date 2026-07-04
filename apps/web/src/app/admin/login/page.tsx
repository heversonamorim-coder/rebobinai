'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-panel px-4 py-3 text-glow placeholder:text-dim/60 focus:border-cyan focus:outline-none';
const labelClass = 'mb-2 block font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim';

export default function AdminLoginPage() {
  const router = useRouter();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ user, password }),
      });
      if (res.ok) {
        router.replace('/admin');
        router.refresh();
      } else {
        const b = (await res.json().catch(() => ({}))) as { message?: string };
        setError(b.message ?? 'Não foi possível entrar.');
      }
    } catch {
      setError('Falha de rede.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center px-5">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-dim">
        <span className="rb-rew">◄◄</span> Rebobinaí · admin
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-glow">Painel de vendas</h1>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg border border-magenta/50 bg-magenta/10 px-4 py-3 text-sm text-glow">
            {error}
          </p>
        )}
        <div>
          <label className={labelClass} htmlFor="user">
            Usuário
          </label>
          <input id="user" className={inputClass} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'entrando…' : 'entrar ►'}
        </button>
      </form>
    </main>
  );
}
