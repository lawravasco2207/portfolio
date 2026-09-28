import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { engineeringNotes, getEngineeringNote, type EngineeringNoteSection } from '@/data/engineering-notes';

type NotePageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return engineeringNotes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getEngineeringNote(slug);
  if (!note) notFound();

  const title = `${note.title} | Lawrence Musyoka`;
  const url = `/notes/${note.slug}`;
  return {
    title,
    description: note.description,
    authors: [{ name: 'Lawrence Musyoka' }],
    alternates: { canonical: url },
    openGraph: { title, description: note.description, url, type: 'article' },
    twitter: { card: 'summary_large_image', title, description: note.description },
  };
}

function NoteSection({ section, number }: { section: EngineeringNoteSection; number: number }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} tabIndex={-1} className="min-w-0 scroll-mt-8 border-t border-line pt-8">
      <p className="eyebrow mb-3 text-ochre">{String(number).padStart(2, '0')}</p>
      <h2 id={`${section.id}-title`} className="text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
        {section.title}
      </h2>
      <div className="mt-5 space-y-5">
        {section.paragraphs.map((paragraph) => <p key={paragraph} className="body-copy">{paragraph}</p>)}
      </div>
      {section.code && (
        <figure className="mt-6 min-w-0 border border-line bg-surface">
          <figcaption id={`${section.id}-code-caption`} className="border-b border-line px-4 py-3 sm:px-5">
            <span className="eyebrow block text-ochre">{section.code.language} / Illustrative</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{section.code.caption}</span>
          </figcaption>
          <pre
            tabIndex={0}
            role="region"
            aria-labelledby={`${section.id}-code-caption`}
            className="max-w-full overflow-x-auto p-4 font-mono text-xs leading-7 text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-5 sm:text-sm print:whitespace-pre-wrap print:break-words"
          >
            <code>{section.code.source}</code>
          </pre>
        </figure>
      )}
      {section.points && (
        <dl className="mt-6 divide-y divide-line border-y border-line">
          {section.points.map((point) => (
            <div key={point.label} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6">
              <dt className="text-sm font-medium leading-relaxed text-paper">{point.label}</dt>
              <dd className="text-sm leading-relaxed text-muted">{point.detail}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default async function EngineeringNotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = getEngineeringNote(slug);
  if (!note) notFound();

  const relatedNotes = engineeringNotes.filter((candidate) => note.relatedSlugs.includes(candidate.slug));

  return (
    <div className="min-h-screen bg-canvas text-paper">
      <a href="#note-main" className="skip-link">Skip to note</a>
      <header className="border-b border-line">
        <nav aria-label="Notebook navigation" className="section-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
          <Link href="/notes" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent">
            <ArrowLeft aria-hidden="true" size={16} /> All engineering notes
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent">
            Portfolio <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </nav>
      </header>

      <main id="note-main" tabIndex={-1} className="section-shell section-spacing">
        <article aria-labelledby="note-title">
          <header className="max-w-4xl">
            <p className="eyebrow mb-5"><span className="text-ochre">Note {note.number}</span> / {note.category}</p>
            <h1 id="note-title" className="section-title">{note.title}</h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-paper sm:text-2xl">{note.question}</p>
            <p className="body-copy mt-4 max-w-3xl">{note.description}</p>
            <p className="mt-5 text-sm text-muted">Lawrence Musyoka / Engineering notebook</p>
          </header>

          <div className="mt-10 grid gap-6 border border-line bg-surface p-5 sm:p-8 md:grid-cols-[1fr_2fr] md:gap-10">
            <div>
              <h2 className="eyebrow mb-3">Applies to</h2>
              <p className="text-sm leading-relaxed text-muted">{note.scope}</p>
            </div>
            <div className="border-l-2 border-ochre pl-5">
              <h2 className="eyebrow mb-3 text-ochre">The invariant</h2>
              <p className="text-base leading-relaxed text-paper sm:text-lg">{note.invariant}</p>
            </div>
          </div>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
            <nav aria-label="On this page" className="min-w-0 border-t border-line pt-5 lg:sticky lg:top-8">
              <p className="eyebrow mb-3">In this note</p>
              <ol role="list" className="space-y-1">
                {note.sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="flex min-h-11 items-start gap-3 py-2 text-sm leading-relaxed text-muted hover:text-accent">
                      <span aria-hidden="true" className="shrink-0 font-mono text-xs leading-6 text-ochre">{String(index + 1).padStart(2, '0')}</span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
              <a href="#source-context" className="mt-4 inline-flex min-h-11 items-center text-sm text-paper underline decoration-line underline-offset-4 hover:text-accent">Source context & limits</a>
            </nav>

            <div className="min-w-0 max-w-3xl space-y-12">
              {note.sections.map((section, index) => <NoteSection key={section.id} section={section} number={index + 1} />)}

              <section id="source-context" aria-labelledby="source-context-title" tabIndex={-1} className="scroll-mt-8 border border-line bg-surface p-5 sm:p-7">
                <p className="eyebrow mb-3 text-ochre">Provenance</p>
                <h2 id="source-context-title" className="text-2xl font-medium tracking-tight">Source context & limits</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  The references below distinguish checked-in context from the recommendations in this note.
                  All snippets are illustrative, not copied production implementations.
                </p>
                <div className="mt-6 space-y-7">
                  {note.references.map((reference) => (
                    <div key={reference.label} className="border-t border-line pt-5">
                      <h3 className="text-base font-medium leading-relaxed">{reference.label}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{reference.detail}</p>
                      <ul aria-label={`Checked-in sources for ${reference.label}`} className="mt-3 space-y-1">
                        {reference.paths.map((path) => <li key={path}><code className="break-words font-mono text-xs text-muted">{path}</code></li>)}
                      </ul>
                      <Link href={reference.href} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline decoration-line underline-offset-4 hover:text-paper">
                        {reference.linkLabel} <ArrowUpRight aria-hidden="true" size={15} className="shrink-0" />
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </article>

        <nav aria-labelledby="related-notes-title" className="mt-16 border-t border-line pt-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="related-notes-title" className="eyebrow">Related notes</h2>
            <Link href="/notes" className="button-secondary"><ArrowLeft aria-hidden="true" size={15} /> Back to the index</Link>
          </div>
          <ul role="list" className="grid gap-4 md:grid-cols-2">
            {relatedNotes.map((related) => (
              <li key={related.slug} className="min-w-0">
                <Link href={`/notes/${related.slug}`} className="group flex h-full items-start justify-between gap-5 border border-line bg-surface p-5 hover:border-muted sm:p-7">
                  <div className="min-w-0">
                    <p className="eyebrow mb-3 text-ochre">Note {related.number} / {related.category}</p>
                    <h3 className="text-xl font-medium tracking-tight group-hover:text-accent">{related.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{related.description}</p>
                  </div>
                  <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-accent" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/work" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted underline decoration-line underline-offset-4 hover:text-accent">
            Return to the work index <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
