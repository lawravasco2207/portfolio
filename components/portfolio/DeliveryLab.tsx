'use client';

import { useReducer } from 'react';
import Link from 'next/link';
import {
  MAX_DELIVERIES,
  createDeliveryLab,
  deliveryLabReducer,
  fingerprintPayload,
  getDeliveryControls,
  replayDeliveries,
  type DeliveryAction,
  type DeliveryResult,
  type TaskRecord,
} from '@/lib/delivery-lab';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';
const actions: ReadonlyArray<{ action: DeliveryAction; label: string; hint: string }> = [
  { action: 'send', label: 'Send request', hint: 'Deliver this key and body once.' },
  { action: 'retry', label: 'Retry same request', hint: 'Deliver the current key and body again.' },
  { action: 'new-request', label: 'New request', hint: 'Prepare a fresh key with normal priority. Does not send.' },
  { action: 'change-payload', label: 'Change payload', hint: 'Set high priority and send with the same key.' },
  { action: 'reset', label: 'Reset', hint: 'Clear both ledgers and restart at request 001.' },
];
const resultLabels = {
  created: 'Created',
  replayed: 'Replayed',
  conflict: 'Rejected: key conflict',
} as const;
const deliveryLabels = { send: 'First send', retry: 'Retry', 'changed-payload': 'Changed payload' } as const;

function describeResult(result: DeliveryResult) {
  return `${resultLabels[result.status]}${result.taskId ? ` ${result.taskId}` : ''}; +${result.effectDelta} effect`;
}

function Outcome({ result }: { result?: DeliveryResult }) {
  if (!result) return <p className="text-sm text-muted">Waiting for a delivery.</p>;
  return (
    <p className="text-sm leading-relaxed" data-status={result.status}>
      <span className={result.status === 'conflict' ? 'text-ochre' : 'text-paper'}>{resultLabels[result.status]}</span>
      {result.taskId && <> <code className="break-all font-mono text-xs">{result.taskId}</code></>}
      <span className="text-muted"> · +{result.effectDelta} effect</span>
    </p>
  );
}

function StrategyCard({
  strategy,
  tasks,
  result,
}: {
  strategy: 'naive' | 'idempotent';
  tasks: readonly TaskRecord[];
  result?: DeliveryResult;
}) {
  const guarded = strategy === 'idempotent';
  return (
    <section aria-labelledby={`delivery-${strategy}-title`} className="min-w-0 border border-line bg-surface p-5 sm:p-6">
      <p className={`mb-3 font-mono text-xs ${guarded ? 'text-accent' : 'text-ochre'}`}>
        {guarded ? '02 / Check the key first' : '01 / Process every arrival'}
      </p>
      <h4 id={`delivery-${strategy}-title`} className="text-xl font-medium tracking-tight">
        {guarded ? 'Idempotent processing' : 'Naive processing'}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {guarded
          ? 'A new key creates a task. The same key and body return the stored result. A different body is rejected.'
          : 'Every delivery creates a task, even if the same key has arrived before. No idempotency key is recorded.'}
      </p>
      <dl className="my-5 border-y border-line py-4">
        <dt className="text-xs text-muted">Persisted task rows (simulated)</dt>
        <dd id={`delivery-${strategy}-count`} className={`mt-2 font-mono text-4xl font-medium tabular-nums ${guarded ? 'text-accent' : 'text-paper'}`}>
          {tasks.length}
        </dd>
      </dl>
      <p className="mb-2 font-mono text-xs text-muted">Latest delivery</p>
      <Outcome result={result} />
      <details className="mt-5 border-t border-line pt-3">
        <summary className={`w-fit cursor-pointer py-1 text-sm text-paper ${focusRing}`}>
          Inspect {strategy} task rows
        </summary>
        {tasks.length === 0 ? <p className="mt-3 text-sm text-muted">No tasks written.</p> : (
          <ul id={`delivery-${strategy}-tasks`} aria-label={`${strategy} task rows`} className="mt-3 divide-y divide-line">
            {tasks.map((task) => (
              <li key={task.id} className="py-3 text-xs leading-relaxed">
                <p className="flex flex-wrap justify-between gap-2">
                  <code className="text-paper">{task.id}</code>
                  <span className="text-muted">Written by delivery {task.deliveryNumber}</span>
                </p>
                <p className="mt-1 text-muted">{task.payload.title} · {task.payload.priority} priority</p>
                <code className="mt-1 block break-all text-muted">{task.key}</code>
              </li>
            ))}
          </ul>
        )}
      </details>
    </section>
  );
}

