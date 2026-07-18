/**
 * E09-P1 — Global Network Runtime Trace
 * Instance-based event recording for the runtime kernel
 */

export const NETWORK_RUNTIME_TRACE_KINDS = [
  "ready",
  "start",
  "stop",
  "action",
  "connect",
  "disconnect",
  "result",
  "error",
] as const;

export type NetworkRuntimeTraceKind =
  (typeof NETWORK_RUNTIME_TRACE_KINDS)[number];

export type NetworkRuntimeTraceEvent = {
  id: string;
  kind: NetworkRuntimeTraceKind;
  at: string;
  message: string;
  data?: Readonly<Record<string, string>>;
};

export type NetworkRuntimeTrace = {
  traceId: string;
  runtimeId: string;
  events: NetworkRuntimeTraceEvent[];
  eventCount: number;
  startedAt: string;
  finishedAt?: string;
};

export type NetworkTraceStore = {
  record: (
    kind: NetworkRuntimeTraceKind,
    message: string,
    data?: Readonly<Record<string, string>>,
  ) => NetworkRuntimeTraceEvent;
  getTraces: (filter?: { kind?: NetworkRuntimeTraceKind }) => NetworkRuntimeTraceEvent[];
  getTrace: () => NetworkRuntimeTrace;
  clear: () => void;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function createNetworkTraceStore(input: {
  runtimeId: string;
  traceId?: string;
}): NetworkTraceStore {
  const traceId = input.traceId?.trim() || createId("gn-trace");
  const runtimeId = input.runtimeId.trim();
  const startedAt = nowIso();
  let events: NetworkRuntimeTraceEvent[] = [];
  let finishedAt: string | undefined;

  function record(
    kind: NetworkRuntimeTraceKind,
    message: string,
    data?: Readonly<Record<string, string>>,
  ): NetworkRuntimeTraceEvent {
    const event: NetworkRuntimeTraceEvent = {
      id: createId("gn-evt"),
      kind,
      at: nowIso(),
      message,
      data: data ? Object.freeze({ ...data }) : undefined,
    };
    events = [...events, event];
    if (kind === "stop" || kind === "error" || kind === "result") {
      finishedAt = event.at;
    }
    return { ...event, data: event.data ? { ...event.data } : undefined };
  }

  function getTraces(filter?: {
    kind?: NetworkRuntimeTraceKind;
  }): NetworkRuntimeTraceEvent[] {
    const list = filter?.kind
      ? events.filter((e) => e.kind === filter.kind)
      : events;
    return list.map((e) => ({
      ...e,
      data: e.data ? { ...e.data } : undefined,
    }));
  }

  function getTrace(): NetworkRuntimeTrace {
    return {
      traceId,
      runtimeId,
      events: getTraces(),
      eventCount: events.length,
      startedAt,
      finishedAt,
    };
  }

  return {
    record,
    getTraces,
    getTrace,
    clear: () => {
      events = [];
      finishedAt = undefined;
    },
  };
}
