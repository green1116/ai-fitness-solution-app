import type { WorkspaceRuntimeLifecycleContext } from "./runtime-lifecycle-types";
import type { RuntimeRegistryKey } from "./runtime-registry-types";
import { RUNTIME_REGISTRY_KEYS } from "./runtime-registry-types";
import type {
  ProjectCapability,
  QuoteCapability,
  ReportCapability,
  RuntimeCapabilityEntries,
  RuntimeCapabilitySnapshot,
  RuntimeCapabilityStatus,
  RuntimeSurfaceCapability,
  WorkspaceCapability,
} from "./runtime-capability-types";
import {
  resolveCapabilityAvailability,
  validateRuntimeCapabilitySnapshot,
  validateRuntimeSurfaceCapability,
} from "./runtime-capability-validation";
import { RUNTIME_CAPABILITY_VERSION } from "./shared/runtime-constants";

function createSurfaceCapability<T extends RuntimeSurfaceCapability>(
  key: T["key"],
  status: RuntimeCapabilityStatus,
  lifecycleStatus: WorkspaceRuntimeLifecycleContext["lifecycle"]["status"],
): T {
  const capability = {
    key,
    surface: key,
    status,
    available: resolveCapabilityAvailability(lifecycleStatus, status),
    version: RUNTIME_CAPABILITY_VERSION,
    layer: "runtime-foundation",
  } as T;
  return capability;
}

function buildDefaultCapabilityStatus(
  lifecycleStatus: WorkspaceRuntimeLifecycleContext["lifecycle"]["status"],
): RuntimeCapabilityStatus {
  if (lifecycleStatus === "mounted" || lifecycleStatus === "refreshing") {
    return "enabled";
  }
  return "disabled";
}

function buildCapabilityEntries(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): RuntimeCapabilityEntries {
  const lifecycleStatus = lifecycleContext.lifecycle.status;
  const defaultStatus = buildDefaultCapabilityStatus(lifecycleStatus);

  return {
    workspace: createSurfaceCapability<WorkspaceCapability>("workspace", defaultStatus, lifecycleStatus),
    quote: createSurfaceCapability<QuoteCapability>("quote", defaultStatus, lifecycleStatus),
    project: createSurfaceCapability<ProjectCapability>("project", defaultStatus, lifecycleStatus),
    report: createSurfaceCapability<ReportCapability>("report", defaultStatus, lifecycleStatus),
  };
}

function resolveAggregateCapabilityAvailability(entries: RuntimeCapabilityEntries): boolean {
  return RUNTIME_REGISTRY_KEYS.some((key) => entries[key].available);
}

export function createFoundationCapabilitySnapshot(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
): RuntimeCapabilitySnapshot {
  const entries = buildCapabilityEntries(lifecycleContext);
  return {
    workspaceId: lifecycleContext.workspaceId,
    version: RUNTIME_CAPABILITY_VERSION,
    lifecycleStatus: lifecycleContext.lifecycle.status,
    available: resolveAggregateCapabilityAvailability(entries),
    entries,
  };
}

export function registerCapability(
  snapshot: RuntimeCapabilitySnapshot,
  key: RuntimeRegistryKey,
  capability: RuntimeSurfaceCapability,
): RuntimeCapabilitySnapshot {
  if (capability.key !== key || capability.surface !== key) {
    throw new Error(`Capability key mismatch for ${key}`);
  }
  if (!validateRuntimeSurfaceCapability(capability)) {
    throw new Error(`Invalid capability entry for ${key}`);
  }

  const lifecycleStatus = snapshot.lifecycleStatus;
  const normalized = {
    ...capability,
    key,
    surface: key,
    available: resolveCapabilityAvailability(lifecycleStatus, capability.status),
    version: RUNTIME_CAPABILITY_VERSION,
    layer: "runtime-foundation",
  } as RuntimeCapabilityEntries[typeof key];

  const entries: RuntimeCapabilityEntries = {
    ...snapshot.entries,
    [key]: normalized,
  };

  return {
    ...snapshot,
    entries,
    available: resolveAggregateCapabilityAvailability(entries),
  };
}

export function resolveCapability(
  snapshot: RuntimeCapabilitySnapshot,
  key: RuntimeRegistryKey,
): RuntimeSurfaceCapability | undefined {
  return snapshot.entries[key];
}

export function resolveWorkspaceCapability(snapshot: RuntimeCapabilitySnapshot): WorkspaceCapability | undefined {
  return snapshot.entries.workspace;
}

export function resolveQuoteCapability(snapshot: RuntimeCapabilitySnapshot): QuoteCapability | undefined {
  return snapshot.entries.quote;
}

export function resolveProjectCapability(snapshot: RuntimeCapabilitySnapshot): ProjectCapability | undefined {
  return snapshot.entries.project;
}

export function resolveReportCapability(snapshot: RuntimeCapabilitySnapshot): ReportCapability | undefined {
  return snapshot.entries.report;
}

export function listCapabilities(snapshot: RuntimeCapabilitySnapshot): RuntimeSurfaceCapability[] {
  return RUNTIME_REGISTRY_KEYS.map((key) => snapshot.entries[key]);
}

export function hasCapability(snapshot: RuntimeCapabilitySnapshot, key: RuntimeRegistryKey): boolean {
  const capability = snapshot.entries[key];
  return Boolean(capability && validateRuntimeSurfaceCapability(capability));
}

export function validateCapability(snapshot: RuntimeCapabilitySnapshot): boolean {
  if (!validateRuntimeCapabilitySnapshot(snapshot)) {
    return false;
  }
  return RUNTIME_REGISTRY_KEYS.every((key) => {
    const capability = snapshot.entries[key];
    return (
      capability.available === resolveCapabilityAvailability(snapshot.lifecycleStatus, capability.status) &&
      capability.key === key
    );
  });
}

export function describeRuntimeCapability(snapshot: RuntimeCapabilitySnapshot): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `lifecycleStatus=${snapshot.lifecycleStatus}`,
    `available=${snapshot.available}`,
    `version=${snapshot.version}`,
  ].join(" ");
}

export function assertRuntimeCapabilityHasAllSurfaces(snapshot: RuntimeCapabilitySnapshot): boolean {
  return (
    hasCapability(snapshot, "workspace") &&
    hasCapability(snapshot, "quote") &&
    hasCapability(snapshot, "project") &&
    hasCapability(snapshot, "report")
  );
}

export function syncCapabilityWithLifecycle(
  lifecycleContext: WorkspaceRuntimeLifecycleContext,
  snapshot: RuntimeCapabilitySnapshot,
): RuntimeCapabilitySnapshot {
  return createFoundationCapabilitySnapshot({
    ...lifecycleContext,
    lifecycle: lifecycleContext.lifecycle,
  });
}
