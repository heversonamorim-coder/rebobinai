'use client';

import { Logo } from '@rebobinai/ui';
import Link from 'next/link';
import { useState } from 'react';
import { ApiError, sendContactMessage } from '../lib/api';

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-panel px-4 py-3 text-sm text-glow placeholder:text-dim/60 focus:border-cyan focus:outline-none';

/**
 * Rodapé institucional: marca, navegação, "fale conosco" (grava no admin) e os
 * dados da empresa (razão social + CNPJ) pro cliente associar ao site. Fica só
 * nas páginas de marketing (home) — nunca no viewer fullscreen nem no editor.
 */
export function SiteFooter() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const year = new Date().getFullYear();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Preencha nome, e-mail e mensagem.');
      setState('error');
      return;
    }
    setState('sending');
    setError(null);
    try {
      await sendContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() });
      setState('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível enviar. Tente de novo.');
      setState('error');
    }
  }

  return (
    <footer className="border-t border-[var(--line)] bg-tape/40">
      <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 md:grid-cols-2">
        {/* Marca + navegação + empresa */}
        <div className="flex flex-col">
          <Link href="/" aria-label="Início" className="inline-block">
            <Logo size="md" static />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim">
            O presente digital que rebobina a história de vocês — feito com IA, em minutos.
          </p>

          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim">
            <Link href="/criar" className="transition hover:text-cyan">
              criar
            </Link>
            <Link href="/exemplos" className="transition hover:text-cyan">
              exemplos
            </Link>
            <Link href="/#planos" className="transition hover:text-cyan">
              planos
            </Link>
            <a
              href="https://instagram.com/rebobinai.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-cyan"
            >
              @rebobinai.app
            </a>
          </nav>

          <div className="mt-auto pt-10">
            <p className="font-mono text-[0.65rem] leading-relaxed uppercase tracking-[0.15em] text-dim/70">
              HJCM Tecnologia
              <br />
              CNPJ 48.656.525/0001-06
            </p>
            <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/50">
              © {year} Rebobinaí ◄◄ · toda história merece um replay
            </p>
          </div>
        </div>

        {/* Fale conosco */}
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">fale com a gente</p>
          <h2 className="mt-2 font-display text-xl font-bold text-glow">Ficou com alguma dúvida?</h2>
          <p className="mt-2 text-sm text-dim">
            Manda uma mensagem que a gente responde no seu e-mail.
          </p>

          {state === 'sent' ? (
            <div className="mt-6 rounded-lg border border-cyan/40 bg-cyan/10 px-4 py-6 text-center">
              <p className="font-display text-glow">Recebemos sua mensagem ◄◄</p>
              <p className="mt-1 text-sm text-dim">Logo a gente te responde por e-mail.</p>
              <button
                type="button"
                onClick={() => setState('idle')}
                className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan hover:underline"
              >
                enviar outra
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                className={inputClass}
                placeholder="Seu nome"
                value={name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className={inputClass}
                placeholder="Seu e-mail"
                value={email}
                maxLength={180}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                placeholder="Sua mensagem"
                value={message}
                maxLength={4000}
                onChange={(e) => setMessage(e.target.value)}
              />
              {error && <p className="text-sm text-magenta">{error}</p>}
              <button
                type="submit"
                disabled={state === 'sending'}
                className="w-full rounded-lg bg-magenta px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.15em] text-tape transition hover:brightness-110 disabled:opacity-50"
              >
                {state === 'sending' ? 'enviando…' : 'enviar mensagem ►'}
              </button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
}
