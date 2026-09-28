import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import projects from '@/data/projects.json';
import { workNotes } from '@/data/work-notes';
import { workAreas } from '@/data/work-areas';
import { WorkMap } from './WorkMap';

export function Hero() {
  const entries = workAreas.map((area) => ({
    id: area.id,
    projects: projects.filter((project) => workNotes[project.id]?.areas.includes(area.id)).map((project) => project.title),
  }));

  return (
    <section aria-labelledby="hero-title" className="hero-stage theme-dark">
      <div className="section-shell pt-8 sm:pt-12 lg:pt-14">
        <div data-hero-reveal className="mb-10 flex flex-wrap items-center justify-between gap-3 lg:mb-12">
          <p className="eyebrow flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ochre" />Software engineering / Independent practice</p>
          <p className="eyebrow">Nairobi, Kenya <span className="mx-2 text-line">—</span> UTC +03:00</p>
        </div>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <h1 id="hero-title" className="hero-title" aria-label="Lawrence Musyoka">
              <span className="hero-mask"><span data-hero-line className="block">Lawrence</span></span>
              <span className="hero-mask"><span data-hero-line className="hero-outline block">Musyoka<span className="text-ochre">.</span></span></span>
            </h1>
            <p data-hero-reveal className="mt-6 text-base text-paper sm:text-lg">Software engineer <span className="mx-2 text-muted">&</span> Founder, Talosys</p>
            <p data-hero-reveal className="mt-6 max-w-md text-base leading-relaxed text-muted">I build applications and integrations that make complex workflows usable—from Rust-based model tooling to web products and APIs.</p>
            <p data-hero-reveal className="mt-4 max-w-md text-sm leading-relaxed text-muted">I take on client work through <Link href="/practice" className="text-paper underline decoration-line underline-offset-4 hover:text-accent">Talosys</Link>. Here you can inspect the work, the decisions behind it, and small experiments.</p>
            <div data-hero-reveal className="mt-8 flex flex-wrap gap-3">
              <Link href="/work/portfolio" data-magnetic className="button-primary">See a case study <ArrowUpRight aria-hidden="true" size={16} /></Link>
              <Link href="/work" className="button-secondary">Browse the work <ArrowUpRight aria-hidden="true" size={16} /></Link>
            </div>
          </div>
          <WorkMap entries={entries} />
        </div>
        <div data-line aria-hidden="true" className="mt-10 h-px bg-line lg:mt-14" />
        <div className="flex flex-col justify-between gap-2 py-5 sm:flex-row sm:items-center">
          <Link href="/work" className="inline-flex min-h-11 items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-paper"><ArrowUpRight size={13} aria-hidden="true" />Browse all work</Link>
          <nav aria-label="Profile resources" className="flex flex-wrap items-center gap-6">
            <a href="https://github.com/lawravasco2207" className="inline-flex min-h-11 items-center gap-1.5 text-xs text-muted hover:text-paper">GitHub <ArrowUpRight aria-hidden="true" size={12} /></a>
            <a href="https://talosys.tech" className="inline-flex min-h-11 items-center gap-1.5 text-xs text-muted hover:text-paper">Talosys <ArrowUpRight aria-hidden="true" size={12} /></a>
            <Link href="/resume" className="inline-flex min-h-11 items-center gap-1.5 text-xs text-muted hover:text-paper">Résumé <ArrowUpRight aria-hidden="true" size={12} /></Link>
          </nav>
        </div>
      </div>
    </section>
  );
}
