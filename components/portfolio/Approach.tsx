import { ArrowUpRight, Blocks, Braces, Cpu, Workflow } from 'lucide-react';
import Link from 'next/link';
import { workAreas } from '@/data/work-areas';

const icons = [Blocks, Braces, Cpu, Workflow];

export function Approach() {
  return (
    <section id="practice" aria-labelledby="practice-title" className="section-spacing border-t border-line bg-surface/45">
      <div className="section-shell">
        <p className="eyebrow mb-8"><span className="text-accent">02</span> / Practice</p>
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.4fr] lg:gap-16">
          <div>
            <h2 id="practice-title" data-reveal className="section-title">Talosys<span className="text-accent">.</span></h2>
            <p className="mt-5 text-lg text-paper">My software engineering company.</p>
            <p className="body-copy mt-5">This is where I take on client work alongside my own products. I work across application development, backend systems, integrations, and AI-assisted workflows.</p>
            <p className="body-copy mt-4">The starting point can be a new application or an existing codebase. The scope depends on the problem, current systems, and what needs to be handed over.</p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <Link href="/contact" data-magnetic className="button-primary">Project enquiries <ArrowUpRight aria-hidden="true" size={15} /></Link>
              <a href="https://talosys.tech" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-paper">talosys.tech <ArrowUpRight aria-hidden="true" size={14} /></a>
            </div>
            <div data-line aria-hidden="true" className="mt-9 h-px bg-line" />
            <div className="pt-6">
              <h3 className="eyebrow mb-3">Delivery & operations</h3>
              <p className="text-sm leading-relaxed text-muted">Docker, GitHub Actions, Linux, DigitalOcean, and Azure. Deployment, documentation, and the next person maintaining the system belong in the scope too.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {workAreas.map((area, index) => {
              const Icon = icons[index];
              return <article key={area.id} className="practice-card flex flex-col">
                <div className="mb-8 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/8 text-accent"><Icon aria-hidden="true" size={23} strokeWidth={1.5} /></span>
                  <span className="font-mono text-xs text-muted">0{index + 1}</span>
                </div>
                <h3 data-reveal className="text-xl font-medium tracking-tight">{area.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{area.scope}</p>
                <p className="mb-6 mt-5 border-l-2 border-accent/20 pl-3 text-xs leading-relaxed text-muted">{area.questions}</p>
                <ul aria-label={`${area.label} toolkit`} className="mt-auto flex flex-wrap gap-1.5">{area.tools.map((tool) => <li key={tool} className="tag">{tool}</li>)}</ul>
              </article>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
