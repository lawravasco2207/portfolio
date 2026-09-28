import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { EngineeringNoteList } from '@/components/portfolio/Notebook';

const title = 'Engineering notes | Lawrence Musyoka';
const description = 'Technical references on idempotency and retries, localhost trust boundaries, and AI output validation. Contracts, failure cases, and illustrative examples by Lawrence Musyoka.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/notes' },
  openGraph: { title, description, url: '/notes', type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-canvas text-paper">
      <a href="#notes-main" className="skip-link">Skip to engineering notes</a>
      <header className="border-b border-line">
        <nav aria-label="Notebook navigation" className="section-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent">
            <ArrowLeft aria-hidden="true" size={16} /> Back to portfolio
          </Link>
          <Link href="/work" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent">
            Work index <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </nav>
      </header>

      <main id="notes-main" tabIndex={-1} className="section-shell section-spacing">
        <header className="max-w-4xl">
          <p className="eyebrow mb-5">Notebook / Lawrence Musyoka</p>
          <h1 className="section-title">Engineering notes</h1>
          <p className="body-copy mt-6 max-w-3xl">
            A working reference for API behavior, integration boundaries, and AI-assisted
            applications. Each note starts with a concrete question, states the contract,
            and follows it through the failure paths.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            These are general software questions. Some connect to my work in architecture,
            engineering, and construction; the patterns also apply to other products and tools.
            Project references identify that context, not proof that every recommendation has shipped.
          </p>
        </header>

        <section aria-labelledby="notes-index-title" className="mt-12 sm:mt-16">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="notes-index-title" className="eyebrow">Reference index</h2>
            <p className="font-mono text-xs text-ochre">01–03 / Contracts & failure paths</p>
          </div>
          <EngineeringNoteList detailed />
        </section>

        <aside aria-labelledby="notes-reading-title" className="mt-10 grid gap-5 border border-line bg-surface p-5 sm:p-8 md:grid-cols-[1fr_2fr] md:gap-10">
          <div>
            <p className="eyebrow mb-2 text-ochre">Reading convention</p>
            <h2 id="notes-reading-title" className="text-xl font-medium tracking-tight">Examples, not implementation claims</h2>
          </div>
          <div className="space-y-3 text-sm leading-relaxed text-muted">
            <p>
              Snippets are explicitly illustrative. Their surrounding assumptions matter:
              a transaction sketch is not a complete persistence layer, and a request policy
              is not a security audit.
            </p>
            <p>
              Each note ends with failure checks, the checked-in sources that motivated it,
              and related notes. There are no implied deployment results or project performance claims.
            </p>
            <Link href="/work" className="inline-flex min-h-11 items-center gap-2 text-paper underline decoration-line underline-offset-4 hover:text-accent">
              Inspect the related work <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
