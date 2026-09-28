import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_DELIVERIES,
  createDeliveryLab,
  deliveryLabReducer,
  fingerprintPayload,
  getDeliveryControls,
  replayDeliveries,
} from './delivery-lab.ts';

// Node 22.18+ native TypeScript stripping; no test dependency required:
// node --test lib/delivery-lab.test.mjs
const advance = (...actions) => actions.reduce(deliveryLabReducer, createDeliveryLab());
const normalBody = { title: 'Review release checklist', priority: 'normal' };
const arrival = (number, key, payload = normalBody) => ({ number, kind: 'send', request: { key, payload } });

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

test('a fresh run has a deterministic request and two empty ledgers', () => {
  const state = createDeliveryLab();
  assert.deepEqual(state.currentRequest, { key: 'task-request-001', payload: normalBody });
  assert.equal(state.requestNumber, 1);
  assert.deepEqual(state.deliveries, []);
  assert.deepEqual(getDeliveryControls(state), {
    send: true, retry: false, 'new-request': false, 'change-payload': false, reset: false,
  });
  assert.deepEqual(replayDeliveries(state.deliveries), {
    naive: { tasks: [] }, idempotent: { tasks: [], keys: [] }, events: [],
  });
});

test('disabled actions are also guarded by the pure reducer', () => {
  const empty = createDeliveryLab();
  for (const action of ['retry', 'new-request', 'change-payload', 'reset']) {
    assert.strictEqual(deliveryLabReducer(empty, action), empty);
  }
  const sent = deliveryLabReducer(empty, 'send');
  assert.strictEqual(deliveryLabReducer(sent, 'send'), sent);
  assert.deepEqual(getDeliveryControls(sent), {
    send: false, retry: true, 'new-request': true, 'change-payload': true, reset: true,
  });
});

test('the first delivery writes an independent task in each strategy and one guarded key', () => {
  const state = advance('send');
  const run = replayDeliveries(state.deliveries);
  assert.equal(state.deliveries[0].number, 1);
  assert.equal(state.deliveries[0].kind, 'send');
  assert.equal(run.naive.tasks.length, 1);
  assert.equal(run.idempotent.tasks.length, 1);
  assert.notStrictEqual(run.naive.tasks[0], run.idempotent.tasks[0]);
  assert.notStrictEqual(run.naive.tasks[0].payload, run.idempotent.tasks[0].payload);
  assert.deepEqual(run.events[0].naive, { status: 'created', taskId: 'task-001', effectDelta: 1 });
  assert.deepEqual(run.events[0].idempotent, run.events[0].naive);
  assert.deepEqual(run.idempotent.keys, [{
    key: state.currentRequest.key,
    fingerprint: fingerprintPayload(normalBody),
    taskId: 'task-001',
    deliveryNumber: 1,
  }]);
});

test('a retry repeats the exact key and body, returning the original guarded result', () => {
  const state = advance('send', 'retry');
  const run = replayDeliveries(state.deliveries);
  assert.deepEqual(state.deliveries[1].request, state.deliveries[0].request);
  assert.equal(state.deliveries[1].kind, 'retry');
  assert.equal(run.naive.tasks.length, 2);
  assert.equal(run.idempotent.tasks.length, 1);
  assert.equal(run.idempotent.keys.length, 1);
  assert.deepEqual(run.events[1].naive, { status: 'created', taskId: 'task-002', effectDelta: 1 });
  assert.deepEqual(run.events[1].idempotent, { status: 'replayed', taskId: 'task-001', effectDelta: 0 });
});

test('repeated retries do not rewrite a key record or its task', () => {
  const first = replayDeliveries(advance('send').deliveries);
  const repeated = replayDeliveries(advance('send', 'retry', 'retry', 'retry').deliveries);
  assert.equal(repeated.naive.tasks.length, 4);
  assert.deepEqual(repeated.idempotent, first.idempotent);
  assert.deepEqual(repeated.events.map(({ idempotent }) => idempotent.status), ['created', 'replayed', 'replayed', 'replayed']);
});

