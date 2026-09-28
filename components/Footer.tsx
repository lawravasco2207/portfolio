import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SocialLinks } from '@/components/SocialLinks';

export function Footer() {
  return (
    <footer className="site-footer theme-dark border-t border-line py-10 text-paper sm:py-14">
      <div className="section-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-sm text-2xl font-medium tracking-tight hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-3xl"
            >
              Lawrence “Larry” Musyoka
            </Link>
            <p className="mt-1 text-sm leading-relaxed text-muted">Software engineer · Nairobi, Kenya</p>
          </div>
          <SocialLinks label="Footer social and contact links" />
        </div>
        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lawrence Musyoka</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/notes" className="inline-flex min-h-11 items-center rounded-sm hover:text-accent">Notebook</Link>
            <Link
              href="/resume"
              className="inline-flex min-h-11 items-center rounded-sm hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Read my resume
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Back to home
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
