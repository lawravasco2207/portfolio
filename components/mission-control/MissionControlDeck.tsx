'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Download, Gauge, GitPullRequest, RadioTower, Server } from 'lucide-react';
import type { MissionControlPayload } from '@/lib/mission-control/types';
import { ActivityFeed } from './ActivityFeed';
import { LiveClock } from './LiveClock';
import { RepoTelemetry } from './RepoTelemetry';
import { ServiceHealth } from './ServiceHealth';
import { SystemMetric } from './SystemMetric';

const loadingPayload: MissionControlPayload = {
  generatedAt: '',
  nairobiTime: 'Syncing Nairobi clock',
  profile: {
    name: 'Lawrence Musyoka',
    handle: 'Larry',
    role: 'Full Stack Engineer & Systems Builder',
    location: 'Nairobi, Kenya',
    timezone: 'Africa/Nairobi',
    availability: 'Available for select builds',
    thesis: 'Live telemetry is loading.',
    summary: 'Connecting to the mission-control endpoint.',
    focus: ['AI systems', 'Cloud infrastructure', 'Product engineering'],
    links: {
      github: 'https://github.com/lawravasco2207',
      linkedin: 'https://www.linkedin.com/in/lawrence-musyoka-b58a1836a/',
      email: 'mailto:syokslawrence@gmail.com',
      resume: '/resume',
    },
  },
  repositories: [],
  services: [],
  summary: {
    trackedRepos: 3,
    liveRepos: 0,
    onlineServices: 0,
    activeBuilds: ['Vex', 'vex-bridge', 'Vex Atlas'],
  },
};

export function MissionControlDeck() {
  const [payload, setPayload] = useState<MissionControlPayload>(loadingPayload);
  const [state, setState] = useState<'loading' | 'live' | 'fallback'>('loading');

  useEffect(() => {
    let mounted = true;

    fetch('/api/mission-control')
      .then((response) => {
        if (!response.ok) throw new Error('Mission control endpoint failed');
        return response.json() as Promise<MissionControlPayload>;
      })
      .then((data) => {
        if (!mounted) return;
        setPayload(data);
        setState('live');
      })
      .catch(() => {
        if (!mounted) return;
        setState('fallback');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const statusLabel = useMemo(() => {
    if (state === 'loading') return 'SYNCING';
    if (state === 'fallback') return 'FALLBACK';
    return 'LIVE';
  }, [state]);

  const generatedLabel = payload.generatedAt
    ? new Date(payload.generatedAt).toLocaleTimeString()
    : 'syncing';

  return (
    <section className="mb-16 min-h-[calc(100vh-8rem)] pt-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.18em]">
            <span className="inline-flex items-center gap-2 text-green-300">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              {statusLabel}
            </span>
            <span className="text-gray-600">/</span>
            <span className="text-cyan-200">Nairobi: <LiveClock /></span>
          </div>
          <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Lawrence Musyoka, <span className="text-electric-cyan">live</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-cyan-100/75 md:text-lg">
            {payload.profile.thesis} This portfolio is wired like a focused control room for the
            Vex systems: engine, bridge, cloud action manager, source telemetry, and release signals.
          </p>
        </div>

        <div className="grid min-w-64 grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/35 p-3 font-mono text-[11px] text-gray-400">
          <span>generated</span>
          <span className="text-right text-cyan-100">{generatedLabel}</span>
          <span>availability</span>
          <span className="text-right text-green-300">{payload.profile.availability}</span>
          <span>location</span>
          <span className="text-right text-cyan-100">{payload.profile.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SystemMetric icon={GitPullRequest} label="tracked repos" value={payload.summary.trackedRepos} detail="Vex, vex-bridge, and Vex Atlas." />
        <SystemMetric icon={Activity} label="live repo feeds" value={payload.summary.liveRepos} detail="GitHub API signals currently reachable." tone="green" />
        <SystemMetric icon={RadioTower} label="release surfaces" value={payload.repositories.filter((repo) => repo.releaseCount > 0).length} detail="Repositories with published releases." tone="amber" />
        <SystemMetric icon={Server} label="active builds" value={payload.summary.activeBuilds.length} detail="Engine, bridge, and cloud layer." />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-4">
          {payload.repositories.length > 0 ? (
            <RepoTelemetry repositories={payload.repositories} />
          ) : (
            <div className="flex min-h-72 items-center justify-center rounded-lg border border-white/10 bg-black/35 text-sm text-gray-500">
              Repository telemetry is syncing.
            </div>
          )}
        </div>
        <div className="space-y-4">
          {payload.services.length > 0 && <ServiceHealth services={payload.services} />}
          {payload.repositories.length > 0 && <ActivityFeed repositories={payload.repositories} />}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/resume"
          className="inline-flex items-center gap-2 rounded-md bg-electric-cyan px-5 py-3 text-sm font-bold text-deep-charcoal transition-colors hover:bg-cyan-300"
        >
          <Download className="h-4 w-4" />
          Resume
        </a>
        <a
          href="#projects"
          className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-electric-cyan/35 hover:bg-white/5"
        >
          Inspect Artifacts
          <ArrowUpRight className="h-4 w-4" />
        </a>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-md border border-green-400/25 px-5 py-3 text-sm font-bold text-green-300 transition-colors hover:bg-green-400/10"
        >
          Open Channel
          <Gauge className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}