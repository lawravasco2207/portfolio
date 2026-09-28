import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, Download, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Resume | Lawrence “Larry” Musyoka',
  description:
    'Lawrence Musyoka is a self-taught software engineer and founder of Talosys in Nairobi, Kenya. Read his professional summary and download his resume.',
};

const resumePages = [
  {
    src: '/assets/resume-page-1.png',
    alt: 'Resume page 1: professional background, technical stack, Talosys experience, and selected engineering projects.',
  },
  {
    src: '/assets/resume-page-2.png',
    alt: 'Resume page 2: further projects, construction industry knowledge, self-directed education, and Azure certification.',
  },
];

const skills = [
  { title: 'Languages', detail: 'Rust, Go, TypeScript, Python, C# / .NET' },
  { title: 'Web & data', detail: 'React, Next.js, Three.js, Tailwind, PostgreSQL, REST APIs' },
  { title: 'Infrastructure & tools', detail: 'Azure, DigitalOcean, Docker, Linux, Git, GitHub Actions' },
  { title: 'Systems & domain', detail: 'BIM, IFC / STEP parsing, AEC workflows, LLM integration' },
];

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-canvas text-paper">
      <header className="border-b border-line">
        <nav aria-label="Resume navigation" className="section-shell flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to portfolio
          </Link>
          <a
            href="#resume-document"
            className="inline-flex min-h-11 items-center rounded-sm text-sm text-muted underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Skip to document preview
          </a>
        </nav>
      </header>

      <main id="resume-main" className="section-shell section-spacing">
        <header className="max-w-4xl">
          <p className="eyebrow mb-5">Resume / Lawrence Musyoka</p>
          <h1 className="section-title">Lawrence <span className="text-accent">“Larry”</span> Musyoka</h1>
          <p className="mt-5 text-lg leading-relaxed text-paper sm:text-xl">
            Software engineer. Self-taught. Based in Nairobi, Kenya.
          </p>
          <p className="body-copy mt-4 max-w-2xl">
            I work on web applications, APIs, systems tooling, and AI integrations. I run Talosys,
            where I take on software projects alongside my own product work. This page summarizes
            my experience and links to the full résumé.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/assets/resume.pdf"
              download
              className="button-primary gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Download PDF
            </a>
            <a
              href="/assets/resume.pdf"
              className="button-secondary gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              Open PDF
            </a>
            <a
              href="/assets/LawrenceMusyoka_Resume.docx"
              download
              className="button-secondary gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              Download DOCX
            </a>
          </div>
        </header>

        <section aria-labelledby="resume-summary-title" className="mt-14 grid gap-8 border-t border-line pt-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-3">The short version</p>
            <h2 id="resume-summary-title" className="text-2xl font-semibold tracking-tight">Professional summary</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A text overview of my background. The original two-page resume follows below.
            </p>
          </div>
          <div className="min-w-0 space-y-8">
            <div>
              <h3 className="text-lg font-semibold">Software engineering & Talosys</h3>
              <p className="body-copy mt-3">
                I’m the founder of Talosys, where I work across product direction, architecture,
                engineering, and deployment. My work includes full-stack applications, multi-service
                backends, and AI integrations using the Anthropic and OpenAI APIs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Domain experience: construction & engineering</h3>
              <p className="body-copy mt-3">
                Before software, I spent years in the construction industry. That experience informs
                my interest in architecture, engineering, and construction (AEC), including building
                information modelling (BIM). My projects explore IFC/STEP parsing in Rust, CAD
                integrations, and web platforms for AEC professionals. This is one area of my work,
                alongside broader application development and software integration.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Technical toolkit</h3>
              <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                {skills.map((skill) => (
                  <div key={skill.title} className="border-l border-line pl-4">
                    <dt className="text-sm font-medium text-accent">{skill.title}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-muted">{skill.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Education & learning</h3>
              <p className="body-copy mt-3">
                Self-directed engineering education through Microsoft Learn, freeCodeCamp,
                and building software. My resume lists Microsoft Azure AZ-900 certification,
                alongside continued learning in systems programming, deep learning, and cybersecurity.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-accent underline underline-offset-4 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Let’s talk about a role or collaboration
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </section>

        <section
          id="resume-document"
          aria-labelledby="resume-document-title"
          tabIndex={-1}
          className="mt-16 scroll-mt-8 border-t border-line pt-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow mb-3">The full document</p>
            <h2 id="resume-document-title" className="text-2xl font-semibold tracking-tight">Resume preview</h2>
            <p className="body-copy mt-3">
              These are images of the original resume. Open either page at full size to zoom in,
              or use the PDF or DOCX links above for the complete document.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The original files retain their listed contact details. For enquiries through this
              portfolio, use{' '}
              <a
                href="mailto:syokslawrence@gmail.com"
                className="break-all rounded-sm text-paper underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                syokslawrence@gmail.com
              </a>.
            </p>
          </div>
          <div className="mx-auto max-w-4xl space-y-8">
            {resumePages.map((page, index) => (
              <figure key={page.src}>
                <figcaption className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted">Page {index + 1} of {resumePages.length}</span>
                  <a
                    href={page.src}
                    className="inline-flex min-h-11 items-center gap-2 rounded-sm text-paper underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    Open page {index + 1} at full size
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                </figcaption>
                <div className="overflow-hidden rounded-lg border border-line bg-paper">
                  <Image
                    src={page.src}
                    alt={page.alt}
                    width={1191}
                    height={1684}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
                    className="h-auto w-full"
                  />
                </div>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
