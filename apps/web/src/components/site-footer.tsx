'use client';

import { Logo } from '@rebobinai/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiError, sendContactMessage } from '../lib/api';

const inputClass =
  'w-full rounded-lg border border-[var(--line)] bg-panel px-4 py-3 text-sm text-glow placeholder:text-dim/60 focus:border-cyan focus:outline-none';

/**
 * Rodapé institucional: marca, navegação, dados da empresa (razão social + CNPJ)
 * e o "fale conosco" — agora um link que abre o formulário num modal sobre a
 * página. Fica só nas páginas de marketing (nunca no viewer/editor).
 */
export function SiteFooter() {
  const [open, setOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-tape/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-16 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" aria-label="Início" className="inline-block">
            <Logo size="md" static />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-dim">
            O presente digital que rebobina a história de vocês — feito com IA, em minutos.
          </p>
        </div>

        <nav className="flex flex-col gap-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-dim">
          <Link href="/criar" className="transition hover:text-cyan">
            criar
          </Link>
          <Link href="/exemplos" className="transition hover:text-cyan">
            exemplos
          </Link>
          <Link href="/#planos" className="transition hover:text-cyan">
            planos
          </Link>
          <button type="button" onClick={() => setOpen(true)} className="text-left transition hover:text-cyan">
            fale conosco
          </button>
          <a
            href="https://instagram.com/rebobinai.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-cyan"
          >
            @rebobinai.app
          </a>
        </nav>

        <div className="md:text-right">
          <p className="font-mono text-[0.65rem] leading-relaxed uppercase tracking-[0.15em] text-dim/70">
            HJCM Tecnologia
            <br />
            CNPJ 48.656.525/0001-06
          </p>
          <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-dim/50">
            © {year} Rebobinaí ◄◄
            <br />
            toda história merece um replay
          </p>
        </div>
      </div>

      {open && <ContactModal onClose={() => setOpen(false)} />}
    </footer>
  );
}

/** Modal do "fale conosco" — o formulário sobre a página (Tarefa 6). */
function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Fecha no ESC e trava o scroll do fundo enquanto o modal está aberto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fale conosco"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-tape/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-panel p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-dim transition hover:text-magenta"
        >
          ✕
        </button>

        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-cyan">fale com a gente</p>
        <h2 className="mt-2 font-display text-xl font-bold text-glow">Ficou com alguma dúvida?</h2>
        <p className="mt-2 text-sm text-dim">Manda uma mensagem que a gente responde no seu e-mail.</p>

        {state === 'sent' ? (
          <div className="mt-6 rounded-lg border border-cyan/40 bg-cyan/10 px-4 py-6 text-center">
            <p className="font-display text-glow">Recebemos sua mensagem ◄◄</p>
            <p className="mt-1 text-sm text-dim">Logo a gente te responde por e-mail.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-cyan hover:underline"
            >
              fechar
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
  );
}
