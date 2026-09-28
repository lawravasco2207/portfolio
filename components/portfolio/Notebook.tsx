import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { engineeringNotes } from '@/data/engineering-notes';

export function EngineeringNoteList({ detailed = false }: { detailed?: boolean }) {
  const Heading = detailed ? 'h2' : 'h3';

  return (
    <ol role="list" className={detailed ? 'space-y-5' : 'grid gap-5 lg:grid-cols-3'}>
      {engineeringNotes.map((note) => (
        <li key={note.slug} className="min-w-0">
          <Link href={`/notes/${note.slug}`} aria-labelledby={`note-${note.slug}-title`} aria-describedby={`note-${note.slug}-description`} className="notebook-card group">
            <div className="mb-9 flex items-start justify-between gap-4">
              <span aria-hidden="true" className="font-mono text-5xl font-light tracking-[-.08em] text-accent/60">{note.number}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-paper transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-canvas"><ArrowUpRight aria-hidden="true" size={19} /></span>
            </div>
            <p className="eyebrow mb-3">{note.category}</p>
            <Heading id={`note-${note.slug}-title`} className="text-2xl font-medium leading-tight tracking-tight text-paper sm:text-[1.7rem]">{note.title}</Heading>
            <p id={`note-${note.slug}-description`} className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{note.description}</p>
            {detailed && (
              <dl className="mt-5 grid gap-4 border-t border-line pt-5 text-sm leading-relaxed md:grid-cols-2 md:gap-8">
                <div><dt className="eyebrow mb-1">Starting question</dt><dd className="text-paper">{note.question}</dd></div>
                <div><dt className="eyebrow mb-1">Applies to</dt><dd className="text-muted">{note.scope}</dd></div>
              </dl>
            )}
            <div className="mt-auto pt-8"><span className="inline-flex items-center gap-2 border-b border-line pb-1 text-xs text-accent">Read note {note.number} <ArrowRight size={13} aria-hidden="true" /></span></div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function Notebook() {
  return (
    <section id="notebook" aria-labelledby="notebook-title" className="section-spacing border-t border-line bg-canvas text-paper">
      <div className="section-shell">
        <p className="eyebrow mb-8"><span className="text-accent">03</span> / Working reference</p>
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <h2 id="notebook-title" data-reveal className="section-title">In the<br /><span className="editorial">notebook.</span></h2>
          <p className="body-copy max-w-2xl">Notes on the parts of software that need an explicit contract: retries, local services, and AI-assisted workflows. Assumptions, failure cases, and checks to keep close to the implementation.</p>
        </div>
        <div className="mt-10"><EngineeringNoteList /></div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
          <p className="max-w-xl text-sm leading-relaxed text-muted">Technical references with illustrative examples and links back to the work that gives them context.</p>
          <Link href="/notes" className="button-secondary shrink-0">Browse the notebook <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </div>
    </section>
  );
}
