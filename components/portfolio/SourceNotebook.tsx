'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, GitCommitHorizontal, RefreshCw } from 'lucide-react';
import type { MissionControlPayload } from '@/lib/mission-control/types';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}

export function SourceNotebook() {
  const [snapshot, setSnapshot] = useState<MissionControlPayload | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); }, []);

  async function loadSnapshot() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setState('loading');
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/mission-control', { signal: controller.signal });
      if (!response.ok) throw new Error('Snapshot unavailable');
      const data = await response.json() as MissionControlPayload;
      if (!Array.isArray(data.repositories) || typeof data.generatedAt !== 'string') throw new Error('Invalid snapshot');
      setSnapshot(data);
      setState('ready');
    } catch {
      setState('error');
    } finally {
      clearTimeout(timeout);
      request.current = null;
    }
  }

  return (
    <details className="work-details mt-5 border border-line bg-surface">
      <summary className="flex min-h-16 list-none flex-wrap items-center justify-between gap-4 p-5 sm:px-7">
        <span className="flex items-center gap-3 text-sm"><GitCommitHorizontal aria-hidden="true" size={18} className="text-accent" />Prefer source to summaries?</span>
        <span className="eyebrow">Open the repository notebook +</span>
      </summary>
      <div className="border-t border-line p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <p className="max-w-xl text-sm leading-relaxed text-muted">Fetch a snapshot of the tracked repositories. These are GitHub records, not deployment health or a measure of engineering quality. No background polling.</p>
          <button type="button" onClick={loadSnapshot} disabled={state === 'loading'} className="button-secondary disabled:opacity-50"><RefreshCw aria-hidden="true" size={14} />{state === 'loading' ? 'Fetching…' : snapshot ? 'Refresh snapshot' : 'Fetch source snapshot'}</button>
        </div>
        <p role="status" className="mt-4 text-xs leading-relaxed text-muted">
          {state === 'error' ? 'The snapshot could not be refreshed. Your existing snapshot, if any, is unchanged. You can still inspect the source links above.' : state === 'loading' ? 'Requesting repository data…' : snapshot ? `Snapshot generated ${formatDate(snapshot.generatedAt)} (UTC). GitHub responses may be cached for two minutes.` : 'External repository data is requested only when you press the button.'}
        </p>
        {snapshot && <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {snapshot.repositories.map((repo) => (
            <div key={repo.id} className="min-w-0 border border-line bg-canvas p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-medium">{repo.label}</h3><span className="font-mono text-[10px] text-muted">{repo.status === 'live' ? 'SOURCE REACHABLE' : 'SOURCE UNAVAILABLE'}</span></div>
              {repo.status === 'fallback' ? <p className="text-xs leading-relaxed text-muted">GitHub data is unavailable for this repository. No activity or release claims are inferred.</p> : <>
                <p className="text-xs leading-relaxed text-muted">{repo.latestCommit ? <>Latest commit: <span className="font-mono text-accent">{repo.latestCommit.sha}</span> · {formatDate(repo.latestCommit.committedAt)}</> : 'No commit details returned.'}</p>
                {repo.latestCommit && <p className="mt-2 line-clamp-2 break-words text-sm text-paper">{repo.latestCommit.message}</p>}
                <p className="mt-3 text-xs text-muted">{repo.latestRelease ? `Latest release: ${repo.latestRelease.tag} · ${formatDate(repo.latestRelease.publishedAt)}` : 'No published release returned.'}</p>
              </>}
              <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 text-xs text-accent">Inspect repository <ArrowUpRight aria-hidden="true" size={13} /><span className="sr-only"> for {repo.label} (opens in a new tab)</span></a>
            </div>
          ))}
        </div>}
      </div>
    </details>
  );
}
