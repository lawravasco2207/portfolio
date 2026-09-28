'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { MotionToggle } from '@/components/motion/MotionProvider';

const navigation = [
  { href: '/work', label: 'Work' },
  { href: '/practice', label: 'Practice' },
  { href: '/notes', label: 'Notebook' },
  { href: '/lab', label: 'Lab' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [menuOpen]);

  return (
    <header ref={header} className="site-header theme-dark sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-lg">
      <div className="section-shell flex min-h-20 items-center justify-between gap-4">
        <Link href="/" aria-label="Lawrence Musyoka, home" onClick={() => setMenuOpen(false)} className="group flex shrink-0 items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-mono text-sm font-semibold text-canvas">LM<span>.</span></span>
          <span className="hidden text-xs font-medium tracking-tight sm:block">Lawrence Musyoka<span className="mt-0.5 block font-mono text-[10px] font-normal uppercase tracking-[.12em] text-muted">Software engineer</span></span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
          {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className="py-3 text-xs text-muted transition-colors hover:text-paper aria-[current=page]:text-paper">{item.label}</Link>)}
          <Link href="/contact" aria-current={pathname === '/contact' ? 'page' : undefined} className="inline-flex items-center gap-2 border-b border-accent py-2 text-xs text-paper">Contact <ArrowUpRight aria-hidden="true" size={14} /></Link>
        </nav>
        <div className="flex items-center gap-3">
          <MotionToggle className="min-h-11 border-line text-muted hover:text-paper" />
        <button ref={menuButton} type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(!menuOpen)} className="flex h-11 w-11 items-center justify-center rounded-full border border-line lg:hidden">
          {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        </div>
      </div>
      <nav id="mobile-navigation" aria-label="Mobile navigation" hidden={!menuOpen} className="border-t border-line bg-canvas px-5 py-4 lg:hidden">
        {[...navigation, { href: '/contact', label: 'Contact' }].map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} onClick={() => setMenuOpen(false)} className="block border-b border-line py-4 text-sm text-paper last:border-0 aria-[current=page]:text-accent">{item.label}</Link>)}
      </nav>
      <div data-motion-progress aria-hidden="true" className="page-progress" />
    </header>
  );
}
