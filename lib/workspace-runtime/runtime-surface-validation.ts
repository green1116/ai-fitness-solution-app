import type { RuntimeCapabilityStatus } from "./runtime-capability-types";
import type { EntryStatus } from "./runtime-entry-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type { RuntimeVerificationStatus } from "./runtime-verification-types";
import type {
  RuntimeMappedSurface,
  SurfaceSnapshot,
  SurfaceStatus,
} from "./runtime-surface-types";
import { SURFACE_STATUSES, listRuntimeSurfaceKeys } from "./runtime-surface-types";

export function isSurfaceStatus(value: unknown): value is SurfaceStatus {
  return typeof value === "string" && SURFACE_STATUSES.includes(value as SurfaceStatus);
}

export function resolveSurfaceEligibility(lifecycleStatus: RuntimeLifecycleStatus): boolean {
  return lifecycleStatus === "mounted" || lifecycleStatus === "refreshing";
}

export function resolveSurfaceStatus(
  lifecycleStatus: RuntimeLifecycleStatus,
  entryStatus: EntryStatus,
  capabilityAvailable: boolean,
  capabilityStatus: RuntimeCapabilityStatus,
  verificationAggregateStatus: RuntimeVerificationStatus,
): SurfaceStatus {
  const eligible = resolveSurfaceEligibility(lifecycleStatus);
  if (!eligible) {
    return "inactive";
  }
  if (verificationAggregateStatus === "failed") {
    return "hidden";
  }
  if (verificationAggregateStatus === "skipped") {
    return "inactive";
  }
  if (capabilityStatus === "deprecated" || entryStatus === "hidden") {
    return "hidden";
  }
  if (!capabilityAvailable || capabilityStatus === "disabled" || entryStatus === "inactive") {
    return "inactive";
  }
  if (
    verificationAggregateStatus === "warning" ||
    capabilityStatus === "experimental" ||
    entryStatus === "reserved"
  ) {
    return "reserved";
  }
  if (
    verificationAggregateStatus === "passed" &&
    capabilityStatus === "enabled" &&
    entryStatus === "active"
  ) {
    return "active";
  }
  if (verificationAggregateStatus === "passed" && capabilityStatus === "enabled") {
    return "visible";
  }
  return "inactive";
}

export function resolveSurfaceVisible(status: SurfaceStatus): boolean {
  return status === "visible" || status === "active";
}

export function resolveSurfaceActive(status: SurfaceStatus): boolean {
  return status === "active";
}

export function resolveAggregateSurfaceStatus(entries: SurfaceSnapshot["entries"]): SurfaceStatus {
  const statuses = listRuntimeSurfaceKeys().map((key) => entries[key].status);
  if (statuses.some((status) => status === "active")) {
    return "active";
  }
  if (statuses.some((status) => status === "visible")) {
    return "visible";
  }
  if (statuses.some((status) => status === "reserved")) {
    return "reserved";
  }
  if (statuses.some((status) => status === "hidden")) {
    return "hidden";
  }
  return "inactive";
}

export function validateRuntimeMappedSurface(value: unknown): value is RuntimeMappedSurface {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeMappedSurface>;
  if (!isSurfaceStatus(candidate.status)) {
    return false;
  }
  if (typeof candidate.eligible !== "boolean") {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (candidate.layer !== "runtime-foundation") {
    return false;
  }
  if (candidate.key !== candidate.surface || candidate.key !== candidate.type) {
    return false;
  }
  return RUNTIME_REGISTRY_KEYS.includes(candidate.key as RuntimeRegistryKey);
}

export function validateSurfaceSnapshot(value: unknown): value is SurfaceSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<SurfaceSnapshot>;
  if (typeof candidate.workspaceId !== "string" || candidate.workspaceId.trim().length === 0) {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (typeof candidate.eligible !== "boolean") {
    return false;
  }
  if (typeof candidate.visible !== "boolean") {
    return false;
  }
  if (typeof candidate.active !== "boolean") {
    return false;
  }
  if (!isSurfaceStatus(candidate.aggregateStatus)) {
    return false;
  }
  if (typeof candidate.lifecycleStatus !== "string") {
    return false;
  }
  if (typeof candidate.verificationStatus !== "string") {
    return false;
  }
  if (typeof candidate.entryStatus !== "string") {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== "object") {
    return false;
  }
  return listRuntimeSurfaceKeys().every((key) => validateRuntimeMappedSurface(candidate.entries?.[key]));
}

export function assertRuntimeSurfaceHasAllStatuses(): boolean {
  return (
    isSurfaceStatus("visible") &&
    isSurfaceStatus("hidden") &&
    isSurfaceStatus("active") &&
    isSurfaceStatus("inactive") &&
    isSurfaceStatus("reserved")
  );
}

export function assertRuntimeSurfaceLifecycleRules(): boolean {
  return (
    resolveSurfaceEligibility("mounted") === true &&
    resolveSurfaceEligibility("refreshing") === true &&
    resolveSurfaceEligibility("unmounted") === false &&
    resolveSurfaceEligibility("idle") === false &&
    resolveSurfaceStatus("unmounted", "active", true, "enabled", "passed") === "inactive"
  );
}

export function assertRuntimeSurfaceEntryRules(): boolean {
  return (
    resolveSurfaceStatus("mounted", "inactive", true, "enabled", "passed") === "inactive" &&
    resolveSurfaceStatus("mounted", "hidden", true, "enabled", "passed") === "hidden" &&
    resolveSurfaceStatus("mounted", "reserved", true, "enabled", "passed") === "reserved" &&
    resolveSurfaceStatus("mounted", "active", true, "enabled", "passed") === "active"
  );
}

export function assertRuntimeSurfaceCapabilityRules(): boolean {
  return (
    resolveSurfaceStatus("mounted", "active", false, "enabled", "passed") === "inactive" &&
    resolveSurfaceStatus("mounted", "active", true, "experimental", "passed") === "reserved" &&
    resolveSurfaceStatus("mounted", "active", true, "deprecated", "passed") === "hidden" &&
    resolveSurfaceStatus("mounted", "active", true, "disabled", "passed") === "inactive"
  );
}

export function assertRuntimeSurfaceVerificationRules(): boolean {
  return (
    resolveSurfaceStatus("mounted", "active", true, "enabled", "failed") === "hidden" &&
    resolveSurfaceStatus("mounted", "active", true, "enabled", "skipped") === "inactive" &&
    resolveSurfaceStatus("mounted", "active", true, "enabled", "warning") === "reserved" &&
    resolveSurfaceStatus("mounted", "active", true, "enabled", "passed") === "active"
  );
}

export function assertRuntimeSurfaceFoundationOnly(): boolean {
  return (
    assertRuntimeSurfaceHasAllStatuses() &&
    assertRuntimeSurfaceLifecycleRules() &&
    assertRuntimeSurfaceEntryRules() &&
    assertRuntimeSurfaceCapabilityRules() &&
    assertRuntimeSurfaceVerificationRules()
  );
}
