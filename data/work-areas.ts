export const workAreas = [
  {
    id: 'applications',
    label: 'Applications',
    detail: 'Web interfaces, internal tools, and product workflows.',
    tools: ['React', 'Next.js', 'TypeScript'],
    scope: 'New web applications, customer-facing products, dashboards, and changes to existing interfaces.',
    questions: 'Who uses it? What do they need to complete? What already exists?',
  },
  {
    id: 'backend',
    label: 'APIs & data',
    detail: 'Service boundaries, authentication, and persistent state.',
    tools: ['Go', 'C# / .NET', 'PostgreSQL'],
    scope: 'APIs, data models, authentication, service integrations, and the workflows behind an application.',
    questions: 'What owns the data? Which operations must be atomic? What happens on a retry?',
  },
  {
    id: 'systems',
    label: 'Systems',
    detail: 'Parsers, local services, and desktop integrations.',
    tools: ['Rust', 'Python', 'C#'],
    scope: 'Command-line tools, structured-file processing, local daemons, and integrations with desktop software.',
    questions: 'Where is the trust boundary? What are the platform constraints? How does failure surface?',
  },
  {
    id: 'automation',
    label: 'AI & automation',
    detail: 'Model APIs inside explicit, reviewable workflows.',
    tools: ['Anthropic API', 'OpenAI', 'Workflow design'],
    scope: 'AI-assisted features, API integration, and automation within an existing business process.',
    questions: 'What can be validated? What needs human review? What is the fallback when the model is wrong?',
  },
] as const;

export type WorkAreaId = (typeof workAreas)[number]['id'];
