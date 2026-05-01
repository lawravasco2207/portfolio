'use client';

import { ExternalLink, GitBranch, Github, PackageOpen } from 'lucide-react';
import type { RepoTelemetry as RepoTelemetryType } from '@/lib/mission-control/types';

function formatDate(value: string | null) {
  if (!value) return 'pending signal';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function RepoTelemetry({ repositories }: { repositories: RepoTelemetryType[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-mono text-sm font-bold text-white">REPO_TELEMETRY</h3>
          <p className="text-xs text-gray-500">GitHub source signals, live when available</p>
        </div>
        <Github className="h-5 w-5 text-electric-cyan" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {repositories.map((repo) => (
          <a
            key={repo.id}
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-56 flex-col rounded-md border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-electric-cyan/35 hover:bg-white/[0.06]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-electric-cyan">{repo.fullName}</p>
                <h4 className="mt-1 text-lg font-bold text-white">{repo.label}</h4>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-electric-cyan" />
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-400">{repo.description}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              <div className="rounded border border-white/10 bg-black/30 p-2">
                <span className="block text-white">{repo.stars}</span>
                <span className="text-gray-500">stars</span>
              </div>
              <div className="rounded border border-white/10 bg-black/30 p-2">
                <span className="block text-white">{repo.releaseCount}</span>
                <span className="text-gray-500">releases</span>
              </div>
              <div className="rounded border border-white/10 bg-black/30 p-2">
                <span className="block text-white">{repo.openIssues}</span>
                <span className="text-gray-500">issues</span>
              </div>
            </div>

            <div className="mt-auto space-y-2 pt-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-green-300" />
                <span className="truncate">Last push: {formatDate(repo.pushedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <PackageOpen className="h-3.5 w-3.5 text-amber-200" />
                <span className="truncate">{repo.latestRelease?.tag || 'release feed pending'}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className={`h-1.5 w-1.5 rounded-full ${repo.status === 'live' ? 'bg-green-400' : 'bg-amber-300'}`} />
                <span className="uppercase tracking-[0.16em]">{repo.status}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}