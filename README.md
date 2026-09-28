# Lawrence Musyoka — engineering index & notebook

A software engineer’s work index, practice, technical notebook, and interactive lab. The public positioning covers applications, APIs, systems tooling, and AI integration, with client work through Talosys. Construction/AEC remains a documented domain interest, not an industry requirement or the whole identity of the portfolio.

## Run locally

Use pnpm and Node.js 22.18+ (the tests use native TypeScript stripping).

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The public site works without credentials: story, project selection, engineering study, and résumé all have local content. Copy `.env.example` to `.env.local` only when configuring integrations. Never commit real credentials.

## The experience

- **Introduction:** name, a specific applications/integrations pitch, and a direct case-study link. The engineering map connects to the checked-in project index; its decorative sculpture is omitted on narrow screens so the work is closer. No WebGL or external fonts.
- **Work index:** start with an actual capture and case study of this site, then search by project, technology, or domain; filter by Applications, APIs & data, Systems, or AI & automation. Existing project domains remain explicit. The portfolio is inspectable web-application work, not a fabricated client engagement. Vex has a case study with a clearly labeled architecture map, not purported IFC output. Vex Atlas links to `/work/vex-atlas`, a public high-level project overview with no link to its internal source repository.
- **Practice:** Talosys and concrete software scopes, including existing codebases, application development, integration, and AI-assisted workflows.
- **Notebook:** `/notes` and three substantive reference pages: `/notes/idempotency-and-retries`, `/notes/localhost-trust-boundaries`, `/notes/ai-output-validation`. The notes are draft technical references with illustrative snippets, assumptions, failure checks, and source context—not claimed past production implementations or dated blog posts. Review them before publishing as your own writing.
- **Lab:** a deterministic delivery/retry experiment compares naive and idempotent processing, including changed-payload conflicts and stored results. An AEC model-revision study is a second experiment, not the default. Both keep local state when switching and explicitly distinguish synthetic data from production code. The retry example is not a durable/concurrent database implementation; the model study does not parse IFC or assess safety.
- **Background:** self-directed engineering, Talosys, and construction experience, grounded in the existing résumé.
- **Repository notebook:** opt-in snapshots for the public Vex and vex-bridge repositories only; Vex Atlas is not queried, listed, or linked in telemetry. Explicit errors/fallbacks, and no fake deployment/build status. Server-side GitHub requests time out after six seconds; the browser allows twelve seconds. Snapshots may be cached.
- **Contact and résumé:** labeled forms with preserved drafts on failure; accessible HTML résumé summary plus the original PDF, DOCX, and image previews.

## Routes

The homepage remains an overview. Header and project links use direct, server-rendered paths: `/work`, `/practice`, `/notes`, `/lab`, `/about`, and `/contact`. Each section URL loads independently without JavaScript; `/work/portfolio` and `/work/vex` remain case studies. Skip links and article contents links still use in-page fragments for keyboard navigation.

## Interface & motion

The UI uses a light editorial canvas, a midnight-blue hero/lab/footer, cobalt accents, original SVG covers, and a sculptural engineering map on larger screens. The portfolio entry and proof panel use an actual local browser capture; the other covers are labeled decorative artwork, not product screenshots. The case studies separate directly inspectable portfolio behavior from the conceptual Vex architecture and do not claim unsourced performance or adoption results.

GSAP and `@gsap/react` handle masked hero entrances, one-shot scroll reveals, divider draws, reading progress, modest decorative parallax, fine-pointer button attraction, area-selection sculpture transitions, and gallery/lab entry transitions. There is no scroll interception, pinning, custom cursor, or perpetual animation. Content is server-rendered and visible without JavaScript; default CSS never hides it for an animation.

The header **Motion on/off** control pauses page animations for the current React session. Live `prefers-reduced-motion` always takes precedence; with reduced motion, the control explains that animations are off. Media subscriptions, observers, contexts, and tweens are cleaned up when disabled or unmounted. Article and résumé reading layouts remain static.

- `components/motion/MotionProvider.tsx`: shared preference and accessible toggle.
- `components/motion/MotionPage.tsx`: homepage entrance/scroll/magnetic animation lifecycle.
- `components/portfolio/SignalSculpture.tsx`: finite shape changes and desktop-only pointer tilt.
- `components/portfolio/ProjectVisual.tsx`: original project artwork.

The existing `pnpm-workspace.yaml` still contains an unresolved `unrs-resolver` build-script approval. Dependency commands can report `ERR_PNPM_IGNORED_BUILDS` until the owner decides that policy. GSAP packages are installed and locked; no unrelated dependency scripts were approved by this change.

## Content map

