import { NextResponse } from 'next/server';
import { config, getNairobiTime } from '@/lib/mission-control/config';
import { getRepositoriesTelemetry } from '@/lib/mission-control/github';
import { checkServicesHealth } from '@/lib/mission-control/health';
import type { MissionControlPayload } from '@/lib/mission-control/types';

export const revalidate = 60;

export async function GET() {
  const [repositories, services] = await Promise.all([
    getRepositoriesTelemetry(config.repositories),
    checkServicesHealth(config.services),
  ]);

  const payload: MissionControlPayload = {
    generatedAt: new Date().toISOString(),
    nairobiTime: getNairobiTime(),
    profile: config.profile,
    repositories,
    services,
    summary: {
      trackedRepos: repositories.length,
      liveRepos: repositories.filter((repo) => repo.status === 'live').length,
      onlineServices: services.filter((service) => service.status === 'online').length,
      activeBuilds: repositories.map((repo) => repo.label),
    },
  };

  return NextResponse.json(payload);
}