test('changing the payload sends a conflicting body without changing earlier evidence', () => {
  const sent = advance('send');
  const changed = deliveryLabReducer(sent, 'change-payload');
  const run = replayDeliveries(changed.deliveries);
  assert.equal(changed.currentRequest.key, sent.currentRequest.key);
  assert.equal(changed.currentRequest.payload.priority, 'high');
  assert.equal(changed.deliveries.length, 2);
  assert.equal(changed.deliveries[1].kind, 'changed-payload');
  assert.equal(changed.deliveries[0].request.payload.priority, 'normal');
  assert.equal(sent.currentRequest.payload.priority, 'normal');
  assert.equal(run.naive.tasks[1].payload.priority, 'high');
  assert.deepEqual(run.events[1].idempotent, { status: 'conflict', taskId: null, effectDelta: 0 });
  assert.deepEqual(run.idempotent, replayDeliveries(sent.deliveries).idempotent);
  assert.equal(getDeliveryControls(changed)['change-payload'], false);
  assert.strictEqual(deliveryLabReducer(changed, 'change-payload'), changed);
});

test('retry after a payload change repeats the changed body and is still rejected', () => {
  const state = advance('send', 'change-payload', 'retry');
  const run = replayDeliveries(state.deliveries);
  assert.deepEqual(state.deliveries[2].request, state.deliveries[1].request);
  assert.equal(state.deliveries[2].kind, 'retry');
  assert.equal(run.naive.tasks.length, 3);
  assert.equal(run.idempotent.tasks.length, 1);
  assert.equal(run.events[2].idempotent.status, 'conflict');
  assert.equal(run.idempotent.keys[0].fingerprint, fingerprintPayload(normalBody));
});

test('new request only prepares a key, preserves history, and restores the default body', () => {
  const before = advance('send', 'change-payload');
  const state = deliveryLabReducer(before, 'new-request');
  assert.equal(state.currentRequest.key, 'task-request-002');
  assert.deepEqual(state.currentRequest.payload, normalBody);
  assert.strictEqual(state.deliveries, before.deliveries);
  assert.deepEqual(replayDeliveries(state.deliveries), replayDeliveries(before.deliveries));
  assert.deepEqual(getDeliveryControls(state), {
    send: true, retry: false, 'new-request': false, 'change-payload': false, reset: true,
  });
  for (const action of ['retry', 'new-request', 'change-payload']) {
    assert.strictEqual(deliveryLabReducer(state, action), state);
  }
});

test('a new key with the same body creates another task, not a replay', () => {
  const state = advance('send', 'retry', 'new-request', 'send', 'retry');
  const run = replayDeliveries(state.deliveries);
  assert.equal(run.naive.tasks.length, 4);
  assert.equal(run.idempotent.tasks.length, 2);
  assert.deepEqual(run.idempotent.keys.map(({ key }) => key), ['task-request-001', 'task-request-002']);
  assert.deepEqual(run.events[2].idempotent, { status: 'created', taskId: 'task-002', effectDelta: 1 });
  assert.deepEqual(run.events[3].idempotent, { status: 'replayed', taskId: 'task-002', effectDelta: 0 });
});

test('interleaved arrivals retain the original result for each key', () => {
  const run = replayDeliveries([
    arrival(1, 'a'), arrival(2, 'b'), arrival(3, 'a'), arrival(4, 'b'), arrival(5, 'a'),
  ]);
  assert.equal(run.naive.tasks.length, 5);
  assert.equal(run.idempotent.tasks.length, 2);
  assert.deepEqual(run.events.map(({ idempotent }) => idempotent.taskId), ['task-001', 'task-002', 'task-001', 'task-002', 'task-001']);
});

test('conflicts do not overwrite the fingerprint, so the original body can still replay', () => {
  const run = replayDeliveries([
    arrival(1, 'a'),
    arrival(2, 'a', { ...normalBody, priority: 'high' }),
    arrival(3, 'a', { ...normalBody, title: 'A different task' }),
    arrival(4, 'a'),
  ]);
  assert.deepEqual(run.events.map(({ idempotent }) => idempotent.status), ['created', 'conflict', 'conflict', 'replayed']);
  assert.equal(run.idempotent.tasks.length, 1);
  assert.deepEqual(run.idempotent.tasks[0].payload, normalBody);
  assert.equal(run.idempotent.keys[0].fingerprint, fingerprintPayload(normalBody));
  assert.equal(run.events[3].idempotent.taskId, 'task-001');
});

test('fingerprints cover every body field and ignore object insertion order', () => {
  assert.equal(fingerprintPayload({ priority: 'normal', title: normalBody.title }), fingerprintPayload(normalBody));
  assert.notEqual(fingerprintPayload({ ...normalBody, priority: 'high' }), fingerprintPayload(normalBody));
  assert.notEqual(fingerprintPayload({ ...normalBody, title: 'Other task' }), fingerprintPayload(normalBody));
  const unusual = { title: 'Review "release"\nchecklist | priority:high', priority: 'normal' };
  assert.deepEqual(JSON.parse(fingerprintPayload(unusual)), unusual);
});

