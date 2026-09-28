export const MAX_DELIVERIES = 20;

export interface TaskPayload {
  readonly title: string;
  readonly priority: 'normal' | 'high';
}

export interface DeliveryRequest {
  readonly key: string;
  readonly payload: TaskPayload;
}

export type DeliveryKind = 'send' | 'retry' | 'changed-payload';
export type DeliveryAction = 'send' | 'retry' | 'new-request' | 'change-payload' | 'reset';

export interface Delivery {
  readonly number: number;
  readonly kind: DeliveryKind;
  readonly request: DeliveryRequest;
}

export interface DeliveryLabState {
  readonly requestNumber: number;
  readonly currentRequest: DeliveryRequest;
  readonly deliveries: readonly Delivery[];
}

export interface TaskRecord {
  readonly id: string;
  readonly key: string;
  readonly payload: TaskPayload;
  readonly deliveryNumber: number;
}

export interface IdempotencyRecord {
  readonly key: string;
  readonly fingerprint: string;
  readonly taskId: string;
  readonly deliveryNumber: number;
}

export type DeliveryResult =
  | { readonly status: 'created'; readonly taskId: string; readonly effectDelta: 1 }
  | { readonly status: 'replayed'; readonly taskId: string; readonly effectDelta: 0 }
  | { readonly status: 'conflict'; readonly taskId: null; readonly effectDelta: 0 };

export interface DeliveryEvent {
  readonly delivery: Delivery;
  readonly naive: DeliveryResult;
  readonly idempotent: DeliveryResult;
}

function makeRequest(number: number): DeliveryRequest {
  return {
    key: `task-request-${String(number).padStart(3, '0')}`,
    payload: { title: 'Review release checklist', priority: 'normal' },
  };
}

// Exact canonical serialization of this fixed schema, not a cryptographic hash.
export function fingerprintPayload(payload: TaskPayload): string {
  return JSON.stringify({ title: payload.title, priority: payload.priority });
}

export function createDeliveryLab(): DeliveryLabState {
  return { requestNumber: 1, currentRequest: makeRequest(1), deliveries: [] };
}

export function getDeliveryControls(state: DeliveryLabState): Record<DeliveryAction, boolean> {
  const hasCapacity = state.deliveries.length < MAX_DELIVERIES;
  const hasBeenSent = state.deliveries.some(({ request }) => request.key === state.currentRequest.key);

  return {
    send: hasCapacity && !hasBeenSent,
    retry: hasCapacity && hasBeenSent,
    'new-request': hasCapacity && hasBeenSent,
    'change-payload': hasCapacity && hasBeenSent && state.currentRequest.payload.priority === 'normal',
    reset: state.deliveries.length > 0 || state.requestNumber > 1,
  };
}

export function deliveryLabReducer(state: DeliveryLabState, action: DeliveryAction): DeliveryLabState {
  if (!getDeliveryControls(state)[action]) return state;
  if (action === 'reset') return createDeliveryLab();
  if (action === 'new-request') {
    const requestNumber = state.requestNumber + 1;
    return { ...state, requestNumber, currentRequest: makeRequest(requestNumber) };
  }

  const currentRequest: DeliveryRequest = action === 'change-payload'
    ? { ...state.currentRequest, payload: { ...state.currentRequest.payload, priority: 'high' } }
    : state.currentRequest;
  const delivery: Delivery = {
    number: state.deliveries.length + 1,
    kind: action === 'change-payload' ? 'changed-payload' : action,
    request: currentRequest,
  };

  return { ...state, currentRequest, deliveries: [...state.deliveries, delivery] };
}

function makeTask(request: DeliveryRequest, deliveryNumber: number, index: number): TaskRecord {
  return {
    id: `task-${String(index).padStart(3, '0')}`,
    key: request.key,
    payload: { ...request.payload },
    deliveryNumber,
  };
}

// Both strategies start empty and receive every arrival. The arrays model serial,
// atomic commits only; they are not a durable store or a concurrency mechanism.
export function replayDeliveries(deliveries: readonly Delivery[]) {
  const naiveTasks: TaskRecord[] = [];
  const idempotentTasks: TaskRecord[] = [];
  const keys: IdempotencyRecord[] = [];
  const events: DeliveryEvent[] = [];

  for (const delivery of deliveries) {
    const { request } = delivery;
    const naiveTask = makeTask(request, delivery.number, naiveTasks.length + 1);
    naiveTasks.push(naiveTask);

    const fingerprint = fingerprintPayload(request.payload);
    const stored = keys.find((record) => record.key === request.key);
    let idempotent: DeliveryResult;

    if (stored) {
      idempotent = stored.fingerprint === fingerprint
        ? { status: 'replayed', taskId: stored.taskId, effectDelta: 0 }
        : { status: 'conflict', taskId: null, effectDelta: 0 };
    } else {
      const task = makeTask(request, delivery.number, idempotentTasks.length + 1);
      idempotentTasks.push(task);
      keys.push({ key: request.key, fingerprint, taskId: task.id, deliveryNumber: delivery.number });
      idempotent = { status: 'created', taskId: task.id, effectDelta: 1 };
    }

    events.push({
      delivery,
      naive: { status: 'created', taskId: naiveTask.id, effectDelta: 1 },
      idempotent,
    });
  }

  return {
    naive: { tasks: naiveTasks },
    idempotent: { tasks: idempotentTasks, keys },
    events,
  };
}
