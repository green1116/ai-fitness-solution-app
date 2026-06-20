import type { RuntimeCapabilityStatus } from "./runtime-capability-types";
import type { EntryStatus } from "./runtime-entry-types";
import type { RuntimeLifecycleStatus } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type { SurfaceStatus } from "./runtime-surface-types";
import type { RuntimeVerificationStatus } from "./runtime-verification-types";
import type {
  AssemblySnapshot,
  AssemblyStatus,
  RuntimeMappedAssembly,
} from "./runtime-workspace-assembly-types";
import { ASSEMBLY_STATUSES, listRuntimeAssemblyKeys } from "./runtime-workspace-assembly-types";

export function isAssemblyStatus(value: unknown): value is AssemblyStatus {
  return typeof value === "string" && ASSEMBLY_STATUSES.includes(value as AssemblyStatus);
}

export function resolveAssemblyEligibility(lifecycleStatus: RuntimeLifecycleStatus): boolean {
  return lifecycleStatus === "mounted" || lifecycleStatus === "refreshing";
}

export function resolveAssemblyStatus(
  lifecycleStatus: RuntimeLifecycleStatus,
  surfaceStatus: SurfaceStatus,
  entryStatus: EntryStatus,
  capabilityAvailable: boolean,
  capabilityStatus: RuntimeCapabilityStatus,
  verificationAggregateStatus: RuntimeVerificationStatus,
): AssemblyStatus {
  const eligible = resolveAssemblyEligibility(lifecycleStatus);
  if (!eligible) {
    return "inactive";
  }
  if (verificationAggregateStatus === "failed" || verificationAggregateStatus === "skipped") {
    return "inactive";
  }
  if (capabilityStatus === "deprecated" || surfaceStatus === "hidden") {
    return "degraded";
  }
  if (
    surfaceStatus === "inactive" ||
    entryStatus === "inactive" ||
    !capabilityAvailable ||
    capabilityStatus === "disabled"
  ) {
    return "inactive";
  }
  if (
    verificationAggregateStatus === "warning" ||
    capabilityStatus === "experimental" ||
    surfaceStatus === "reserved" ||
    entryStatus === "reserved"
  ) {
    return "reserved";
  }
  if (
    surfaceStatus === "active" &&
    entryStatus === "active" &&
    verificationAggregateStatus === "passed" &&
    capabilityStatus === "enabled"
  ) {
    return "assembled";
  }
  if (surfaceStatus === "visible" && verificationAggregateStatus === "passed" && capabilityStatus === "enabled") {
    return "partial";
  }
  return "partial";
}

export function resolveAssemblyAssembled(status: AssemblyStatus): boolean {
  return status === "assembled";
}

export function resolveAggregateAssemblyStatus(entries: AssemblySnapshot["entries"]): AssemblyStatus {
  const statuses = listRuntimeAssemblyKeys().map((key) => entries[key].status);
  if (statuses.every((status) => status === "assembled")) {
    return "assembled";
  }
  if (statuses.some((status) => status === "assembled")) {
    return "partial";
  }
  if (statuses.some((status) => status === "degraded")) {
    return "degraded";
  }
  if (statuses.some((status) => status === "reserved")) {
    return "reserved";
  }
  if (statuses.every((status) => status === "inactive")) {
    return "inactive";
  }
  return "partial";
}

export function validateRuntimeMappedAssembly(value: unknown): value is RuntimeMappedAssembly {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<RuntimeMappedAssembly>;
  if (!isAssemblyStatus(candidate.status)) {
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

export function validateAssemblySnapshot(value: unknown): value is AssemblySnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<AssemblySnapshot>;
  if (typeof candidate.workspaceId !== "string" || candidate.workspaceId.trim().length === 0) {
    return false;
  }
  if (typeof candidate.version !== "string" || candidate.version.trim().length === 0) {
    return false;
  }
  if (typeof candidate.eligible !== "boolean") {
    return false;
  }
  if (typeof candidate.assembled !== "boolean") {
    return false;
  }
  if (!isAssemblyStatus(candidate.aggregateStatus)) {
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
  if (typeof candidate.surfaceStatus !== "string") {
    return false;
  }
  if (!candidate.entries || typeof candidate.entries !== "object") {
    return false;
  }
  return listRuntimeAssemblyKeys().every((key) => validateRuntimeMappedAssembly(candidate.entries?.[key]));
}

export function assertRuntimeAssemblyHasAllStatuses(): boolean {
  return (
    isAssemblyStatus("assembled") &&
    isAssemblyStatus("partial") &&
    isAssemblyStatus("degraded") &&
    isAssemblyStatus("inactive") &&
    isAssemblyStatus("reserved")
  );
}

export function assertRuntimeAssemblyLifecycleRules(): boolean {
  return (
    resolveAssemblyEligibility("mounted") === true &&
    resolveAssemblyEligibility("refreshing") === true &&
    resolveAssemblyEligibility("unmounted") === false &&
    resolveAssemblyEligibility("idle") === false &&
    resolveAssemblyStatus("unmounted", "active", "active", true, "enabled", "passed") === "inactive"
  );
}

export function assertRuntimeAssemblySurfaceRules(): boolean {
  return (
    resolveAssemblyStatus("mounted", "inactive", "active", true, "enabled", "passed") === "inactive" &&
    resolveAssemblyStatus("mounted", "hidden", "active", true, "enabled", "passed") === "degraded" &&
    resolveAssemblyStatus("mounted", "reserved", "active", true, "enabled", "passed") === "reserved" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "enabled", "passed") === "assembled"
  );
}

export function assertRuntimeAssemblyEntryRules(): boolean {
  return (
    resolveAssemblyStatus("mounted", "active", "inactive", true, "enabled", "passed") === "inactive" &&
    resolveAssemblyStatus("mounted", "active", "reserved", true, "enabled", "passed") === "reserved" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "enabled", "passed") === "assembled"
  );
}

export function assertRuntimeAssemblyCapabilityRules(): boolean {
  return (
    resolveAssemblyStatus("mounted", "active", "active", false, "enabled", "passed") === "inactive" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "experimental", "passed") === "reserved" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "deprecated", "passed") === "degraded" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "disabled", "passed") === "inactive"
  );
}

export function assertRuntimeAssemblyVerificationRules(): boolean {
  return (
    resolveAssemblyStatus("mounted", "active", "active", true, "enabled", "failed") === "inactive" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "enabled", "skipped") === "inactive" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "enabled", "warning") === "reserved" &&
    resolveAssemblyStatus("mounted", "active", "active", true, "enabled", "passed") === "assembled"
  );
}

export function assertRuntimeAssemblyFoundationOnly(): boolean {
  return (
    assertRuntimeAssemblyHasAllStatuses() &&
    assertRuntimeAssemblyLifecycleRules() &&
    assertRuntimeAssemblySurfaceRules() &&
    assertRuntimeAssemblyEntryRules() &&
    assertRuntimeAssemblyCapabilityRules() &&
    assertRuntimeAssemblyVerificationRules()
  );
}
