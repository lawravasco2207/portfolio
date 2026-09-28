'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useMotionPreference } from '@/components/motion/MotionProvider';
import { workAreas, type WorkAreaId } from '@/data/work-areas';
import { SignalSculpture } from './SignalSculpture';

gsap.registerPlugin(useGSAP);

type IndexEntry = { id: WorkAreaId; projects: string[] };

export function WorkMap({ entries }: { entries: IndexEntry[] }) {
  const [selectedId, setSelectedId] = useState<WorkAreaId>('applications');
  const root = useRef<HTMLElement>(null);
  const previousId = useRef(selectedId);
  const { enabled } = useMotionPreference();
  const area = workAreas.find((item) => item.id === selectedId) ?? workAreas[0];
  const selected = entries.find((item) => item.id === selectedId);

  useGSAP(() => {
    const changed = previousId.current !== selectedId;
    previousId.current = selectedId;
    if (!enabled || !changed) return;

    gsap.fromTo('[data-work-map-content]', { y: 6 }, {
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, { scope: root, dependencies: [selectedId, enabled], revertOnUpdate: true });

  return (
    <aside ref={root} aria-labelledby="work-map-title" data-hero-reveal className="work-map min-w-0 text-paper">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
        <h2 id="work-map-title" className="eyebrow text-paper">Engineering map</h2>
        <span className="font-mono text-[10px] text-muted sm:hidden">Work areas / 01</span>
        <span className="hidden font-mono text-[10px] text-muted sm:inline">Generative study / 01</span>
      </div>

      <div className="hidden sm:block"><SignalSculpture selectedId={selectedId} /></div>

      <div role="group" aria-label="Explore engineering areas" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {workAreas.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={selectedId === item.id}
            aria-controls="work-map-detail"
            onClick={() => setSelectedId(item.id)}
            className={`min-h-11 rounded-full border px-3 py-2 text-center text-xs font-medium motion-safe:transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${selectedId === item.id ? 'border-accent bg-accent text-canvas' : 'border-line bg-surface/60 text-muted hover:border-muted hover:text-paper'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="work-map-detail" aria-live="polite" aria-atomic="true" className="mt-4 min-h-46 rounded-2xl border border-line bg-surface/50 px-4 pt-4 pb-1 sm:px-5">
        <div data-work-map-content>
          <p className="text-sm leading-relaxed text-paper">{area.detail}</p>
          <ul aria-label={`${area.label} tools`} className="mt-3 flex flex-wrap gap-1.5">
            {area.tools.map((tool) => <li key={tool} className="tag rounded-full">{tool}</li>)}
          </ul>
          <div className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-t border-line pt-3 text-xs leading-relaxed">
            <span className="pt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">In the index</span>
            <span className="text-paper [overflow-wrap:anywhere]">{selected?.projects.join(' / ')}</span>
          </div>
        </div>
        <Link href="/work" className="mt-1 inline-flex min-h-11 items-center gap-2 text-xs text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          Browse project details <ArrowUpRight size={13} aria-hidden="true" />
        </Link>
      </div>
      <p className="mt-3 px-1 font-mono text-[10px] leading-relaxed text-muted">Related work, grouped by engineering area—not separate industries.</p>
    </aside>
  );
}
