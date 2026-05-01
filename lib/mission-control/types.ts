export interface MissionProfile {
  name: string;
  handle: string;
  role: string;
  location: string;
  timezone: string;
  availability: string;
  thesis: string;
  summary: string;
  focus: string[];
  links: {
    github: string;
    linkedin: string;
    email: string;
    resume: string;
  };
}

export interface RepositoryConfig {
  id: string;
  owner: string;
  name: string;
  githubName?: string;
  label: string;
  role: string;
  description: string;
}

export interface ServiceConfig {
  id: string;
  name: string;
  url: string;
  region: string;
  description: string;
}

export interface CapabilityConfig {
  id: string;
  label: string;
  source: string;
  modules: string[];
}

export interface ChangelogEntry {
  date: string;
  title: string;
  description: string;
}

export interface MissionConfig {
  profile: MissionProfile;
  repositories: RepositoryConfig[];
  services: ServiceConfig[];
  capabilities: CapabilityConfig[];
  changelog: ChangelogEntry[];
}

export interface RepoTelemetry extends RepositoryConfig {
  fullName: string;
  htmlUrl: string;
  homepageUrl: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string | null;
  updatedAt: string | null;
  latestCommit: {
    sha: string;
    message: string;
    url: string;
    committedAt: string;
  } | null;
  latestRelease: {
    tag: string;
    name: string;
    url: string;
    publishedAt: string;
  } | null;
  releaseCount: number;
  status: 'live' | 'fallback';
  error?: string;
}

export interface ServiceHealth extends ServiceConfig {
  status: 'online' | 'degraded' | 'unknown';
  statusCode: number | null;
  latencyMs: number | null;
  checkedAt: string;
  error?: string;
}

export interface MissionControlPayload {
  generatedAt: string;
  nairobiTime: string;
  profile: MissionProfile;
  repositories: RepoTelemetry[];
  services: ServiceHealth[];
  summary: {
    trackedRepos: number;
    liveRepos: number;
    onlineServices: number;
    activeBuilds: string[];
  };
}