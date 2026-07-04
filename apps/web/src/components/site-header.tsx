'use client';

import { Logo } from '@rebobinai/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#inspiracao', label: 'Inspiração' },
  { href: '#planos', label: 'Planos' },
  { href: '#faq', label: 'Perguntas frequentes' },
];

/**
 * Menu do topo que aparece ao sair do hero (home). Traz o logo e um menu
 * hambúrguer com as seções do site. Client — depende de scroll e do toggle.
 */
export function SiteHeader() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      const past = window.scrollY > window.innerHeight * 0.75;
      setShow(past);
      if (!past) setOpen(false);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-tape/90 backdrop-blur transition-transform duration-300 ${
        show ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Início" onClick={() => setOpen(false)}>
          <Logo size="sm" static />
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-glow hover:border-cyan hover:text-cyan"
          >
            {open ? (
              <span className="text-lg leading-none">✕</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>

          {open && (
            <nav className="absolute right-0 mt-2 w-60 overflow-hidden rounded-lg border border-[var(--line)] bg-panel shadow-xl">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-dim transition hover:bg-cyan/10 hover:text-cyan"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
