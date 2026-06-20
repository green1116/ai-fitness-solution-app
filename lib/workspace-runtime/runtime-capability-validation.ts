import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import {
  RUNTIME_CAPABILITY_STATUSES,
  type RuntimeCapabilitySnapshot,
  type RuntimeCapabilityStatus,
  type RuntimeSurfaceCapability,
} from "./runtime-capability-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";

export function isRuntimeCapabilityStatus(value: unknown): value is RuntimeCapabilityStatus {
  return typeof value === "string" && RUNTIME_CAPABILITY_STATUSES.includes(value as RuntimeCapabilityStatus);
}

export function resolveCapabilityAvailability(
  lifecycleStatus: RuntimeLifecycleStatus,
  capabilityStatus: RuntimeCapabilityStatus,
): boolean {
  if (lifecycleStatus === "unmounted" || lifecycleStatus === "idle" || lifecycleStatus === "ready") {
    return false;
  }
  if (lifecycleStatus === "mounted" || lifecycleStatus === "refreshing") {
    return capabilityStatus === "enabled" || capabilityStatus === "experimental";
  }
  return false;
}

export function validateRuntimeSurfaceCapability(value: unknown): value is RuntimeSurfaceCapability {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeSurfaceCapability>;
  if (!isRuntimeCapabilityStatus(candidate.status)) {
    return false;
  }
  if (typeof candidate.available !== "boolean") {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (candidate.layer !== "runtime-foundation") {
    return false;
  }
  if (candidate.key !== candidate.surface) {
    return false;
  }
  return RUNTIME_REGISTRY_KEYS.includes(candidate.key as RuntimeRegistryKey);
}

export function validateRuntimeCapabilitySnapshot(value: unknown): value is RuntimeCapabilitySnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeCapabilitySnapshot>;
  if (typeof candidate.workspaceId !== "string" || candidate.workspaceId.trim().length === 0) {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (typeof candidate.available !== "boolean") {
    return false;
  }
  if (typeof candidate.lifecycleStatus !== "string") {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== "object") {
    return false;
  }
  return RUNTIME_REGISTRY_KEYS.every((key) => validateRuntimeSurfaceCapability(candidate.entries?.[key]));
}

export function assertRuntimeCapabilityHasAllStatuses(): boolean {
  return (
    isRuntimeCapabilityStatus("enabled") &&
    isRuntimeCapabilityStatus("disabled") &&
    isRuntimeCapabilityStatus("experimental") &&
    isRuntimeCapabilityStatus("deprecated")
  );
}

export function assertRuntimeCapabilityLifecycleRules(): boolean {
  return (
    resolveCapabilityAvailability("mounted", "enabled") === true &&
    resolveCapabilityAvailability("mounted", "experimental") === true &&
    resolveCapabilityAvailability("mounted", "disabled") === false &&
    resolveCapabilityAvailability("mounted", "deprecated") === false &&
    resolveCapabilityAvailability("unmounted", "enabled") === false &&
    resolveCapabilityAvailability("idle", "enabled") === false
  );
}

export function assertRuntimeCapabilityFoundationOnly(): boolean {
  return assertRuntimeCapabilityHasAllStatuses() && assertRuntimeCapabilityLifecycleRules();
}
