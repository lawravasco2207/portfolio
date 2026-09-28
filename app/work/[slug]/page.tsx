import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Footer } from '@/components/Footer';

const studies = {
  portfolio: {
    title: 'Portfolio & notebook',
    category: 'Web application / this repository',
    description: 'A public work index that remains readable when optional services are unavailable, with interactive studies and a protected editing path.',
    problem: 'A portfolio should make the work inspectable without requiring every visitor to connect to storage, email, or GitHub. Editing content still needs a server-side trust boundary.',
    contribution: 'I built the Next.js interface, searchable work index, local engineering experiments, technical notebook, server actions, and authenticated admin workflow in this repository.',
    decision: 'Keep core project and note content checked in. Load optional project data and repository snapshots separately, and authorize edits on the server rather than trusting the admin UI.',
    result: 'You can browse the work and run both experiments here without configuring external services. The contact form reports an unconfigured mail service instead of claiming a message was sent.',
    limits: 'The experiments use local, synthetic data. SMTP, Spaces, and repository snapshots are optional integrations; this case study does not claim they are configured on a live deployment or measure visitor outcomes.',
    source: 'https://github.com/lawravasco2207/portfolio',
  },
  'vex-atlas': {
    title: 'Vex Atlas',
    category: 'Cloud coordination / engineering data',
    description: 'A cloud layer for Vex that connects local engineering tools, project data, and browser-based model review.',
    problem: 'Local model tools need a shared place to coordinate accounts and project work without moving all model processing into the cloud.',
    contribution: 'My project notes describe my work on an ASP.NET Core API, a PostgreSQL data layer, and a Next.js review interface. The public record covers the scope, not the internal implementation.',
    decision: 'Keep local model processing distinct from cloud coordination and make the boundary between tools and review workflows explicit.',
    result: 'This public overview explains the project’s purpose and my documented role. It does not claim a deployment, adoption, or measured performance result.',
    limits: 'The repository is internal for security reasons. The diagram is a high-level explanation, not production topology or a captured product screen; no private source or live system data is shared here.',
  },
  vex: {
    title: 'Vex',
    category: 'Systems / engineering data',
    description: 'Semantic version control for BIM and IFC models, organized around model entities and relationships rather than file-level text changes.',
    problem: 'An IFC file can change its serialization without changing the building elements a reviewer cares about. A raw text diff makes those differences hard to separate.',
    contribution: 'My project notes and résumé describe my work on a Rust STEP parser, normalized property graph, Merkle hashing, and content-addressable storage for model comparisons.',
    decision: 'Compare a representation of the model instead of treating serialized file lines as the meaning of the model. That moves the review question from “which lines changed?” to “which elements and properties changed?”',
    result: 'The documented design produces a basis for semantic model comparisons. Follow the linked source to inspect the implementation; this page does not present a measured performance or adoption result.',
    limits: 'The diagram below summarizes the documented approach; it is not a captured Vex run or IFC output. The separate interactive model-revision study on this site uses synthetic data and is not Vex.',
    source: 'https://github.com/PlanMorph-Org/vex',
  },
} as const;

type Slug = keyof typeof studies;
type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(studies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in studies)) notFound();
  const study = studies[slug as Slug];
  return {
    title: `${study.title} | Case study | Lawrence Musyoka`,
    description: study.description,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { title: `${study.title} | Case study`, description: study.description, url: `/work/${slug}`, type: 'article' },
  };
}

