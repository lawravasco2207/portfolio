import type { Metadata } from 'next';
import './globals.css';
import { MotionProvider } from '@/components/motion/MotionProvider';

function getMetadataBase() {
  const fallbackUrl = 'http://localhost:3000';
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl;
  try {
    const url = new URL(configuredUrl);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url;
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_SITE_URL; falling back to localhost.', error);
  }
  return new URL(fallbackUrl);
}

const title = 'Lawrence Musyoka | Software Engineer & Founder';
const description = 'Lawrence Musyoka builds applications and integrations that make complex workflows usable, from Rust model tooling to web products and APIs. Explore case studies, technical notes, and experiments.';

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title,
  description,
  keywords: ['software engineer', 'full stack development', 'API development', 'AI integration', 'Talosys', 'Rust', 'Nairobi', 'Lawrence Musyoka'],
  authors: [{ name: 'Lawrence Musyoka' }],
  creator: 'Lawrence Musyoka',
  icons: { icon: '/brand-mark.svg', apple: '/favicon.jpg' },
  openGraph: { title, description, type: 'website', locale: 'en_KE', siteName: 'Lawrence Musyoka' },
  twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lawrence Musyoka',
  alternateName: 'Larry',
  jobTitle: 'Software Engineer',
  description,
  email: 'syokslawrence@gmail.com',
  url: 'https://github.com/lawravasco2207',
  homeLocation: { '@type': 'Place', name: 'Nairobi, Kenya' },
  sameAs: [
    'https://github.com/lawravasco2207',
    'https://www.linkedin.com/in/lawrence-musyoka-b58a1836a/',
    'https://x.com/lawravasco',
  ],
  knowsAbout: ['Software Engineering', 'Web Applications', 'APIs', 'AI Integration', 'Rust', 'Go', 'TypeScript', 'Cloud Infrastructure', 'BIM', 'IFC'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
