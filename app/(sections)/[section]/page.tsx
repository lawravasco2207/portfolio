import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Contact } from '@/components/Contact';
import { MotionPage } from '@/components/motion/MotionPage';
import { Approach } from '@/components/portfolio/Approach';
import { EngineeringLab } from '@/components/portfolio/EngineeringLab';
import { Header } from '@/components/portfolio/Header';
import { SelectedWork } from '@/components/portfolio/SelectedWork';
import { Story } from '@/components/portfolio/Story';

const sections = {
  work: { title: 'Selected work', description: 'Projects, case studies, implementation notes, and source links.', content: SelectedWork },
  practice: { title: 'Practice', description: 'Software engineering through Talosys: applications, APIs, integrations, and delivery.', content: Approach },
  lab: { title: 'Engineering lab', description: 'Interactive studies of retries and model revisions, using local synthetic data.', content: EngineeringLab },
  about: { title: 'About Lawrence', description: 'Background, engineering interests, and experience before software.', content: Story },
  contact: { title: 'Contact Lawrence', description: 'Get in touch about software projects, engineering roles, or technical collaboration.', content: Contact },
} as const;

type SectionId = keyof typeof sections;
type PageProps = { params: Promise<{ section: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(sections).map((section) => ({ section }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { section } = await params;
  if (!Object.hasOwn(sections, section)) notFound();
  const page = sections[section as SectionId];
  return {
    title: `${page.title} | Lawrence Musyoka`,
    description: page.description,
    alternates: { canonical: `/${section}` },
    openGraph: { title: page.title, description: page.description, url: `/${section}` },
  };
}

export default async function SectionPage({ params }: PageProps) {
  const { section } = await params;
  if (!Object.hasOwn(sections, section)) notFound();
  const page = sections[section as SectionId];
  const Content = page.content;

  return (
    <MotionPage>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-[60vh]">
        <h1 className="sr-only">{page.title}</h1>
        <Content />
      </main>
      <Footer />
    </MotionPage>
  );
}