export function DeliveryLab() {
  const [state, dispatch] = useReducer(deliveryLabReducer, undefined, createDeliveryLab);
  const controls = getDeliveryControls(state);
  const run = replayDeliveries(state.deliveries);
  const latest = run.events[run.events.length - 1];
  const atLimit = state.deliveries.length >= MAX_DELIVERIES;
  const readyToSend = controls.send;
  const status = readyToSend
    ? `${state.currentRequest.key} is ready. Nothing sent for this key yet. Use Send request.`
    : latest
      ? `Delivery ${latest.delivery.number}. Naive: ${describeResult(latest.naive)}. Idempotent: ${describeResult(latest.idempotent)}. Task totals: ${run.naive.tasks.length} naive, ${run.idempotent.tasks.length} idempotent.`
      : 'Ready to send a request.';

  return (
    <section id="delivery-lab" aria-labelledby="delivery-title" className="min-w-0 text-paper">
      <header className="mb-6">
        <h3 id="delivery-title" className="text-2xl font-medium tracking-tight">What happens when a request arrives twice?</h3>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Create a task, then deliver the same request again. Both strategies receive every delivery,
          each with its own ledger. Follow the task rows, returned results and stored keys.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          <span className="mr-2 inline-block border border-accent/30 px-2 py-1 font-mono text-accent">Local synthetic example</span>
          Runs synchronously in this tab. No real API, no data sent, no storage across reloads.
        </p>
      </header>

      <div className="border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h4 className="text-base font-medium">Create a task</h4>
            <p className="mt-1 font-mono text-xs text-muted">Illustrative command · POST /tasks</p>
          </div>
          <p className="font-mono text-xs text-muted">
            Deliveries <span id="delivery-count" className="text-paper">{state.deliveries.length}</span> / {MAX_DELIVERIES}
          </p>
        </div>

        <dl className="mt-5 grid min-w-0 gap-5 border-y border-line py-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="min-w-0">
            <dt className="font-mono text-xs text-muted">Request key</dt>
            <dd id="delivery-request-key" className="mt-2 break-all font-mono text-sm text-accent">{state.currentRequest.key}</dd>
            <dt className="mt-4 text-xs text-muted">Current body</dt>
            <dd className="mt-2 text-sm">
              {state.currentRequest.payload.title} · <span id="delivery-request-priority">{state.currentRequest.payload.priority}</span> priority
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="font-mono text-xs text-muted">Payload fingerprint</dt>
            <dd className="mt-2">
              <code id="delivery-request-fingerprint" className="block whitespace-pre-wrap break-all text-xs leading-relaxed text-paper">
                {fingerprintPayload(state.currentRequest.payload)}
              </code>
              <p className="mt-2 text-xs leading-relaxed text-muted">Exact canonical JSON for this fixed body schema, not a cryptographic hash. Priority is part of the comparison.</p>
            </dd>
          </div>
        </dl>

        <div role="group" aria-label="Request actions" className="mt-5 grid gap-x-3 gap-y-5 sm:grid-cols-2 xl:grid-cols-5">
          {actions.map(({ action, label, hint }) => (
            <div key={action} className="min-w-0">
              <button
                id={`delivery-${action}`}
                type="button"
                disabled={!controls[action]}
                aria-describedby={`delivery-${action}-hint`}
                onClick={() => dispatch(action)}
                style={{ cursor: controls[action] ? undefined : 'not-allowed' }}
                className={`min-h-11 w-full border px-3 py-2 text-sm font-medium disabled:border-line disabled:bg-canvas disabled:text-muted ${focusRing} ${action === 'send' ? 'border-accent bg-accent text-canvas enabled:hover:bg-paper' : 'border-line text-paper enabled:hover:border-muted enabled:hover:bg-canvas'}`}
              >
                {label}
              </button>
              <p id={`delivery-${action}-hint`} className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
          Start with Send request, then retry it. After Change payload, retries repeat the changed body—not the original.
          Each run stops at {MAX_DELIVERIES} deliveries; Reset clears the log and both stores.
        </p>
      </div>

      <p id="delivery-status" role="status" aria-atomic="true" className="my-5 border-l-2 border-accent pl-4 text-sm leading-relaxed text-paper">
        {status}{atLimit && ` Run limit reached (${MAX_DELIVERIES} deliveries). Reset to try again.`}
      </p>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <StrategyCard strategy="naive" tasks={run.naive.tasks} result={latest?.naive} />
        <StrategyCard strategy="idempotent" tasks={run.idempotent.tasks} result={latest?.idempotent} />
      </div>

      <section aria-labelledby="delivery-key-store-title" className="mt-6 min-w-0 border border-line">
        <div className="border-b border-line p-5 sm:px-6">
          <h4 id="delivery-key-store-title" className="text-base font-medium">Idempotency key store</h4>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Only the guarded strategy keeps these records. A replay or conflict does not change the original row.
            Keys remain for this entire run, including when you prepare a new request.
          </p>
        </div>
        {run.idempotent.keys.length === 0 ? (
          <p className="p-5 text-sm text-muted sm:px-6">No keys stored yet. Send a request to create the first record.</p>
        ) : (
          <div role="region" aria-label="Stored idempotency keys, horizontally scrollable" tabIndex={0} className={`overflow-x-auto ${focusRing}`}>
            <table id="delivery-key-store" className="w-full min-w-[34rem] table-fixed text-left text-xs">
              <caption className="sr-only">Simulated idempotency records: request key, canonical body fingerprint, and stored result</caption>
              <thead className="bg-surface text-muted">
                <tr>
                  <th scope="col" className="w-1/4 px-5 py-3 font-medium">Request key</th>
                  <th scope="col" className="w-1/2 px-5 py-3 font-medium">Payload fingerprint</th>
                  <th scope="col" className="w-1/4 px-5 py-3 font-medium">Stored result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {run.idempotent.keys.map((record) => (
                  <tr key={record.key} data-request-key={record.key}>
                    <th scope="row" className="break-all px-5 py-4 align-top font-mono font-normal text-accent">{record.key}</th>
                    <td className="break-all px-5 py-4 align-top font-mono leading-relaxed text-muted">{record.fingerprint}</td>
                    <td className="px-5 py-4 align-top">
                      <code className="break-all text-paper">{record.taskId}</code>
                      <span className="mt-1 block text-muted">Created by delivery {record.deliveryNumber}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="delivery-log-title" className="mt-6 min-w-0 border border-line">
        <div className="border-b border-line p-5 sm:px-6">
          <h4 id="delivery-log-title" className="text-base font-medium">Delivery log</h4>
          <p className="mt-2 text-xs leading-relaxed text-muted">Newest first. Every entry feeds both strategies. Up to {MAX_DELIVERIES} deliveries; nothing is silently dropped.</p>
        </div>
        <div role="region" aria-label="Delivery log entries, vertically scrollable" tabIndex={0} className={`max-h-[30rem] overflow-y-auto ${focusRing}`}>
          {run.events.length === 0 ? <p className="p-5 text-sm text-muted sm:px-6">No deliveries yet.</p> : (
            <ol id="delivery-events" reversed className="divide-y divide-line">
              {[...run.events].reverse().map((event) => (
                <li
                  key={event.delivery.number}
                  data-delivery-number={event.delivery.number}
                  data-naive-status={event.naive.status}
                  data-idempotent-status={event.idempotent.status}
                  className="p-5 sm:px-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h5 className="text-sm font-medium">Delivery {String(event.delivery.number).padStart(2, '0')} · {deliveryLabels[event.delivery.kind]}</h5>
                    <code className="break-all text-xs text-muted">{event.delivery.request.key}</code>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div><p className="mb-1 text-xs text-muted">Naive</p><Outcome result={event.naive} /></div>
                    <div><p className="mb-1 text-xs text-muted">Idempotent</p><Outcome result={event.idempotent} /></div>
                  </div>
                  <details className="mt-3">
                    <summary className={`w-fit cursor-pointer py-1 text-xs text-muted hover:text-paper ${focusRing}`}>
                      Inspect delivery {String(event.delivery.number).padStart(2, '0')}
                    </summary>
                    <pre className="mt-3 whitespace-pre-wrap break-all border border-line bg-surface p-3 font-mono text-xs leading-relaxed text-muted"><code>{JSON.stringify({
                      key: event.delivery.request.key,
                      body: event.delivery.request.payload,
                      fingerprint: fingerprintPayload(event.delivery.request.payload),
                      naive: event.naive,
                      idempotent: event.idempotent,
                    }, null, 2)}</code></pre>
                  </details>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <footer className="mt-6 grid gap-4 border-t border-line pt-5 text-xs leading-relaxed text-muted lg:grid-cols-2 lg:gap-8">
        <div>
          <h4 className="mb-2 text-sm font-medium text-paper">What this leaves out</h4>
          <p>
            This is a serial, in-memory model—not a production idempotency guarantee. A real implementation
            needs a database unique constraint on the scoped key, plus an atomic transaction that commits
            the key, payload fingerprint, business write and stored result together. Concurrent requests and crashes need explicit handling.
          </p>
        </div>
        <div>
          <p>
            Keep keys for a documented retention window that covers expected retries. Once a key expires,
            a late retry may create another effect. A database transaction cannot make an external email or
            payment atomic; use an outbox and downstream idempotency or reconciliation.
          </p>
          <Link href="/notes/idempotency-and-retries" prefetch={false} className={`mt-3 inline-flex min-h-11 items-center text-paper underline decoration-line underline-offset-4 hover:text-accent ${focusRing}`}>
            Read the note: idempotency and retries
          </Link>
        </div>
      </footer>
    </section>
  );
}
