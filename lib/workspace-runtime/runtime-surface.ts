import type { WorkspaceRuntimeEntryContext } from "./runtime-entry-types";
import type {
  ProjectSurface,
  QuoteSurface,
  ReportSurface,
  RuntimeMappedSurface,
  RuntimeSurfaceEntries,
  SurfaceKey,
  SurfaceResult,
  SurfaceSnapshot,
  WorkspaceSurface,
} from "./runtime-surface-types";
import { listRuntimeSurfaceKeys } from "./runtime-surface-types";
import {
  resolveAggregateSurfaceStatus,
  resolveSurfaceActive,
  resolveSurfaceEligibility,
  resolveSurfaceStatus,
  resolveSurfaceVisible,
  validateRuntimeMappedSurface,
  validateSurfaceSnapshot,
} from "./runtime-surface-validation";
import { RUNTIME_SURFACE_VERSION } from "./shared/runtime-constants";

function createMappedSurface<T extends RuntimeMappedSurface>(
  key: T["key"],
  entryContext: WorkspaceRuntimeEntryContext,
): T {
  const lifecycleStatus = entryContext.entry.lifecycleStatus;
  const verificationStatus = entryContext.entry.verificationStatus;
  const entryRecord = entryContext.entry.entries[key];
  const capability =
    entryContext.verificationContext.capabilityContext.capability.entries[key];
  const eligible = resolveSurfaceEligibility(lifecycleStatus);
  const status = resolveSurfaceStatus(
    lifecycleStatus,
    entryRecord.status,
    capability.available,
    capability.status,
    verificationStatus,
  );

  const surface = {
    key,
    type: key,
    surface: key,
    status,
    eligible,
    version: RUNTIME_SURFACE_VERSION,
    layer: "runtime-foundation",
  } as T;
  return surface;
}

function buildSurfaceEntries(entryContext: WorkspaceRuntimeEntryContext): RuntimeSurfaceEntries {
  return {
    workspace: createMappedSurface<WorkspaceSurface>("workspace", entryContext),
    quote: createMappedSurface<QuoteSurface>("quote", entryContext),
    project: createMappedSurface<ProjectSurface>("project", entryContext),
    report: createMappedSurface<ReportSurface>("report", entryContext),
  };
}

function resolveAggregateSurfaceVisible(entries: RuntimeSurfaceEntries): boolean {
  return listRuntimeSurfaceKeys().some((key) => resolveSurfaceVisible(entries[key].status));
}

function resolveAggregateSurfaceActive(entries: RuntimeSurfaceEntries): boolean {
  return listRuntimeSurfaceKeys().some((key) => resolveSurfaceActive(entries[key].status));
}

export function createSurfaceSnapshot(entryContext: WorkspaceRuntimeEntryContext): SurfaceSnapshot {
  const lifecycleStatus = entryContext.entry.lifecycleStatus;
  const verificationStatus = entryContext.entry.verificationStatus;
  const eligible = resolveSurfaceEligibility(lifecycleStatus);
  const entries = buildSurfaceEntries(entryContext);

  return {
    workspaceId: entryContext.workspaceId,
    version: RUNTIME_SURFACE_VERSION,
    lifecycleStatus,
    verificationStatus,
    entryStatus: entryContext.entry.aggregateStatus,
    eligible,
    visible: resolveAggregateSurfaceVisible(entries),
    active: resolveAggregateSurfaceActive(entries),
    aggregateStatus: resolveAggregateSurfaceStatus(entries),
    entries,
  };
}

export function registerSurface(
  snapshot: SurfaceSnapshot,
  key: SurfaceKey,
  surface: RuntimeMappedSurface,
): SurfaceSnapshot {
  if (surface.key !== key || surface.surface !== key || surface.type !== key) {
    throw new Error(`Surface key mismatch for ${key}`);
  }
  if (!validateRuntimeMappedSurface(surface)) {
    throw new Error(`Invalid surface for ${key}`);
  }

  const normalized = {
    ...surface,
    key,
    type: key,
    surface: key,
    eligible: resolveSurfaceEligibility(snapshot.lifecycleStatus),
    version: RUNTIME_SURFACE_VERSION,
    layer: "runtime-foundation",
  } as RuntimeSurfaceEntries[typeof key];

  const entries: RuntimeSurfaceEntries = {
    ...snapshot.entries,
    [key]: normalized,
  };

  return {
    ...snapshot,
    entries,
    eligible: resolveSurfaceEligibility(snapshot.lifecycleStatus),
    visible: resolveAggregateSurfaceVisible(entries),
    active: resolveAggregateSurfaceActive(entries),
    aggregateStatus: resolveAggregateSurfaceStatus(entries),
  };
}

