/**
 * E10-P2 — Runtime Service Lifecycle
 * CREATED → REGISTERED → STARTING → RUNNING → STOPPING → STOPPED | FAILED
 */

import { RUNTIME_SERVICE_STATUSES } from "./runtime.constants";
import type {
  RuntimeService,
  RuntimeServiceStatus,
} from "./runtime.types";

const SERVICE_TRANSITIONS: ReadonlyArray<
  readonly [RuntimeServiceStatus, RuntimeServiceStatus]
> = [
  ["CREATED", "REGISTERED"],
  ["REGISTERED", "STARTING"],
  ["STARTING", "RUNNING"],
  ["STARTING", "FAILED"],
  ["RUNNING", "STOPPING"],
  ["STOPPING", "STOPPED"],
  ["STOPPING", "FAILED"],
  ["FAILED", "STARTING"],
  ["STOPPED", "STARTING"],
] as const;

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceServiceStatus(
  from: RuntimeServiceStatus,
  to: RuntimeServiceStatus,
): boolean {
  return SERVICE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

export function assertServiceStatus(
  status: string,
): asserts status is RuntimeServiceStatus {
  if (!(RUNTIME_SERVICE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid runtime service status: ${status}`);
  }
}

export function transitionService(
  service: RuntimeService,
  to: RuntimeServiceStatus,
  note?: string,
): RuntimeService {
  assertServiceStatus(to);
  if (!canAdvanceServiceStatus(service.status, to)) {
    throw new Error(
      `Invalid service transition: ${service.status} → ${to}${note ? ` (${note})` : ""}`,
    );
  }

  const next: RuntimeService = {
    ...service,
    status: to,
    metadata: {
      ...service.metadata,
      ...(note ? { lastTransitionNote: note } : {}),
    },
  };

  if (to === "RUNNING") {
    next.startedAt = nowIso();
    next.stoppedAt = undefined;
  }
  if (to === "STOPPED" || to === "FAILED") {
    next.stoppedAt = nowIso();
  }

  return next;
}

export function startService(service: RuntimeService): RuntimeService {
  let next = transitionService(service, "STARTING", "start requested");
  next = transitionService(next, "RUNNING", "start completed");
  return next;
}

export function stopService(service: RuntimeService): RuntimeService {
  let next = transitionService(service, "STOPPING", "stop requested");
  next = transitionService(next, "STOPPED", "stop completed");
  return next;
}

export function failService(
  service: RuntimeService,
  reason: string,
): RuntimeService {
  if (service.status === "STARTING" || service.status === "STOPPING") {
    return transitionService(service, "FAILED", reason);
  }
  if (service.status === "RUNNING") {
    let next = transitionService(service, "STOPPING", reason);
    return transitionService(next, "FAILED", reason);
  }
  throw new Error(
    `failService invalid from status: ${service.status}`,
  );
}
