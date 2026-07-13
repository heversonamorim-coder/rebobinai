'use client';

import { Logo } from '@rebobinai/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Âncoras absolutas (/#...) para funcionarem tanto na home quanto nas páginas
// internas (ex.: /exemplos), sempre levando às seções da página principal.
const LINKS = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#inspiracao', label: 'Inspiração' },
  { href: '/#planos', label: 'Planos' },
  { href: '/#faq', label: 'Perguntas frequentes' },
];

/**
 * Menu do topo com o logo e as seções do site.
 * - variant "hero" (padrão): aparece ao sair do hero na home (depende de scroll).
 * - variant "solid": sempre visível — para páginas internas sem hero (/exemplos).
 * Client — depende de scroll e do toggle do menu.
 */
export function SiteHeader({ variant = 'hero' }: { variant?: 'hero' | 'solid' }) {
  const solid = variant === 'solid';
  const [show, setShow] = useState(solid);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (solid) return; // sempre visível, sem depender de scroll
    function onScroll() {
      const past = window.scrollY > window.innerHeight * 0.75;
      setShow(past);
      if (!past) setOpen(false);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [solid]);

  return (
    <header
      className={`${solid ? 'sticky' : 'fixed'} inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-tape/90 backdrop-blur transition-transform duration-300 ${
        show ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Início" onClick={() => setOpen(false)}>
          <Logo size="sm" static withMark />
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
