import type { Metadata } from 'next';
import './globals.css';
import { SocialLinks } from '@/components/SocialLinks';

function getMetadataBase() {
  const fallbackUrl = 'http://localhost:3000';
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl;

  try {
    const url = new URL(configuredUrl);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url;
    }
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_SITE_URL; falling back to localhost.', error);
  }

  return new URL(fallbackUrl);
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: 'Larry | Full Stack Engineer & Systems Architect',
  description:
    'Full Stack Engineering // AI Systems // Cloud Infrastructure. I help teams ship dependable products, cloud systems, and AI-enhanced workflows.',
  keywords: [
    'full stack engineer',
    'next.js developer',
    'ai systems engineer',
    'cloud infrastructure',
    'software engineer portfolio',
  ],
  authors: [{ name: 'Lawrence Musyoka' }],
  creator: 'Lawrence Musyoka',
  icons: {
    icon: '/favicon.jpg',
  },
  openGraph: {
    title: 'Larry | Full Stack Engineer & Systems Architect',
    description:
      'Full Stack Engineering // AI Systems // Cloud Infrastructure. Product-minded engineering with measurable outcomes.',
    type: 'website',
    images: ['/favicon.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Larry | Full Stack Engineer & Systems Architect',
    description:
      'Product-minded full stack engineering for AI-enabled applications and cloud systems.',
    images: ['/favicon.jpg'],
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lawrence Musyoka',
  alternateName: 'Larry',
  jobTitle: 'Full Stack Engineer & Systems Architect',
  description:
    'Full stack engineer focused on AI systems, cloud infrastructure, and reliable software delivery.',
  email: 'syokslawrence@gmail.com',
  url: 'https://github.com/lawravasco2207',
  sameAs: [
    'https://github.com/lawravasco2207',
    'https://www.linkedin.com/in/lawrence-musyoka-b58a1836a/',
    'https://x.com/lawravasco',
  ],
  knowsAbout: [
    'Next.js',
    'TypeScript',
    'Cloud Infrastructure',
    'AI Workflows',
    'Product Engineering',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-deep-charcoal text-soft-white selection:bg-electric-cyan selection:text-deep-charcoal">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <SocialLinks />
        {children}
      </body>
    </html>
  );
}