test('request keys are data, including keys matching object prototype properties', () => {
  const run = replayDeliveries([
    arrival(1, '__proto__'), arrival(2, 'constructor'), arrival(3, '__proto__'),
  ]);
  assert.equal(run.idempotent.tasks.length, 2);
  assert.equal(run.events[2].idempotent.status, 'replayed');
});

test('reducer and replay are deterministic and do not mutate frozen inputs', () => {
  const sent = deepFreeze(advance('send', 'retry'));
  const changed = deliveryLabReducer(sent, 'change-payload');
  assert.equal(sent.deliveries.length, 2);
  assert.equal(sent.currentRequest.payload.priority, 'normal');
  assert.deepEqual(changed, deliveryLabReducer(sent, 'change-payload'));
  deepFreeze(changed);
  assert.deepEqual(replayDeliveries(changed.deliveries), replayDeliveries(changed.deliveries));
  assert.deepEqual(replayDeliveries(sent.deliveries).events, replayDeliveries(changed.deliveries).events.slice(0, 2));
});

test('the delivery limit bounds the whole run without dropping evidence or forgetting keys', () => {
  let state = advance('send');
  for (let index = 1; index < MAX_DELIVERIES; index++) state = deliveryLabReducer(state, 'retry');
  const run = replayDeliveries(state.deliveries);
  assert.equal(state.deliveries.length, MAX_DELIVERIES);
  assert.equal(run.events.length, MAX_DELIVERIES);
  assert.equal(run.naive.tasks.length, MAX_DELIVERIES);
  assert.equal(run.idempotent.tasks.length, 1);
  assert.equal(run.idempotent.keys[0].deliveryNumber, 1);
  assert.equal(run.events[0].delivery.number, 1);
  assert.equal(run.events[MAX_DELIVERIES - 1].delivery.number, MAX_DELIVERIES);
  assert.deepEqual(getDeliveryControls(state), {
    send: false, retry: false, 'new-request': false, 'change-payload': false, reset: true,
  });
  for (const action of ['send', 'retry', 'new-request', 'change-payload']) {
    assert.strictEqual(deliveryLabReducer(state, action), state);
  }
  const reset = deliveryLabReducer(state, 'reset');
  assert.deepEqual(reset, createDeliveryLab());
  assert.equal(deliveryLabReducer(reset, 'send').deliveries[0].number, 1);
});

test('reset clears conflicts, prepared requests, results, keys and counters', () => {
  const state = advance('send', 'retry', 'change-payload', 'new-request');
  const reset = deliveryLabReducer(state, 'reset');
  assert.deepEqual(reset, createDeliveryLab());
  assert.deepEqual(replayDeliveries(reset.deliveries), replayDeliveries([]));
  assert.deepEqual(advance('send', 'retry', 'reset', 'send', 'retry'), advance('send', 'retry'));
});

test('counts, stored results and log outcomes agree across short action sequences', () => {
  const actions = ['send', 'retry', 'change-payload', 'new-request', 'reset'];
  function inspect(state, depth) {
    const run = replayDeliveries(state.deliveries);
    assert.equal(run.events.length, state.deliveries.length);
    assert.equal(run.naive.tasks.length, run.events.reduce((sum, event) => sum + event.naive.effectDelta, 0));
    assert.equal(run.idempotent.tasks.length, run.events.reduce((sum, event) => sum + event.idempotent.effectDelta, 0));
    assert.equal(run.idempotent.keys.length, run.idempotent.tasks.length);
    assert.equal(new Set(run.idempotent.keys.map(({ key }) => key)).size, run.idempotent.keys.length);
    for (const record of run.idempotent.keys) {
      const task = run.idempotent.tasks.find(({ id }) => id === record.taskId);
      const first = state.deliveries.find(({ request }) => request.key === record.key);
      assert.equal(task.key, record.key);
      assert.equal(record.fingerprint, fingerprintPayload(task.payload));
      assert.equal(record.fingerprint, fingerprintPayload(first.request.payload));
      assert.equal(record.deliveryNumber, first.number);
    }
    if (depth > 0) for (const action of actions) inspect(deliveryLabReducer(state, action), depth - 1);
  }
  inspect(createDeliveryLab(), 6);
});
