'use client';

import { Clock3 } from 'lucide-react';
import type { RepoTelemetry } from '@/lib/mission-control/types';

function timeAgo(value: string | null) {
  if (!value) return 'waiting for signal';

  const diff = Date.now() - new Date(value).getTime();
  const hours = Math.max(1, Math.round(diff / 1000 / 60 / 60));

  if (hours < 24) return `${hours}h ago`;

  return `${Math.round(hours / 24)}d ago`;
}

export function ActivityFeed({ repositories }: { repositories: RepoTelemetry[] }) {
  const events = repositories.map((repo) => ({
    repo: repo.label,
    title: repo.latestCommit?.message || `${repo.role} telemetry online`,
    when: repo.latestCommit?.committedAt || repo.pushedAt,
    url: repo.latestCommit?.url || repo.htmlUrl,
  }));

  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-mono text-sm font-bold text-white">ACTIVITY_FEED</h3>
          <p className="text-xs text-gray-500">Latest source events</p>
        </div>
        <Clock3 className="h-5 w-5 text-electric-cyan" />
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <a
            key={`${event.repo}-${event.title}`}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-electric-cyan/30 hover:bg-white/[0.06]"
          >
            <div className="flex items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.16em]">
              <span className="text-electric-cyan">{event.repo}</span>
              <span className="text-gray-500">{timeAgo(event.when)}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-300">{event.title}</p>
          </a>
        ))}
      </div>
    </section>
  );
}