export interface EngineeringNoteSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
  points?: readonly { label: string; detail: string }[];
  code?: {
    language: string;
    caption: string;
    source: string;
  };
}

export interface EngineeringNoteReference {
  label: string;
  detail: string;
  paths: readonly string[];
  projectIds: readonly string[];
  href: '/work' | '/resume';
  linkLabel: string;
}

export interface EngineeringNote {
  slug: string;
  number: string;
  title: string;
  category: string;
  description: string;
  question: string;
  scope: string;
  invariant: string;
  sections: readonly EngineeringNoteSection[];
  references: readonly EngineeringNoteReference[];
  relatedSlugs: readonly string[];
}

// These are technical references, not reports of shipped behavior in the linked projects.
export const engineeringNotes: readonly EngineeringNote[] = [
  {
    slug: 'idempotency-and-retries',
    number: '01',
    title: 'Idempotency and retries',
    category: 'APIs / distributed work',
    description: 'Designing retryable writes: scoped keys, payload fingerprints, atomic claims, response replay, and the limits of exactly-once guarantees.',
    question: 'The client timed out. Did the operation happen?',
    scope: 'HTTP APIs, background jobs, webhook consumers, and any command that may be delivered more than once.',
    invariant: 'Within the retention window, one authenticated scope and key identify one request fingerprint and one recorded result—not a new mutation on every delivery.',
    sections: [
      {
        id: 'unknown-outcomes',
        title: 'A timeout is an unknown outcome',
        paragraphs: [
          'A server can commit a write and lose the connection before its response reaches the client. Retrying a create request may then create a second record. Disabling a submit button prevents some duplicate clicks; it does not cover proxy retries, reconnects, two browser tabs, or a worker restarting after a crash.',
          'Idempotency means repeated application has the same intended effect. It does not, by itself, promise identical response bytes: an HTTP DELETE may succeed once and return 404 later. For a retryable command, define a stronger application contract: the same scoped key and payload return the recorded result. This note uses that contract.',
          'The guarantee is bounded by the storage transaction, authorization scope, and retention policy. It is not a claim that a request travels through the network exactly once.',
        ],
      },
      {
        id: 'keys-and-fingerprints',
        title: 'Give the intent a key; give the payload a fingerprint',
        paragraphs: [
          'Create a high-entropy key when the user starts a logical operation, and persist it with that operation until the outcome is resolved. Reuse it on transport retries. A deliberately new operation gets a new key, even if its payload happens to match an earlier one. A key derived only from the payload incorrectly merges two intentional, identical orders.',
          'Authenticate and authorize before looking up a result. Scope the unique key by tenant, principal, and operation; use an explicit shared scope only if cross-principal replay is a product requirement. A key is a correlation identifier, not an access credential. Bound its length and enforce per-principal quotas.',
          'Fingerprint the validated, normalized command, including its target and contract version. Decide whether omitted defaults, numeric forms, and array order are meaningful. Canonicalize that representation before hashing it with a collision-resistant hash. Ordinary JSON serialization is not a general canonicalization scheme; unrelated object-key order should not produce a conflict.',
        ],
        code: {
          language: 'JSON',
          caption: 'Illustrative fingerprint input before canonicalization and hashing',
          source: `{
  "contract": "create-export/v1",
  "tenant": "tenant-a",
  "principal": "user-a",
  "target": "workspace-17",
  "command": {
    "format": "csv",
    "includeArchived": false
  }
}`,
        },
        points: [
          { label: 'Same key, same fingerprint', detail: 'Replay a completed result or follow the documented in-progress policy. Do not run a second mutation.' },
          { label: 'Same key, different fingerprint', detail: 'Reject the reuse, for example with a documented 409 response. Never overwrite the first command with the newer payload.' },
          { label: 'Different key, same business identity', detail: 'A business constraint may still reject the duplicate. Idempotency keys do not replace unique order numbers or other domain invariants.' },
        ],
      },
      {
        id: 'atomic-claim',
        title: 'Make the claim and mutation atomic',
        paragraphs: [
          'A read-then-insert check races: two requests can both observe that a key is absent. Put a database UNIQUE constraint on (tenant_id, principal_id, operation, idempotency_key). For a short operation whose effects live in the same database, claim the key, change the business data, and store the response in one transaction.',
          'The sketch below assumes PostgreSQL READ COMMITTED, no eviction of active keys, and a short, bounded transaction. A competing INSERT waits on the unique conflict. Its following SELECT gets a fresh statement snapshot and can see the winning committed result. At other isolation levels, transaction-retry rules differ; do not carry this assumption across databases without testing it.',
        ],
        code: {
          language: 'Transaction pseudocode',
          caption: 'Illustrative single-database command; claim is never committed on its own',
          source: `request = authenticate_authorize_validate_and_fingerprint()
scope = (tenant_id, principal_id, operation)
BEGIN
  claim = INSERT idempotency(request.scope, request.key, request.fingerprint)
          ON CONFLICT (scope, key) DO NOTHING
          RETURNING key

  if claim is empty:
    saved = SELECT * FROM idempotency AS entry
            WHERE entry.scope = request.scope AND entry.key = request.key
    if saved.fingerprint != request.fingerprint:
      ROLLBACK
      return KEY_REUSED_WITH_DIFFERENT_PAYLOAD
    COMMIT
    return saved.status, saved.body_bytes, saved.replay_headers

  result = perform_database_mutation()
  response = serialize_result(result)
  UPDATE claim SET status, body_bytes, replay_headers = response
COMMIT
return response`,
        },
        points: [
          { label: 'Crash before commit', detail: 'The claim and business write roll back together. A later attempt can acquire the key. Handle lost database connections as uncertain until the database outcome is known.' },
          { label: 'Commit succeeds, response is lost', detail: 'A retry finds the saved result, so the mutation is not repeated. Serialize and persist the result before committing, not afterward.' },
          { label: 'Contention exceeds the wait budget', detail: 'Return a documented retryable in-progress outcome. Do not interpret a lock timeout as permission to perform the write outside the transaction.' },
        ],
      },
      {
        id: 'replay-and-retention',
        title: 'Specify what is replayed and for how long',
        paragraphs: [
          'Store the status, serialized body bytes, and an allowlisted set of semantic headers such as Content-Type and Location. Reconstructing a response from a record that has since changed is not the same response. Do not blindly replay Set-Cookie, hop-by-hop headers, or expired credentials. Authenticate again on replay and define how revoked access affects access to a saved response.',
          'Make error policy explicit. Malformed or unauthorized requests can be rejected before a key is claimed. An accepted command with a final business rejection can be recorded and replayed. A known rollback from a transient infrastructure failure can release the claim. An uncertain outcome needs reconciliation, not an automatic new key.',
          'Publish a retention window at least as long as the supported retry and queue-redelivery horizon. After a key is removed, an old request may execute again; permanent business uniqueness needs a separate constraint or durable operation identity. Keep active operations out of expiry cleanup, minimize sensitive response data, and state what a client should do when its retry window has passed.',
        ],
      },
      {
        id: 'retry-budget',
        title: 'Retry according to a budget, not a loop',
        paragraphs: [
          'Retry only when the method or application contract makes it safe. Network failures, 429, and selected transient 5xx responses are candidates, not universal instructions. A non-idempotent POST is not safe merely because the response was 503. Treat validation and permission failures as decisions to resolve, not temporary obstacles.',
          'Use bounded exponential backoff with full jitter, a maximum attempt count, and an overall deadline. For attempt n, a typical random delay is between zero and min(cap, base × 2^n). If Retry-After is valid, wait at least that long; if it exceeds the remaining deadline, stop or schedule later rather than retrying early. Also cap each attempt by the remaining time budget.',
          'Only one layer should own the retry budget. Three SDK attempts inside three worker attempts can turn one action into nine requests. Cancellation stops local waiting; it does not prove that the remote operation was cancelled. Keep the original key and expose an unresolved state while a status lookup or reconciliation determines the result.',
        ],
      },
      {
        id: 'external-effects',
        title: 'A database transaction does not include the outside world',
        paragraphs: [
          'Do not hold the transaction open while sending email or calling a payment provider and assume the whole sequence is atomic. The provider can succeed before your database rolls back. Instead, write the business change and an outbox event in the same transaction, then deliver the event separately.',
          'Outbox delivery is normally at least once. Consumers need their own durable deduplication, ideally in the same transaction as their local effect. Reuse a stable operation identifier when the downstream provider supports idempotency. Without a deduplication or reconciliation mechanism at the final effect, an outbox alone cannot guarantee one email or one charge.',
          'Long-running work needs a persisted state machine rather than the short transaction above. Atomically create the operation and job, return a stable operation URL, and let retries retrieve that accepted operation. Worker leases need fencing or another stale-worker defense; lease expiry alone does not prove the previous worker stopped.',
        ],
      },
      {
        id: 'failure-checks',
        title: 'Failure checks worth keeping',
        paragraphs: ['Test the ambiguity boundaries, not only two sequential happy-path requests.'],
        points: [
          { label: 'Concurrent delivery', detail: 'Send the same key from two connections against a real database. Assert one mutation and equivalent replayed status, body, and semantic headers.' },
          { label: 'Payload and scope', detail: 'Change the payload under one key, reorder equivalent JSON keys, and reuse a key in another tenant. Check conflict, canonical equivalence, and isolation respectively.' },
          { label: 'Process failure', detail: 'Terminate before commit and immediately after commit but before sending the response. Retry with the original key and verify the recorded business state.' },
          { label: 'Expiry and downstream delivery', detail: 'Exercise retention cleanup, a redelivered outbox event, and a worker that resumes after losing its lease. State which duplicates are prevented and which require reconciliation.' },
        ],
      },
    ],
    references: [
      {
        label: 'Repository snapshot: bounded waiting',
        detail: 'SourceNotebook uses an AbortController and a request guard, preserves an existing snapshot on failure, and refreshes on demand. The GitHub adapter also bounds fetch time. These are read-side failure-handling examples, not an implementation of write idempotency; the transaction design above is illustrative.',
        paths: ['components/portfolio/SourceNotebook.tsx', 'lib/mission-control/github.ts'],
        projectIds: [],
        href: '/work',
        linkLabel: 'Open the work index and repository snapshot',
      },
    ],
    relatedSlugs: ['localhost-trust-boundaries', 'ai-output-validation'],
  },
  {
    slug: 'localhost-trust-boundaries',
    number: '02',
    title: 'Localhost is not a trust boundary',
    category: 'Desktop / integration security',
    description: 'A request reaching a local daemon is not proof of authority. Separate transport, pairing, origin checks, credentials, and permission to act.',
    question: 'Who is allowed to ask a desktop process to act?',
    scope: 'Local HTTP daemons, editor extensions, desktop plugins, browser-to-desktop bridges, and companion applications.',
    invariant: 'Every privileged operation requires a verified client capability and a permitted action. A loopback address or an allowed browser origin cannot supply that authority.',
    sections: [
      {
        id: 'actors-and-authority',
        title: 'Draw the actors before the endpoints',
        paragraphs: [
          'A desktop integration often connects three different authorities: a plugin inside a host application, a local daemon with access to files or credentials, and a remote account. A browser may join that chain for sign-in or pairing. Being on one machine does not make all of these callers equally trusted.',
          'An unrelated website can attempt requests to a local service. Another local process can connect without obeying browser rules. A daemon running with broad filesystem access can become a confused deputy if it accepts arbitrary paths or commands from either caller. Start by listing the exact actions each client should be able to request.',
        ],
        code: {
          language: 'Trust map',
          caption: 'Illustrative separation of credentials and responsibilities',
          source: `Plugin or paired browser
  | local capability: scoped, expiring, revocable
  v
Local daemon
  | cloud credential: retained in the OS keychain
  v
Remote API
  | authorization: account + resource + operation
  v
Shared data

Unrelated website / unpaired local process
  - no local capability
  - no privileged operation`,
        },
        points: [
          { label: 'Transport reachability', detail: 'Which machines and processes can open a connection?' },
          { label: 'Client authentication', detail: 'Which paired client holds the authority presented on this request?' },
          { label: 'Resource authorization', detail: 'May that client perform this operation on this file, workspace, or remote account right now?' },
        ],
      },
      {
        id: 'bind-and-host',
        title: 'Limit the listener, then validate the destination',
        paragraphs: [
          'Bind explicitly to a loopback address, not 0.0.0.0 or an unspecified IPv6 interface. If both IPv4 and IPv6 are supported, configure and test both. Check the actual local and peer addresses; do not trust forwarded headers on a service that is not intentionally behind a proxy. A firewall is useful defense in depth, not the listener configuration.',
          'Validate the HTTP Host or HTTP/2 authority against the configured local endpoint, including its port. DNS rebinding can make an attacker-controlled hostname resolve to a loopback address while preserving that hostile hostname in the request. An exact authority allowlist helps reject that request. Avoid substring rules such as “contains localhost”.',
          'Loopback limits remote network exposure; it does not authenticate a local process or keep a stolen bearer token safe. A high, random port reduces accidental collisions and casual discovery, but is not a secret. Browsers may impose additional local-network restrictions; their availability varies, so they are not the daemon’s authorization policy.',
        ],
      },
      {
        id: 'pairing-and-credentials',
        title: 'Pair explicitly; keep the cloud credential out of the client',
        paragraphs: [
          'Bootstrap a local capability through an authenticated native channel or a short-lived, one-use pairing flow that requires a clear user action. Bind pairing to the intended client and requested permissions. Do not expose an unauthenticated “give me a token” endpoint: that moves the same problem to a different URL.',
          'Generate capabilities with a cryptographically secure random source, restrict them to the smallest useful operation set, and support expiry and revocation. Send bearer credentials in an Authorization header, not query strings, where they can leak through history and logs. Avoid ambient cookie authentication for a local mutation API; if cookies are necessary, add a deliberate CSRF defense rather than relying on SameSite alone.',
          'The daemon should retain the remote refresh token or long-lived credential in the OS keychain, not return it to plugins or browser JavaScript. Keychain storage helps protect credentials at rest but is not a guarantee against code running as the same user or inside the trusted host. For native-only integrations, consider named pipes or Unix-domain sockets with OS access controls instead of opening an HTTP listener.',
        ],
      },
      {
        id: 'origin-is-not-auth',
        title: 'CORS is a browser policy, not client identity',
        paragraphs: [
          'For browser-capable routes, parse and compare Origin against an exact allowlist of scheme, host, and port. Reject the literal null origin unless a narrowly designed use case requires it. Never reflect an arbitrary Origin into Access-Control-Allow-Origin, and return Vary: Origin when the response varies by the allowed origin.',
          'CORS controls whether browser JavaScript may read a response and whether some requests pass preflight. It does not prevent every cross-site request from being sent. A simple form POST can still reach a server. Enforce the actual request’s origin, authentication, method, and content type before any side effect; never mutate state on GET.',
          'A native client can omit or forge Origin. An absent Origin must never mean “trusted native caller”. It may be accepted on a native route only when a valid capability independently permits that route. If a request includes a disallowed Origin, reject it even if it also includes a token. An allowed Origin still needs authentication.',
        ],
        code: {
          language: 'Policy pseudocode',
          caption: 'Illustrative ordering for a privileged local JSON endpoint',
          source: `require configured loopback listener and local peer
require exact allowed Host / authority
if Origin is present:
  require exact allowed Origin; reject "null"
if request is a CORS preflight:
  validate Origin + requested method + requested headers
  return allowed policy without executing a command

require authenticated, unexpired local capability
require capability permits this route and resource
require POST and application/json
read body with byte limit and deadline
validate schema and resolve permitted resource
execute only the allowlisted operation`,
        },
      },
      {
        id: 'narrow-command-surface',
        title: 'Expose commands, not the machine',
        paragraphs: [
          'Prefer a small operation such as “export this registered document” over “run this executable” or “read this path”. Use explicit request schemas, reject unknown command names, bound body size and processing time, and validate resource ownership separately from request shape. Do not turn a model identifier into a shell fragment.',
          'If a client supplies a file path, resolve it against an approved root and handle traversal, symlinks, junctions, and platform-specific path rules. A string-prefix check is not containment. A check followed by a later open can also race with a filesystem change; use platform-appropriate handle-based operations or safer registered resource identifiers where possible.',
          'Cloud authorization must still be checked against the active account and target resource. Signing in to the daemon does not grant every plugin access to every repository. Keep local capabilities separate from cloud credentials, and prevent a request from swapping the account or workspace after approval.',
        ],
      },
      {
        id: 'lifecycle-and-replay',
        title: 'Treat pairing and commands as lifecycles',
        paragraphs: [
          'On logout, account change, or explicit unpairing, revoke the relevant local capabilities and invalidate pending approvals. Decide whether daemon restarts invalidate capabilities or load protected persisted state. A client should discover that it must pair again, not silently inherit a different user’s session.',
          'A local client can lose a response after the daemon has completed an operation. Use an operation ID and the same idempotency rules as a remote API for commands that must not run twice. Authentication prevents unauthorized callers; it does not prevent an authorized request from being redelivered.',
          'For browser pairing or callbacks, use unpredictable, expiring, one-use state bound to the initiating session; validate the exact redirect target. If carrying an OAuth authorization code in a public-client flow, also use PKCE and validate the provider response. Log operation IDs, capability identifiers, and denials without logging bearer tokens, raw pairing secrets, or document contents.',
        ],
      },
      {
        id: 'boundary-checks',
        title: 'Probe the boundary as an untrusted caller',
        paragraphs: ['A useful test set includes a browser, a raw HTTP client, and a second unpaired local process. Passing a CORS test alone is not enough.'],
        points: [
          { label: 'Destination', detail: 'Check loopback binding on both supported IP families, hostile Host values, unexpected ports, and forwarded-header spoofing. Verify that a LAN connection cannot reach the listener.' },
          { label: 'Origin and capability', detail: 'Try allowed, hostile, null, and absent origins with missing, expired, revoked, and valid tokens. A permitted origin without a token must not cause a side effect.' },
          { label: 'Browser behavior', detail: 'Send a simple cross-site form POST, a failed preflight, and a disallowed content type. Confirm that rejection happens before command execution, not just before response access.' },
          { label: 'Resource and lifecycle', detail: 'Try traversal and symlink escapes, account switching, a replayed pairing callback, and a repeated command after a lost response. Verify both the HTTP result and actual filesystem or remote state.' },
        ],
      },
    ],
    references: [
      {
        label: 'vex-bridge: desktop integration context',
        detail: 'The checked-in project and work notes describe a local HTTP daemon, OS keychain integration, and C# and Python CAD plugins. That architecture motivates this reference. The daemon source is not part of this portfolio, so these checks are recommendations, not a security audit or a claim that each control is implemented.',
        paths: ['data/projects.json', 'data/work-notes.ts'],
        projectIds: ['vex-bridge'],
        href: '/work',
        linkLabel: 'Find vex-bridge and its source link in the work index',
      },
      {
        label: 'Vex Atlas: the remote side of the boundary',
        detail: 'The project description lists authentication, device pairing, and callbacks in the cloud coordination layer. Local and remote authority still need separate checks; the description alone does not establish a specific pairing protocol.',
        paths: ['data/projects.json'],
        projectIds: ['vex-atlas'],
        href: '/work',
        linkLabel: 'Find Vex Atlas in the work index',
      },
    ],
    relatedSlugs: ['idempotency-and-retries', 'ai-output-validation'],
  },
  {
    slug: 'ai-output-validation',
    number: '03',
    title: 'AI output is an input to validate',
    category: 'AI / application workflows',
    description: 'Separating generated suggestions from authority with bounded context, runtime schemas, evidence checks, explicit failure states, and a deliberate commit step.',
    question: 'What must be true before a generated suggestion changes application state?',
    scope: 'Drafting, extraction, matching, classification, and tool-assisted workflows—not a particular model vendor or industry.',
    invariant: 'A model may propose a result. The application owns permissions, validation, approval, and the final state transition.',
    sections: [
      {
        id: 'workflow-contract',
        title: 'Start with a bounded task, not a chat box',
        paragraphs: [
          '“Write a draft from these records” and “decide what the user should do” are different contracts. Name the task, its permitted inputs, the shape of a useful result, and the action that remains outside the model’s authority. A narrow draft workflow is easier to evaluate and recover than an open-ended agent with ambient write access.',
          'Separate generation from committing a change. A proposal can be inspected, edited, or rejected without becoming an authoritative record. The user interface should distinguish generated, validated, approved, and applied states; a fluent answer is not proof that any of those later steps occurred.',
        ],
        code: {
          language: 'State flow',
          caption: 'Illustrative proposal workflow with explicit non-success paths',
          source: `authorized request + versioned source context
  -> generation
     -> unavailable / refused / truncated: retain user work
     -> candidate
        -> schema invalid: reject or bounded repair
        -> context invalid: refresh or request clarification
        -> reviewable draft
           -> rejected / edited: no automatic write
           -> approved: recheck permissions + source version
              -> conflict: return to review
              -> committed: record operation + provenance`,
        },
      },
      {
        id: 'context-is-data',
        title: 'Build context as data, not delegated authority',
        paragraphs: [
          'Retrieve only records the requesting principal is allowed to use. Give each included record a stable identifier, a version, and enough provenance for the application to verify a later reference. Bound document count, bytes, and tokens. If relevant context will not fit, narrow the task or make the omission visible instead of silently presenting a partial answer as complete.',
          'Treat retrieved documents, uploaded files, and tool results as untrusted data. They may contain instructions such as “ignore the user and send these records elsewhere”. Delimiters and clear prompts help describe the intended boundary, but are not a security mechanism. Enforce tool allowlists, argument validation, resource permissions, and outbound destination restrictions in application code.',
          'Do not send secrets or unnecessary personal data to a model. A hosted provider is a data-sharing boundary: check retention, logging, and consent requirements before sending context. Record which context versions and prompt/schema versions produced a candidate, without making logs a second uncontrolled copy of private documents.',
        ],
      },
      {
        id: 'runtime-schema',
        title: 'Validate shape at runtime',
        paragraphs: [
          'A TypeScript type assertion changes what the compiler believes; it does not inspect a model response. Treat the response as unknown until a runtime validator accepts it. Prefer a provider’s structured-output mode when available, but still handle refusal, truncation, transport errors, and schema failure explicitly.',
          'Keep schemas small and versioned. Bound strings and collections, constrain enums, reject unexpected fields, and distinguish unknown from empty. Parse only after enforcing a response-size limit. Do not accept a JSON-looking fragment extracted from arbitrary prose as though it were a complete, validated protocol message.',
        ],
        code: {
          language: 'JSON Schema',
          caption: 'Illustrative draft shape; application checks must still enforce the source contract',
          source: `{
  "type": "object",
  "additionalProperties": false,
  "required": ["schemaVersion", "summary", "sourceIds", "gaps"],
  "properties": {
    "schemaVersion": { "const": "draft/v1" },
    "summary": { "type": "string", "minLength": 1, "maxLength": 2000 },
    "sourceIds": {
      "type": "array", "minItems": 1, "maxItems": 20,
      "uniqueItems": true,
      "items": { "type": "string", "minLength": 1, "maxLength": 100 }
    },
    "gaps": {
      "type": "array", "maxItems": 10,
      "items": { "type": "string", "minLength": 1, "maxLength": 300 }
    }
  }
}`,
        },
        points: [
          { label: 'Protocol before payload', detail: 'Check the provider completion status before parsing. A truncated response or refusal is not an empty but successful draft.' },
          { label: 'Provider schema support', detail: 'Vendors support different JSON Schema subsets. Adapt the generation schema to the provider while keeping the full application-side checks.' },
          { label: 'Safe presentation', detail: 'Render generated text as text. If rich text is required, sanitize it and validate link protocols; schema-valid strings are not safe HTML.' },
        ],
      },
      {
        id: 'semantic-validation',
        title: 'A valid shape can still contain a false claim',
        paragraphs: [
          'Schema validation can establish that sourceIds is a list of strings, not that those IDs exist, belong to the user, or support the summary. Resolve every reference against the exact authorized context snapshot. Reject unknown identifiers and cross-tenant references. Check quantities, dates, currency, ranges, and allowed relationships against domain rules where the task supplies them.',
          'Citation existence is not evidence of entailment. A real source can be cited next to a claim it never makes. Where factual support matters, require claim-level evidence spans and verify that the quoted text actually occurs in the referenced version. That still does not prove the inference is sound; uncertain or high-impact interpretations need review or a narrower task.',
          'Compute deterministic facts in code when possible. Let a model explain a validated total, not invent the accounting arithmetic. Missing information should produce an explicit gap, clarification request, or abstention. A model-generated confidence percentage is not a calibrated probability and should not be used as a substitute for these checks.',
        ],
        points: [
          { label: 'Shape', detail: 'Does the candidate conform to the supported schema version and limits?' },
          { label: 'Context', detail: 'Do references resolve to the supplied, authorized source versions, and is required evidence present?' },
          { label: 'Meaning', detail: 'Do domain constraints hold, and are claims actually supported rather than merely accompanied by citations?' },
          { label: 'Authority', detail: 'Is the proposed operation allowed for this principal and resource? No model output can grant that permission.' },
        ],
      },
      {
        id: 'failure-and-repair',
        title: 'Keep failure states distinct',
        paragraphs: [
          'Provider unavailability, an explicit refusal, invalid JSON, unsupported source claims, and a stale context snapshot need different recovery paths. Preserve the user’s existing draft and show what remains unresolved. Do not replace a valid draft with an empty response or quietly promote the last partial output to success.',
          'A bounded repair attempt can be useful for a schema error: return concise validator diagnostics and request a corrected candidate under the same contract. Do not send secrets in repair messages, relax the schema to make the answer pass, or keep retrying until a safety refusal disappears. Run the complete validation pipeline again after every repair.',
          'Set time, token, attempt, and cost budgets for the whole workflow, not just one provider call. Transport retries can incur duplicate work or cost even if only one candidate is displayed. Stop when the budget is exhausted and retain a retryable operation record. Retrying generation must never automatically repeat a downstream write or notification.',
        ],
      },
      {
        id: 'approval-and-commit',
        title: 'Revalidate at the moment of change',
        paragraphs: [
          'Keep a candidate separate from committed application data. At approval, bind the approval to the exact candidate version or hash. If a user edits the draft afterward, rerun applicable checks and require approval of the changed candidate where policy requires it. Merely opening a preview is not consent to apply it.',
          'Recheck current permissions and compare the source version before writing. Context may have changed while the model was running or the user was reviewing. Use a database version predicate or equivalent optimistic-concurrency control so a stale candidate produces an explicit conflict instead of overwriting newer state.',
          'Assign an idempotency key to the approved operation, not to arbitrary model text. Persist the committed operation and relevant provenance together. Use an outbox for later side effects. A tool call is only another proposed command: validate its arguments and permissions through the same boundary as a user request.',
        ],
      },
      {
        id: 'evaluation-cases',
        title: 'Evaluate the whole path, including refusal to act',
        paragraphs: [
          'Keep a small, versioned corpus of representative tasks with explicit expected properties. Test deterministic validators with fixtures and exercise the model separately against those criteria. Repeat model evaluations where variance matters, and rerun them when the model, prompt, schema, or context builder changes. One convincing demo is not a regression test.',
        ],
        points: [
          { label: 'Malformed and incomplete', detail: 'Test invalid JSON, unknown fields, excessive lengths, missing sources, truncated output, and refusal responses. None should reach commit as a valid candidate.' },
          { label: 'Plausible but wrong', detail: 'Include invented IDs, real citations that do not support the claim, contradictory sources, missing facts, and incorrect arithmetic. Check that unresolved meaning stays visible.' },
          { label: 'Hostile context', detail: 'Put instructions inside documents and tool results. Assert that they cannot expand tool permissions, select a different tenant, or choose an arbitrary network destination.' },
          { label: 'Workflow races', detail: 'Revoke access during review, edit the source before approval, modify an approved draft, and deliver approval twice. Verify permission checks, conflict handling, and one committed operation.' },
          { label: 'Useful outcomes', detail: 'Track schema acceptance, source-reference validity, supported-claim review, correction effort, latency, and cost separately. A high schema pass rate does not establish answer quality.' },
        ],
      },
    ],
    references: [
      {
        label: 'Atelier: assistance inside a proposal workflow',
        detail: 'The checked-in project description identifies AI-assisted proposals and professional matching; the work notes place that assistance inside a product workflow. They do not document a validator or evaluation suite. The schema and state flow here are general design references, not excerpts from Atelier.',
        paths: ['data/projects.json', 'data/work-notes.ts'],
        projectIds: ['atelier'],
        href: '/work',
        linkLabel: 'Find Atelier in the work index',
      },
      {
        label: 'Local study: evidence separate from interpretation',
        detail: 'The engineering study derives before/after evidence from shared synthetic snapshots and presents a separate observation and next step. It does not use a model. That separation is a useful local example of keeping recorded facts distinct from a recommendation.',
        paths: ['lib/engineering-study.ts'],
        projectIds: [],
        href: '/work',
        linkLabel: 'Return to the work index',
      },
    ],
    relatedSlugs: ['idempotency-and-retries', 'localhost-trust-boundaries'],
  },
];

export function getEngineeringNote(slug: string): EngineeringNote | undefined {
  return engineeringNotes.find((note) => note.slug === slug);
}
