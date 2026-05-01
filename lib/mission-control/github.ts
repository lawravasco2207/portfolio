import type { RepoTelemetry, RepositoryConfig } from './types';

interface GitHubRepositoryResponse {
  full_name: string;
  html_url: string;
  homepage: string | null;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string | null;
  updated_at: string | null;
}

interface GitHubCommitResponse {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
}

interface GitHubReleaseResponse {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string;
}

const GITHUB_API = 'https://api.github.com';

function getHeaders() {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'lawrence-musyoka-mission-control',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error(`GitHub ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

function fallbackRepo(repo: RepositoryConfig, error?: unknown): RepoTelemetry {
  const { githubName, ...publicRepo } = repo;
  const sourceName = githubName || repo.name;
  const fullName = repo.id === 'vex-atlas' ? `${repo.owner}/Vex Atlas` : `${repo.owner}/${sourceName}`;
  const sourceFullName = `${repo.owner}/${sourceName}`;

  return {
    ...publicRepo,
    fullName,
    htmlUrl: `https://github.com/${sourceFullName}`,
    homepageUrl: null,
    language: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    pushedAt: null,
    updatedAt: null,
    latestCommit: null,
    latestRelease: null,
    releaseCount: 0,
    status: 'fallback',
    error: error ? 'GitHub telemetry unavailable' : undefined,
  };
}

export async function getRepoTelemetry(repo: RepositoryConfig): Promise<RepoTelemetry> {
  const { githubName, ...publicRepo } = repo;
  const sourceName = githubName || repo.name;

  try {
    const [repository, commits, releases] = await Promise.all([
      githubFetch<GitHubRepositoryResponse>(`/repos/${repo.owner}/${sourceName}`),
      githubFetch<GitHubCommitResponse[]>(`/repos/${repo.owner}/${sourceName}/commits?per_page=1`),
      githubFetch<GitHubReleaseResponse[]>(`/repos/${repo.owner}/${sourceName}/releases?per_page=100`),
    ]);

    const latestCommit = commits[0];
    const latestRelease = releases[0];

    return {
      ...publicRepo,
      description: repository.description || repo.description,
      fullName: repo.id === 'vex-atlas' ? `${repo.owner}/Vex Atlas` : repository.full_name,
      htmlUrl: repository.html_url,
      homepageUrl: repository.homepage || null,
      language: repository.language,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      openIssues: repository.open_issues_count,
      pushedAt: repository.pushed_at,
      updatedAt: repository.updated_at,
      latestCommit: latestCommit
        ? {
            sha: latestCommit.sha.slice(0, 7),
            message: latestCommit.commit.message.split('\n')[0],
            url: latestCommit.html_url,
            committedAt: latestCommit.commit.committer.date,
          }
        : null,
      latestRelease: latestRelease
        ? {
            tag: latestRelease.tag_name,
            name: latestRelease.name || latestRelease.tag_name,
            url: latestRelease.html_url,
            publishedAt: latestRelease.published_at,
          }
        : null,
      releaseCount: releases.length,
      status: 'live',
    };
  } catch (error) {
    return fallbackRepo(repo, error);
  }
}

export async function getRepositoriesTelemetry(repositories: RepositoryConfig[]) {
  return Promise.all(repositories.map((repo) => getRepoTelemetry(repo)));
}