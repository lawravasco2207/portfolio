import type { WorkAreaId } from './work-areas';

export type WorkCategory = 'Systems' | 'Products';

export interface WorkNote {
  category: WorkCategory;
  areas: readonly WorkAreaId[];
  domain: string;
  discipline: string;
  headline: string;
  role: string;
  problem: string;
  approach: string;
  decision: string;
  question: string;
  source: 'resume' | 'project';
}

// Editorial notes are grounded in the checked-in résumé and project descriptions.
// Review these alongside the résumé when a project's scope or ownership changes.
export const workNotes: Record<string, WorkNote> = {
  atelier: {
    category: 'Products',
    areas: ['applications', 'backend', 'automation'],
    domain: 'Professional services / AEC',
    discipline: 'Full-stack product engineering',
    headline: 'Marketplace, matching, and proposal workflows',
    role: 'Founder & full-stack engineer',
    problem: 'AEC professionals need a way to connect their expertise with clients. That is a workflow problem, not just a directory problem.',
    approach: 'A marketplace with professional matching, project proposals, and verification, spanning a React interface, Go backend, and PostgreSQL data model.',
    decision: 'Put AI assistance inside a concrete workflow—proposals and matching—instead of making the whole product a conversation box.',
    question: 'How can professional verification and AI-assisted matching earn trust from both sides of a marketplace?',
    source: 'resume',
  },
  vex: {
    category: 'Systems',
    areas: ['systems'],
    domain: 'Engineering data / BIM',
    discipline: 'Systems programming & engineering data',
    headline: 'A parser, model graph, and semantic diff engine',
    role: 'Creator & lead engineer',
    problem: 'A building model contains relationships and meaning that a line-by-line file comparison does not explain.',
    approach: 'A Rust STEP parser, a normalized property graph, Merkle hashing, and content-addressable storage for semantic model comparisons.',
    decision: 'Compare a representation of the model rather than treating its serialized text as the source of meaning.',
    question: 'How should a comparison distinguish a meaningful model edit from a change in serialization?',
    source: 'resume',
  },
  brikto: {
    category: 'Products',
    areas: ['applications', 'backend', 'automation'],
    domain: 'Construction trades',
    discipline: 'Domain-led product development',
    headline: 'Profiles, project records, and reputation data',
    role: 'Creator',
    problem: 'The contractors, foremen, and specialists who build need professional identities that reflect their actual work.',
    approach: 'A construction-trade network with professional profiles, verified projects, and reputation data, built with Go, React, and PostgreSQL.',
    decision: 'Design around construction work and a Nairobi-first network, rather than copying a general-purpose professional social feed.',
    question: 'How do you represent earned reputation without confusing activity or popularity with quality of work?',
    source: 'resume',
  },
  'vex-bridge': {
    category: 'Systems',
    areas: ['systems'],
    domain: 'Desktop / CAD',
    discipline: 'Desktop integration & developer experience',
    headline: 'A local daemon and desktop integrations',
    role: 'Creator & lead engineer',
    problem: 'Connecting CAD tools to a cloud workflow should not require architects to manage SSH keys or work in a terminal.',
    approach: 'A local daemon with an HTTP API, OS keychain integration, and CAD plugins in C# and Python.',
    decision: 'Keep credentials in the OS keychain and expose a narrow, authenticated localhost interface for integrations.',
    question: 'Where should the trust boundary sit when desktop tools, a local service, and a cloud platform interact?',
    source: 'resume',
  },
  'vex-atlas': {
    category: 'Systems',
    areas: ['applications', 'backend'],
    domain: 'Cloud coordination / BIM',
    discipline: 'Cloud systems & application architecture',
    headline: 'Authentication, pairing, and repository coordination',
    role: 'Part of my engineering work',
    problem: 'Local model tooling needs a shared layer for accounts, project context, and browser-based review.',
    approach: 'An ASP.NET Core API and PostgreSQL data layer connected to a Next.js review interface. The source repository is internal.',
    decision: 'Separate cloud coordination from local model processing so each layer has a clear responsibility.',
    question: 'How can local tools and cloud review evolve without blurring their responsibilities?',
    source: 'project',
  },
  portfolio: {
    category: 'Products',
    areas: ['applications', 'backend'],
    domain: 'Publishing / developer tools',
    discipline: 'Web application & operational tooling',
    headline: 'The application behind this website',
    role: 'Implementation in this repository',
    problem: 'A public site needs readable content, optional integrations, and a protected editing path without making every visit depend on external services.',
    approach: 'A Next.js application with static content, client-side experiments, an SMTP contact action, and a Spaces-backed editor.',
    decision: 'Keep core content available locally, verify authorization on server mutations, and request optional repository snapshots only on demand.',
    question: 'Which features should keep working when an external service or credential is unavailable?',
    source: 'project',
  },
};