export default async function WorkCaseStudy({ params }: PageProps) {
  const { slug } = await params;
  if (!(slug in studies)) notFound();
  const study = studies[slug as Slug];
  const source = 'source' in study ? study.source : undefined;

  return (
    <div className="min-h-screen bg-canvas text-paper">
      <a href="#case-main" className="skip-link">Skip to case study</a>
      <header className="border-b border-line">
        <nav aria-label="Case study navigation" className="section-shell flex flex-wrap items-center justify-between gap-3 py-5">
          <Link href="/work" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent"><ArrowLeft aria-hidden="true" size={16} /> All work</Link>
          <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-accent">Get in touch <ArrowUpRight aria-hidden="true" size={16} /></Link>
        </nav>
      </header>

      <main id="case-main" tabIndex={-1} className="section-shell section-spacing">
        <article aria-labelledby="case-title">
          <header className="max-w-4xl">
            <p className="eyebrow mb-6 text-accent">Case study / {study.category}</p>
            <h1 id="case-title" className="section-title">{study.title}</h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed sm:text-2xl">{study.description}</p>
            {source ? <a href={source} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline underline-offset-4 hover:text-paper">Inspect the source <ArrowUpRight aria-hidden="true" size={16} /><span className="sr-only"> (opens in a new tab)</span></a> : <p className="eyebrow mt-6 text-muted">Public overview / source kept internal</p>}
          </header>

          {slug === 'portfolio' ? (
            <figure className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface">
              <Image src="/assets/portfolio-home.png" alt="Captured homepage of this portfolio, showing the introduction and engineering map" width={1440} height={1000} sizes="(max-width: 1440px) 100vw, 1280px" className="h-auto w-full" priority />
              <figcaption className="border-t border-line p-4 text-xs leading-relaxed text-muted sm:px-6">Actual homepage capture from the local browser smoke test. The site you are using is the product shown here.</figcaption>
            </figure>
          ) : slug === 'vex-atlas' ? (
            <figure className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-8">
              <p className="eyebrow text-accent">Public scope / based on project notes</p>
              <ol className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  ['01', 'Local tools', 'Model work stays with the tools that produce it'],
                  ['02', 'Cloud coordination', 'Accounts and shared project context'],
                  ['03', 'Browser review', 'A place to inspect model changes together'],
                ].map(([number, title, detail]) => (
                  <li key={number} className="min-w-0 rounded-xl border border-line bg-canvas p-4">
                    <span className="font-mono text-xs text-accent">{number} /</span>
                    <h2 className="mt-3 text-base font-medium">{title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
                  </li>
                ))}
              </ol>
              <figcaption className="mt-5 text-xs leading-relaxed text-muted">Conceptual overview only. It does not expose the repository, internal integrations, or production architecture.</figcaption>
            </figure>
          ) : (
            <figure className="mt-10 rounded-2xl border border-line bg-surface p-5 sm:p-8">
              <p className="eyebrow text-accent">Architecture map / based on project notes</p>
              <ol className="mt-6 grid gap-3 md:grid-cols-4">
                {[
                  ['01', 'IFC / STEP text', 'Parse structured model records'],
                  ['02', 'Property graph', 'Normalize entities and relationships'],
                  ['03', 'Content hashes', 'Identify changes to the model representation'],
                  ['04', 'Semantic comparison', 'Review changes beyond raw file lines'],
                ].map(([number, title, detail]) => (
                  <li key={number} className="min-w-0 rounded-xl border border-line bg-canvas p-4">
                    <span className="font-mono text-xs text-accent">{number} /</span>
                    <h2 className="mt-3 text-base font-medium">{title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
                  </li>
                ))}
              </ol>
              <figcaption className="mt-5 text-xs leading-relaxed text-muted">Conceptual sequence, not a screenshot of Vex or a sample IFC diff. Inspect the linked repository for implementation details.</figcaption>
            </figure>
          )}

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
            <div>
              <p className="eyebrow">The work, not just the stack</p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">What needed solving, which parts I worked on, and what the available evidence does—and does not—show.</p>
            </div>
            <dl className="min-w-0 divide-y divide-line border-t border-line">
              {[
                ['Problem', study.problem],
                ['My contribution', study.contribution],
                ['Key decision', study.decision],
                [slug === 'portfolio' ? 'What you can verify here' : 'Result and evidence', study.result],
                ['Limits', study.limits],
              ].map(([label, detail]) => (
                <div key={label} className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="font-mono text-xs uppercase tracking-wider text-accent">{label}</dt>
                  <dd className="text-sm leading-relaxed text-paper sm:text-base">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          <nav aria-label="Explore the evidence" className="mt-12 rounded-2xl border border-line bg-surface p-5 sm:p-7">
            <h2 className="text-xl font-medium">Explore the evidence</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{slug === 'portfolio' ? 'Use the site, then inspect its implementation and tests in the source repository.' : slug === 'vex-atlas' ? 'The project summary and design boundary are public. Source code and internal system details are not.' : 'The local study illustrates the kind of revision question; it does not use the Vex parser or real IFC files.'}</p>
            {slug === 'portfolio' && <ul className="mt-5 grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
              <li><code className="break-all font-mono text-xs text-accent">components/portfolio/SelectedWork.tsx</code><span className="block text-muted">Search, filters, and local content fallback</span></li>
              <li><code className="break-all font-mono text-xs text-accent">lib/delivery-lab.ts</code><span className="block text-muted">Deterministic retry experiment</span></li>
              <li><code className="break-all font-mono text-xs text-accent">lib/admin-auth.ts</code><span className="block text-muted">Server-side editing boundary</span></li>
              <li><code className="break-all font-mono text-xs text-accent">scripts/browser-smoke.mjs</code><span className="block text-muted">Browser checks and screenshot source</span></li>
            </ul>}
            <div className="mt-5 flex flex-wrap gap-3">
              {slug === 'portfolio' ? <>
                <Link href="/work" className="button-primary">Try the work index <ArrowUpRight aria-hidden="true" size={15} /></Link>
                <Link href="/lab" className="button-secondary">Try the experiments <ArrowUpRight aria-hidden="true" size={15} /></Link>
              </> : slug === 'vex-atlas' ? <Link href="/contact" className="button-primary">Discuss the project <ArrowUpRight aria-hidden="true" size={15} /></Link> : <Link href="/lab" className="button-secondary">Try the synthetic model study <ArrowUpRight aria-hidden="true" size={15} /></Link>}
              {source && <a href={source} target="_blank" rel="noopener noreferrer" className="button-secondary">Browse source <ArrowUpRight aria-hidden="true" size={15} /><span className="sr-only"> (opens in a new tab)</span></a>}
            </div>
          </nav>
        </article>
      </main>
      <Footer />
    </div>
  );
}