export function resolveSurface(snapshot: SurfaceSnapshot, key: SurfaceKey): RuntimeMappedSurface | undefined {
  return snapshot.entries[key];
}

export function resolveWorkspaceSurface(snapshot: SurfaceSnapshot): WorkspaceSurface | undefined {
  return snapshot.entries.workspace;
}

export function resolveQuoteSurface(snapshot: SurfaceSnapshot): QuoteSurface | undefined {
  return snapshot.entries.quote;
}

export function resolveProjectSurface(snapshot: SurfaceSnapshot): ProjectSurface | undefined {
  return snapshot.entries.project;
}

export function resolveReportSurface(snapshot: SurfaceSnapshot): ReportSurface | undefined {
  return snapshot.entries.report;
}

export function listSurfaces(snapshot: SurfaceSnapshot): RuntimeMappedSurface[] {
  return listRuntimeSurfaceKeys().map((key) => snapshot.entries[key]);
}

export function hasSurface(snapshot: SurfaceSnapshot, key: SurfaceKey): boolean {
  const surface = snapshot.entries[key];
  return Boolean(surface && validateRuntimeMappedSurface(surface));
}

export function validateSurface(snapshot: SurfaceSnapshot): boolean {
  if (!validateSurfaceSnapshot(snapshot)) {
    return false;
  }

  const expectedEligible = resolveSurfaceEligibility(snapshot.lifecycleStatus);
  if (snapshot.eligible !== expectedEligible) {
    return false;
  }

  if (snapshot.visible !== resolveAggregateSurfaceVisible(snapshot.entries)) {
    return false;
  }

  if (snapshot.active !== resolveAggregateSurfaceActive(snapshot.entries)) {
    return false;
  }

  if (snapshot.aggregateStatus !== resolveAggregateSurfaceStatus(snapshot.entries)) {
    return false;
  }

  return listRuntimeSurfaceKeys().every((key) => {
    const surface = snapshot.entries[key];
    if (surface.key !== key || surface.type !== key || surface.surface !== key) {
      return false;
    }
    if (surface.eligible !== expectedEligible) {
      return false;
    }
    if (!expectedEligible) {
      return surface.status === "inactive";
    }
    return (
      surface.status === "visible" ||
      surface.status === "hidden" ||
      surface.status === "active" ||
      surface.status === "inactive" ||
      surface.status === "reserved"
    );
  });
}

export function resolveSurfaceResult(snapshot: SurfaceSnapshot, key: SurfaceKey): SurfaceResult {
  const surface = snapshot.entries[key];
  return {
    key,
    type: surface.type,
    status: surface.status,
    eligible: surface.eligible,
    visible: resolveSurfaceVisible(surface.status),
    active: resolveSurfaceActive(surface.status),
  };
}

export function listSurfaceResults(snapshot: SurfaceSnapshot): SurfaceResult[] {
  return listRuntimeSurfaceKeys().map((key) => resolveSurfaceResult(snapshot, key));
}

export function describeRuntimeSurface(snapshot: SurfaceSnapshot): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `lifecycleStatus=${snapshot.lifecycleStatus}`,
    `verificationStatus=${snapshot.verificationStatus}`,
    `entryStatus=${snapshot.entryStatus}`,
    `eligible=${snapshot.eligible}`,
    `visible=${snapshot.visible}`,
    `active=${snapshot.active}`,
    `aggregateStatus=${snapshot.aggregateStatus}`,
    `version=${snapshot.version}`,
  ].join(" ");
}

export function syncSurfaceWithEntryContext(
  entryContext: WorkspaceRuntimeEntryContext,
  _snapshot: SurfaceSnapshot,
): SurfaceSnapshot {
  return createSurfaceSnapshot(entryContext);
}

export function assertRuntimeSurfaceHasAllMappings(snapshot: SurfaceSnapshot): boolean {
  return (
    hasSurface(snapshot, "workspace") &&
    hasSurface(snapshot, "quote") &&
    hasSurface(snapshot, "project") &&
    hasSurface(snapshot, "report")
  );
}
