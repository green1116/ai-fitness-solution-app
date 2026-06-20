import type { RuntimeRegistryKey } from "./runtime-registry-types";
import {
  RUNTIME_LIFECYCLE_STATUSES,
  RUNTIME_LIFECYCLE_TRANSITIONS,
  type RuntimeLifecycleEntry,
  type RuntimeLifecycleSnapshot,
  type RuntimeLifecycleStatus,
} from "./runtime-lifecycle-types";

export function isRuntimeLifecycleStatus(value: unknown): value is RuntimeLifecycleStatus {
  return typeof value === "string" && RUNTIME_LIFECYCLE_STATUSES.includes(value as RuntimeLifecycleStatus);
}

export function validateLifecycleTransition(
  from: RuntimeLifecycleStatus,
  to: RuntimeLifecycleStatus,
): boolean {
  if (!isRuntimeLifecycleStatus(from) || !isRuntimeLifecycleStatus(to)) {
    return false;
  }
  return RUNTIME_LIFECYCLE_TRANSITIONS[from].includes(to);
}

export function validateRuntimeLifecycleEntry(value: unknown): value is RuntimeLifecycleEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeLifecycleEntry>;
  return (
    typeof candidate.key === "string" &&
    isRuntimeLifecycleStatus(candidate.status) &&
    typeof candidate.version === "string" &&
    candidate.version.trim().length > 0
  );
}

export function validateRuntimeLifecycleSnapshot(value: unknown): value is RuntimeLifecycleSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeLifecycleSnapshot>;
  if (typeof candidate.workspaceId !== "string" || candidate.workspaceId.trim().length === 0) {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (!isRuntimeLifecycleStatus(candidate.status)) {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== "object") {
    return false;
  }
  const keys: RuntimeRegistryKey[] = ["workspace", "quote", "project", "report"];
  return keys.every((key) => validateRuntimeLifecycleEntry(candidate.entries?.[key]));
}

export function assertRuntimeLifecycleHasAllStatuses(): boolean {
  return (
    isRuntimeLifecycleStatus("idle") &&
    isRuntimeLifecycleStatus("ready") &&
    isRuntimeLifecycleStatus("mounted") &&
    isRuntimeLifecycleStatus("refreshing") &&
    isRuntimeLifecycleStatus("unmounted")
  );
}

export function assertRuntimeLifecycleTransitionRules(): boolean {
  return (
    validateLifecycleTransition("idle", "ready") &&
    validateLifecycleTransition("ready", "mounted") &&
    validateLifecycleTransition("mounted", "refreshing") &&
    validateLifecycleTransition("refreshing", "mounted") &&
    validateLifecycleTransition("mounted", "unmounted") &&
    !validateLifecycleTransition("idle", "mounted") &&
    !validateLifecycleTransition("unmounted", "ready") &&
    !validateLifecycleTransition("refreshing", "idle")
  );
}

export function assertRuntimeLifecycleFoundationOnly(): boolean {
  return assertRuntimeLifecycleHasAllStatuses() && assertRuntimeLifecycleTransitionRules();
}
