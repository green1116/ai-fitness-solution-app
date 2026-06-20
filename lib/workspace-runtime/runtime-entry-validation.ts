import type { RuntimeCapabilityStatus } from "./runtime-capability-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type { RuntimeVerificationStatus } from "./runtime-verification-types";
import type {
  EntrySnapshot,
  EntryStatus,
  RuntimeSurfaceEntry,
} from "./runtime-entry-types";
import { ENTRY_STATUSES, listRuntimeEntryKeys } from "./runtime-entry-types";

export function isEntryStatus(value: unknown): value is EntryStatus {
  return typeof value === "string" && ENTRY_STATUSES.includes(value as EntryStatus);
}

export function resolveEntryEligibility(lifecycleStatus: RuntimeLifecycleStatus): boolean {
  return lifecycleStatus === "mounted" || lifecycleStatus === "refreshing";
}

export function resolveEntryStatus(
  lifecycleStatus: RuntimeLifecycleStatus,
  capabilityAvailable: boolean,
  capabilityStatus: RuntimeCapabilityStatus,
  verificationAggregateStatus: RuntimeVerificationStatus,
): EntryStatus {
  const eligible = resolveEntryEligibility(lifecycleStatus);
  if (!eligible) {
    return "inactive";
  }
  if (verificationAggregateStatus === "failed" || verificationAggregateStatus === "skipped") {
    return "inactive";
  }
  if (capabilityStatus === "deprecated") {
    return "hidden";
  }
  if (!capabilityAvailable || capabilityStatus === "disabled") {
    return "inactive";
  }
  if (verificationAggregateStatus === "warning" || capabilityStatus === "experimental") {
    return "reserved";
  }
  if (verificationAggregateStatus === "passed" && capabilityStatus === "enabled") {
    return "active";
  }
  return "inactive";
}

export function resolveEntryActive(status: EntryStatus): boolean {
  return status === "active";
}

export function resolveAggregateEntryStatus(entries: EntrySnapshot["entries"]): EntryStatus {
  const statuses = listRuntimeEntryKeys().map((key) => entries[key].status);
  if (statuses.some((status) => status === "active")) {
    return "active";
  }
  if (statuses.some((status) => status === "reserved")) {
    return "reserved";
  }
  if (statuses.some((status) => status === "hidden")) {
    return "hidden";
  }
  return "inactive";
}

export function validateRuntimeSurfaceEntry(value: unknown): value is RuntimeSurfaceEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeSurfaceEntry>;
  if (!isEntryStatus(candidate.status)) {
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

export function validateEntrySnapshot(value: unknown): value is EntrySnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<EntrySnapshot>;
  if (typeof candidate.workspaceId !== "string" || candidate.workspaceId.trim().length === 0) {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (typeof candidate.eligible !== "boolean") {
    return false;
  }
  if (typeof candidate.active !== "boolean") {
    return false;
  }
  if (!isEntryStatus(candidate.aggregateStatus)) {
    return false;
  }
  if (typeof candidate.lifecycleStatus !== "string") {
    return false;
  }
  if (typeof candidate.verificationStatus !== "string") {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== "object") {
    return false;
  }
  return listRuntimeEntryKeys().every((key) => validateRuntimeSurfaceEntry(candidate.entries?.[key]));
}

export function assertRuntimeEntryHasAllStatuses(): boolean {
  return (
    isEntryStatus("active") &&
    isEntryStatus("inactive") &&
    isEntryStatus("hidden") &&
    isEntryStatus("reserved")
  );
}

export function assertRuntimeEntryLifecycleRules(): boolean {
  return (
    resolveEntryEligibility("mounted") === true &&
    resolveEntryEligibility("refreshing") === true &&
    resolveEntryEligibility("unmounted") === false &&
    resolveEntryEligibility("idle") === false &&
    resolveEntryStatus("unmounted", true, "enabled", "passed") === "inactive" &&
    resolveEntryStatus("mounted", true, "enabled", "passed") === "active" &&
    resolveEntryStatus("mounted", true, "enabled", "failed") === "inactive"
  );
}

export function assertRuntimeEntryCapabilityRules(): boolean {
  return (
    resolveEntryStatus("mounted", false, "enabled", "passed") === "inactive" &&
    resolveEntryStatus("mounted", true, "experimental", "passed") === "reserved" &&
    resolveEntryStatus("mounted", true, "deprecated", "passed") === "hidden" &&
    resolveEntryStatus("mounted", true, "disabled", "passed") === "inactive"
  );
}

export function assertRuntimeEntryVerificationRules(): boolean {
  return (
    resolveEntryStatus("mounted", true, "enabled", "failed") === "inactive" &&
    resolveEntryStatus("mounted", true, "enabled", "skipped") === "inactive" &&
    resolveEntryStatus("mounted", true, "enabled", "warning") === "reserved" &&
    resolveEntryStatus("mounted", true, "enabled", "passed") === "active"
  );
}

export function assertRuntimeEntryFoundationOnly(): boolean {
  return (
    assertRuntimeEntryHasAllStatuses() &&
    assertRuntimeEntryLifecycleRules() &&
    assertRuntimeEntryCapabilityRules() &&
    assertRuntimeEntryVerificationRules()
  );
}
