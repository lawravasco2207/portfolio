'use client';

import { ExternalLink, RadioTower } from 'lucide-react';
import type { ServiceHealth as ServiceHealthType } from '@/lib/mission-control/types';

const dotClasses = {
  online: 'bg-green-400',
  degraded: 'bg-amber-300',
  unknown: 'bg-gray-400',
};

const badgeClasses = {
  online: 'border-green-400/30 text-green-300',
  degraded: 'border-amber-300/30 text-amber-200',
  unknown: 'border-gray-400/30 text-gray-300',
};

export function ServiceHealth({ services }: { services: ServiceHealthType[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/35 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-mono text-sm font-bold text-white">SERVICE_HEALTH</h3>
          <p className="text-xs text-gray-500">Live checks with graceful fallback</p>
        </div>
        <RadioTower className="h-5 w-5 text-electric-cyan" />
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const isExternal = service.url.startsWith('http');

          return (
            <a
              key={service.id}
              href={service.url}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-electric-cyan/30 hover:bg-white/[0.06]"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${dotClasses[service.status]}`} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{service.name}</span>
                <span className="block truncate text-[11px] text-gray-500">{service.region}</span>
              </span>
              <span className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${badgeClasses[service.status]}`}>
                {service.status}
                <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}