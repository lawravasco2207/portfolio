import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function Story() {
  return (
    <section id="story" aria-labelledby="story-title" className="section-spacing border-t border-line">
      <div className="section-shell">
        <p className="eyebrow mb-7"><span className="text-accent">05</span> / Background</p>
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
          <div>
            <h2 id="story-title" data-reveal className="section-title">A little<br /><span className="editorial">context.</span></h2>
            <dl className="mt-8 grid grid-cols-2 gap-5 rounded-3xl border border-line bg-surface/40 p-5 text-sm sm:p-6">
              <div><dt className="text-muted">Based in</dt><dd className="mt-1">Nairobi, Kenya</dd></div>
              <div><dt className="text-muted">Working as</dt><dd className="mt-1">Software engineer & founder</dd></div>
              <div><dt className="text-muted">Company</dt><dd className="mt-1"><a href="https://talosys.tech" className="underline decoration-line underline-offset-4 hover:text-accent">Talosys</a></dd></div>
              <div><dt className="text-muted">Education</dt><dd className="mt-1">Self-directed · Azure AZ-900 certified</dd></div>
            </dl>
          </div>
          <div>
            <p className="body-copy">I’m Lawrence, or Larry. I’m a self-taught software engineer. My work has taken me from React interfaces and backend APIs to Rust parsers, local services, and cloud deployments. I also run Talosys, where I work on software for clients and develop my own products.</p>
            <p className="body-copy mt-5">Before software, I spent years in construction. That background explains the architecture, engineering, and construction projects in this index. I’m interested in the gaps between the tools people use, the data they exchange, and the decisions they need to make.</p>
            <p className="body-copy mt-5">AEC is a long-running interest, not the boundary of my practice. The underlying work—interfaces, data models, integrations, authentication, and delivery—shows up in plenty of other domains.</p>
            <div className="mt-8 grid gap-6 rounded-2xl bg-surface/60 p-6 sm:grid-cols-2">
              <div><h3 className="eyebrow mb-3">Ongoing interests</h3><p className="text-sm leading-relaxed text-muted">Systems programming, software tools, applied AI, and construction workflows.</p></div>
              <div><h3 className="eyebrow mb-3">Learning</h3><p className="text-sm leading-relaxed text-muted">Microsoft Learn, freeCodeCamp, technical documentation, and building things that need more than one layer of the stack.</p></div>
            </div>
            <Link href="/resume" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-accent">Full background & résumé <ArrowUpRight aria-hidden="true" size={14} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
