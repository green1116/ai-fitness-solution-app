import type { WorkspaceRuntimeRegistryContext } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import {
  RUNTIME_LIFECYCLE_TRANSITIONS,
  type RuntimeLifecycleEntry,
  type RuntimeLifecycleSnapshot,
  type RuntimeLifecycleStatus,
} from "./runtime-lifecycle-types";
import {
  validateLifecycleTransition,
  validateRuntimeLifecycleSnapshot,
} from "./runtime-lifecycle-validation";
import { RUNTIME_LIFECYCLE_VERSION } from "./shared/runtime-constants";
import type { RuntimeRegistryKey } from "./runtime-registry-types";

function createLifecycleEntry(key: RuntimeRegistryKey, status: RuntimeLifecycleStatus): RuntimeLifecycleEntry {
  return {
    key,
    status,
    version: RUNTIME_LIFECYCLE_VERSION,
  };
}

function resolveAggregateLifecycleStatus(entries: RuntimeLifecycleSnapshot["entries"]): RuntimeLifecycleStatus {
  const workspaceStatus = entries.workspace.status;
  const statuses = RUNTIME_REGISTRY_KEYS.map((key) => entries[key].status);
  if (statuses.every((status) => status === workspaceStatus)) {
    return workspaceStatus;
  }
  if (statuses.some((status) => status === "refreshing")) {
    return "refreshing";
  }
  if (statuses.some((status) => status === "unmounted")) {
    return "unmounted";
  }
  if (statuses.every((status) => status === "mounted")) {
    return "mounted";
  }
  if (statuses.every((status) => status === "ready" || status === "mounted")) {
    return statuses.every((status) => status === "mounted") ? "mounted" : "ready";
  }
  return workspaceStatus;
}

function buildLifecycleEntries(
  status: RuntimeLifecycleStatus,
): RuntimeLifecycleSnapshot["entries"] {
  return {
    workspace: createLifecycleEntry("workspace", status),
    quote: createLifecycleEntry("quote", status),
    project: createLifecycleEntry("project", status),
    report: createLifecycleEntry("report", status),
  };
}

function applyLifecycleTransition(
  lifecycle: RuntimeLifecycleSnapshot,
  key: RuntimeRegistryKey,
  nextStatus: RuntimeLifecycleStatus,
): RuntimeLifecycleSnapshot {
  const currentStatus = lifecycle.entries[key].status;
  if (!validateLifecycleTransition(currentStatus, nextStatus)) {
    throw new Error(`Invalid lifecycle transition for ${key}: ${currentStatus} -> ${nextStatus}`);
  }

  const entries = {
    ...lifecycle.entries,
    [key]: createLifecycleEntry(key, nextStatus),
  };

  return {
    ...lifecycle,
    entries,
    status: resolveAggregateLifecycleStatus(entries),
  };
}

function applyLifecycleTransitionAll(
  lifecycle: RuntimeLifecycleSnapshot,
  nextStatus: RuntimeLifecycleStatus,
): RuntimeLifecycleSnapshot {
  let next = lifecycle;
  for (const key of RUNTIME_REGISTRY_KEYS) {
    const currentStatus = next.entries[key].status;
    if (currentStatus === nextStatus) {
      continue;
    }
    if (!validateLifecycleTransition(currentStatus, nextStatus)) {
      throw new Error(`Invalid lifecycle transition for ${key}: ${currentStatus} -> ${nextStatus}`);
    }
    next = applyLifecycleTransition(next, key, nextStatus);
  }
  return next;
}

export function createRuntimeLifecycle(
  registryContext: WorkspaceRuntimeRegistryContext,
): RuntimeLifecycleSnapshot {
  const entries = buildLifecycleEntries("idle");
  return {
    workspaceId: registryContext.workspaceId,
    version: RUNTIME_LIFECYCLE_VERSION,
    status: "idle",
    entries,
  };
}

export function transitionRuntimeStatus(
  lifecycle: RuntimeLifecycleSnapshot,
  key: RuntimeRegistryKey,
  nextStatus: RuntimeLifecycleStatus,
): RuntimeLifecycleSnapshot {
  return applyLifecycleTransition(lifecycle, key, nextStatus);
}

export function mountRuntime(lifecycle: RuntimeLifecycleSnapshot): RuntimeLifecycleSnapshot {
  const aggregate = lifecycle.status;
  if (aggregate === "idle") {
    return applyLifecycleTransitionAll(lifecycle, "ready");
  }
  if (aggregate === "ready") {
    return applyLifecycleTransitionAll(lifecycle, "mounted");
  }
  if (aggregate === "mounted") {
    return lifecycle;
  }
  throw new Error(`Cannot mount runtime from lifecycle status=${aggregate}`);
}

export function refreshRuntime(lifecycle: RuntimeLifecycleSnapshot): RuntimeLifecycleSnapshot {
  if (lifecycle.status !== "mounted") {
    throw new Error(`Cannot refresh runtime from lifecycle status=${lifecycle.status}`);
  }
  const refreshing = applyLifecycleTransitionAll(lifecycle, "refreshing");
  return applyLifecycleTransitionAll(refreshing, "mounted");
}

export function unmountRuntime(lifecycle: RuntimeLifecycleSnapshot): RuntimeLifecycleSnapshot {
  if (lifecycle.status !== "mounted") {
    throw new Error(`Cannot unmount runtime from lifecycle status=${lifecycle.status}`);
  }
  return applyLifecycleTransitionAll(lifecycle, "unmounted");
}

export function validateRuntimeLifecycle(lifecycle: RuntimeLifecycleSnapshot): boolean {
  return validateRuntimeLifecycleSnapshot(lifecycle);
}

export function describeRuntimeLifecycle(lifecycle: RuntimeLifecycleSnapshot): string {
  return [
    `workspaceId=${lifecycle.workspaceId}`,
    `status=${lifecycle.status}`,
    `version=${lifecycle.version}`,
  ].join(" ");
}

export function getAllowedLifecycleTransitions(status: RuntimeLifecycleStatus): RuntimeLifecycleStatus[] {
  return [...RUNTIME_LIFECYCLE_TRANSITIONS[status]];
}

export function assertRuntimeLifecycleMounted(lifecycle: RuntimeLifecycleSnapshot): boolean {
  return lifecycle.status === "mounted" && validateRuntimeLifecycleSnapshot(lifecycle);
}

export { validateLifecycleTransition };
