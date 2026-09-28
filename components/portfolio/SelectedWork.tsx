'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ArrowUpRight, Plus, Search, X } from 'lucide-react';
import { getProjects, type Project } from '@/app/actions';
import localProjects from '@/data/projects.json';
import { workNotes } from '@/data/work-notes';
import { workAreas, type WorkAreaId } from '@/data/work-areas';
import { SourceNotebook } from '@/components/portfolio/SourceNotebook';
import { ProjectVisual } from '@/components/portfolio/ProjectVisual';
import { useMotionPreference } from '@/components/motion/MotionProvider';

gsap.registerPlugin(useGSAP);

function safeLink(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch { return undefined; }
}

export function SelectedWork() {
  const gallery = useRef<HTMLDivElement>(null);
  const { enabled } = useMotionPreference();
  const [projects, setProjects] = useState<Project[]>(localProjects as Project[]);
  const [filter, setFilter] = useState<WorkAreaId | 'all'>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    getProjects().then((items) => {
      if (active && Array.isArray(items)) setProjects(items.filter((item) => item.mode === 'tech'));
    }).catch(() => {
      // Checked-in work remains readable when the optional content store is unavailable.
    });
    return () => { active = false; };
  }, []);

  const visibleProjects = projects.filter((project) => {
    const note = workNotes[project.id];
    const matchesArea = filter === 'all' || note?.areas.includes(filter);
    const searchable = [project.title, project.description, ...(project.stack ?? []), note?.domain, note?.headline].join(' ').toLowerCase();
    return matchesArea && searchable.includes(query.trim().toLowerCase());
  });

  const resultKey = JSON.stringify(visibleProjects.map((project) => project.id));

  useGSAP(() => {
    if (!enabled) return;
    const cards = gallery.current?.querySelectorAll<HTMLElement>('[data-project-card]');
    if (!cards?.length) return;

    // Animate entries, not the grid's height; controls and disclosures remain live.
    gsap.fromTo(cards, { y: 18, opacity: 0.6 }, {
      y: 0,
      opacity: 1,
      duration: 0.45,
      stagger: 0.065,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
    });
  }, { scope: gallery, dependencies: [enabled, resultKey], revertOnUpdate: true });

  function resetFilters() { setFilter('all'); setQuery(''); }

  return (
    <section id="work" aria-labelledby="work-title" className="section-spacing border-t border-line">
      <div className="section-shell">
        <p className="eyebrow mb-7"><span className="text-accent">01</span> / Work index</p>
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-20">
          <h2 id="work-title" data-reveal="" className="section-title">Selected work</h2>
          <p className="body-copy max-w-xl">Browse by the engineering involved. Each entry keeps its original domain and includes implementation notes, tools, and a source or project link.</p>
        </div>
        <div data-line="" aria-hidden="true" className="mt-8 h-px origin-left bg-line" />

        <div id="work-proof" className="mt-8 grid overflow-hidden rounded-3xl border border-line bg-surface/50 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col justify-center p-5 sm:p-8">
            <p className="eyebrow text-accent">Start with something you can use</p>
            <h3 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">The site behind this site</h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">Try the searchable work index, the local experiments, and the failure-aware contact flow. Then inspect how they are built in the source and tests.</p>
            <Link href="/work/portfolio" className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-accent underline underline-offset-4 hover:text-paper">Read the case study <ArrowUpRight aria-hidden="true" size={16} /></Link>
          </div>
          <figure className="min-w-0 border-t border-line bg-[#111522] md:border-t-0 md:border-l">
            <Image src="/assets/portfolio-home.png" alt="Captured homepage of this portfolio, with its introduction and engineering map" width={1440} height={1000} sizes="(max-width: 768px) 100vw, 55vw" className="aspect-[16/9] w-full object-cover object-top" />
            <figcaption className="px-4 py-2 font-mono text-[10px] leading-relaxed text-[#f5f5f7]">Actual local browser capture / this portfolio</figcaption>
          </figure>
        </div>

        <div className="my-7 space-y-4 sm:my-9">
          <div role="group" aria-label="Filter work by engineering area" className="flex flex-wrap gap-2">
            {[{ id: 'all', label: 'All work' }, ...workAreas].map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id as WorkAreaId | 'all')}
                className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${filter === item.id ? 'border-accent bg-accent text-canvas' : 'border-line bg-canvas text-muted hover:border-muted hover:bg-surface hover:text-paper'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-line bg-surface/60 px-4 transition-colors focus-within:border-accent focus-within:bg-canvas">
              <Search size={16} aria-hidden="true" className="shrink-0 text-muted" />
              <label htmlFor="work-search" className="sr-only">Search projects, technologies, or domains</label>
              <input id="work-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a project, technology, or domain…" className="min-h-12 min-w-0 flex-1 rounded-sm bg-transparent py-3 text-sm text-paper placeholder:text-muted" />
              {query && <button type="button" aria-label="Clear project search" onClick={() => setQuery('')} className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-paper"><X size={16} aria-hidden="true" /></button>}
            </div>
            <p aria-live="polite" aria-atomic="true" className="flex items-center gap-2.5 font-mono text-[11px] text-muted"><span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />{visibleProjects.length} of {projects.length} entries</p>
          </div>
        </div>

        <div ref={gallery} className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:gap-8">
          {visibleProjects.map((project) => {
            const note = workNotes[project.id];
            const repositoryLink = project.id === 'vex-atlas' ? undefined : safeLink(project.githubLink);
            const websiteLink = project.id === 'vex-atlas' ? undefined : safeLink(project.link);
            return (
              <article key={project.id} data-project-card={project.id} className="group min-w-0 rounded-3xl border border-line bg-canvas shadow-[0_4px_20px_-16px_rgba(32,35,43,0.3)] [overflow-wrap:anywhere]">
                <div className="relative m-2">
                  {project.id === 'portfolio'
                    ? <Image src="/assets/portfolio-home.png" alt="" width={1440} height={1000} sizes="(max-width: 768px) 100vw, 50vw" className="aspect-[16/9] w-full rounded-[18px] object-cover object-top" />
                    : <ProjectVisual projectId={project.id} />}
                  <span className="absolute right-3 bottom-3 rounded-full border border-line/70 bg-canvas/95 px-2.5 py-1 font-mono text-[10px] text-muted">{project.id === 'portfolio' ? 'Actual site' : 'Concept artwork'}</span>
                  <p className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-line/70 bg-canvas/95 px-3 py-1.5 font-mono text-[10px] tracking-wide text-muted sm:top-4 sm:left-4">
                    <span className="text-accent">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
                    <span aria-hidden="true" className="h-3 w-px bg-line" />
                    {note?.category ?? 'Project'}
                  </p>
                </div>
                <div className="px-5 pt-4 pb-5 sm:px-7 sm:pt-5 sm:pb-6">
                  <h3 className="text-[clamp(1.65rem,2.7vw,2.25rem)] leading-tight font-medium tracking-[-.045em] text-paper">{project.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{note?.discipline ?? 'Software engineering'}</p>
                  <h4 className="mt-5 text-base leading-snug font-medium tracking-[-.015em] text-paper">{note?.headline ?? project.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>
                  {note && (
                    <dl className="mt-5 grid gap-4 border-y border-line/80 py-4 text-xs leading-relaxed sm:grid-cols-2">
                      <div className="min-w-0"><dt className="mb-1 font-mono text-[10px] tracking-wider text-muted uppercase">Domain /</dt><dd className="text-paper">{note.domain}</dd></div>
                      <div className="min-w-0"><dt className="mb-1 font-mono text-[10px] tracking-wider text-muted uppercase">Role /</dt><dd className="text-paper">{note.role}</dd></div>
                    </dl>
                  )}
                  <ul aria-label={`${project.title} technologies`} className="mt-5 flex flex-wrap gap-1.5">
                    {project.stack?.map((tech) => <li key={tech} className="max-w-full rounded-lg border border-line/70 bg-surface/60 px-2.5 py-1.5 font-mono text-[10px] leading-normal text-muted">{tech}</li>)}
                  </ul>
                  {(repositoryLink || websiteLink || ['portfolio', 'vex', 'vex-atlas'].includes(project.id)) && (
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
                      {['portfolio', 'vex', 'vex-atlas'].includes(project.id) && <Link href={`/work/${project.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-sm text-xs font-medium text-accent underline underline-offset-4 hover:text-paper">Case study <ArrowUpRight aria-hidden="true" size={15} /><span className="sr-only"> for {project.title}</span></Link>}
                      {repositoryLink && <a href={repositoryLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-xs font-medium text-paper underline decoration-line underline-offset-4 hover:text-accent">Source <ArrowUpRight aria-hidden="true" size={15} className="shrink-0" /><span className="sr-only"> for {project.title} (opens in a new tab)</span></a>}
                      {websiteLink && <a href={websiteLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-xs font-medium text-paper underline decoration-line underline-offset-4 hover:text-accent">Website <ArrowUpRight aria-hidden="true" size={15} className="shrink-0" /><span className="sr-only"> for {project.title} (opens in a new tab)</span></a>}
                    </div>
                  )}
                </div>
                {note && (
                  <details className="work-details mx-5 border-t border-line sm:mx-7">
                    <summary className="flex min-h-14 list-none items-center justify-between gap-3 rounded-sm py-4 text-xs font-medium text-accent">
                      <span>Implementation notes<span className="sr-only"> for {project.title}</span></span>
                      <Plus aria-hidden="true" size={16} className="details-icon shrink-0 transition-transform" />
                    </summary>
                    <div className="mb-6 grid gap-5 rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
                      <div><h5 className="eyebrow mb-2">Context</h5><p className="text-sm leading-relaxed text-muted">{note.problem}</p></div>
                      <div><h5 className="eyebrow mb-2">Implementation</h5><p className="text-sm leading-relaxed text-muted">{note.approach}</p></div>
                      <div><h5 className="eyebrow mb-2">Design choice</h5><p className="text-sm leading-relaxed text-paper">{note.decision}</p></div>
                      <div><h5 className="eyebrow mb-2">Engineering question</h5><p className="text-sm leading-relaxed text-paper">{note.question}</p></div>
                      <p className="border-t border-line pt-4 font-mono text-[10px] leading-relaxed text-muted">{project.id === 'vex-atlas' ? 'Public overview only. The Vex Atlas source repository is internal; the case study covers the project without linking to private code.' : <>Scope documented in {note.source === 'resume' ? <Link href="/resume" className="underline underline-offset-4 hover:text-paper">my résumé</Link> : 'the project description'}. Repository links show published source, which may differ from local work in progress.</>}</p>
                    </div>
                  </details>
                )}
              </article>
            );
          })}
        </div>
        {visibleProjects.length === 0 && (
          <div className="rounded-3xl border border-dashed border-line bg-surface/50 px-5 py-12 text-center">
            <Search aria-hidden="true" size={22} className="mx-auto mb-4 text-muted" />
            <p className="body-copy">No entries match this selection.</p>
            <button type="button" onClick={resetFilters} className="button-secondary mt-5 rounded-full">Clear filters</button>
          </div>
        )}
        <div className="mt-10 min-w-0 [&>details]:rounded-2xl"><SourceNotebook /></div>
      </div>
    </section>
  );
}