| Content | Location |
| --- | --- |
| Homepage composition | `app/page.tsx` |
| Direct section routes | `app/(sections)/[section]/page.tsx` |
| Project case studies and captured site image | `app/work/[slug]/page.tsx`, `public/assets/portfolio-home.png` |
| Introduction, story, approach | `components/portfolio/Hero.tsx`, `Story.tsx`, `Approach.tsx` |
| Default project list | `data/projects.json` |
| Project notes, domains and engineering areas | `data/work-notes.ts`, `data/work-areas.ts` |
| Notebook content and routes | `data/engineering-notes.ts`, `app/notes/` |
| Public profile / repository configuration | `data/mission-control.json` |
| Local experiments | `lib/delivery-lab.ts`, `lib/engineering-study.ts` |
| Design tokens, accessibility, responsive typography | `app/globals.css` |
| Search/social metadata and generated share image | `app/layout.tsx`, `app/opengraph-image.tsx` |
| Original résumé assets | `public/assets/` |

Project cards initially render from checked-in JSON, then refresh from the optional Spaces-backed server action. A configured remote project list is authoritative; it is not automatically overwritten or merged with new seed data. If an existing bucket contains only older projects, add the newer local entries through admin if desired. Their source content is in the résumé and local JSON. Unknown project IDs still render and are searchable under All work; add an entry in `data/work-notes.ts` to give a new project engineering-area filters, its domain, and implementation notes. The hero map is a curated view of checked-in content, independent of remote admin edits. Keep stable IDs when editing titles. The public project action strips `githubLink` and `link` from Vex Atlas even when an older Spaces document still contains them; any subsequent project save removes those fields from the stored document. Review and clear the existing bucket record separately if you need to remove it immediately, and note that older deployments, caches, and Git history may still contain previously published URLs. Project images remain editable/stored for compatibility; the gallery uses original decorative SVG covers rather than uploaded thumbnails, except for the portfolio entry's first-party site capture.

The previous mission-control/tech components and featured-startup data remain available in the repository but are not mounted on the new homepage. The featured-startup admin tab does not control a current homepage section.

The résumé files retain their original contact details; the website continues to use `syokslawrence@gmail.com`. No résumé assets were regenerated. Review first-person copy and case-study notes against your latest experience before publishing.

## Optional integrations

### Admin and Spaces

Set `ADMIN_PASSWORD` to a strong unique password and `ADMIN_SESSION_SECRET` to a cryptographically random value of at least 32 characters. For example, generate a secret locally with:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Authentication fails closed if configuration is missing. Every write/upload checks an eight-hour signed server session. Cookies are HttpOnly, SameSite=Strict, and Secure in production. Production therefore requires HTTPS (loopback browser tests are the local exception). Changing either credential invalidates sessions. Existing browser-only admin sessions no longer grant access.

Configure the five `DO_SPACES_*` values for persistence and uploads. Only JPEG, PNG, and WebP signatures are accepted; uploads are limited to 900 KB to stay below Next's default Server Action body limit. Signature checks are not an image-decoding or malware-scanning service.

The login limiter is intentionally small and process-local: ten attempts per fifteen minutes, shared by that process. It is not a distributed abuse-control system. Configure edge-level rate limiting for public contact submissions and authentication in production. Spaces project edits remain whole-document writes; concurrent editing is not supported.

### Contact

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASS`. Mail goes to the portfolio owner's configured address in `app/actions.ts`, with the visitor set as `replyTo`. Missing SMTP configuration is shown honestly; no message is silently marked sent. Messages are not stored in a database.

### GitHub and social metadata

`GITHUB_TOKEN` is optional and remains server-side. Use a least-privilege token for public repository reads. Visitors can use the project links without requesting a telemetry snapshot.

Set `NEXT_PUBLIC_SITE_URL` to the actual public origin **at build time**, including Docker builds, so generated social URLs do not point to localhost. The GitHub deployment workflow reads the repository variable of the same name. Without it the site still works locally, but production social metadata needs configuration.

## Validation

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
```

- Unit/action tests cover delivery replay/conflicts/reset/limits, model geometry/evidence, notebook completeness/links/provenance, engineering-area mappings, private Vex Atlas link stripping from older Spaces data, session signing/expiry/tampering, authorization before storage access, upload validation, and contact validation with mocked SMTP/Spaces.
- The dependency-free browser smoke script uses an installed Edge, Chrome, or Chromium (or `BROWSER_PATH`). It launches and closes its own local production server and temporary browser profile. Ports 3107 and 9317 must be free.
- Browser checks cover responsive widths, fragment-free section navigation/direct routes, navigation/keyboard behavior, motion preference/toggling/transitions, no-JavaScript readability, work search/filters/disclosures, mobile first-screen case-study access, all three case-study routes/404s, the engineering map, both state-preserving experiments, complete note routes/anchors/404s, contact failure, mocked snapshot failure/retry, résumé assets, and actual signed-cookie admin login/logout. It disables external write integrations and uses throwaway credentials; it does not send mail or alter bucket contents.
- Screenshots are written to the ignored `.next/screenshots/` directory. No browser automation dependency is added.

## Deployment

Next.js standalone output is packaged by the existing Dockerfile and GitHub Actions → GHCR → DigitalOcean workflow. Supply runtime secrets through the deployment platform; `app.yaml` includes the new admin secret names. Do not deploy a `.env.local` file inside the image. The Docker build and metadata require the public site URL as a build argument; private integration credentials belong only at runtime.
