import type { WorkspaceRuntimeSurfaceContext } from "./runtime-surface-types";
import type {
  AssemblyKey,
  AssemblyResult,
  AssemblySnapshot,
  ProjectRuntimeAssembly,
  QuoteRuntimeAssembly,
  ReportRuntimeAssembly,
  RuntimeAssemblyEntries,
  RuntimeMappedAssembly,
  WorkspaceRuntimeAssembly,
} from "./runtime-workspace-assembly-types";
import { listRuntimeAssemblyKeys } from "./runtime-workspace-assembly-types";
import {
  resolveAggregateAssemblyStatus,
  resolveAssemblyAssembled,
  resolveAssemblyEligibility,
  resolveAssemblyStatus,
  validateAssemblySnapshot,
  validateRuntimeMappedAssembly,
} from "./runtime-workspace-assembly-validation";
import { RUNTIME_ASSEMBLY_VERSION } from "./shared/runtime-constants";

function createMappedAssembly<T extends RuntimeMappedAssembly>(
  key: T["key"],
  surfaceContext: WorkspaceRuntimeSurfaceContext,
): T {
  const lifecycleStatus = surfaceContext.surface.lifecycleStatus;
  const verificationStatus = surfaceContext.surface.verificationStatus;
  const entryRecord = surfaceContext.entryContext.entry.entries[key];
  const surfaceRecord = surfaceContext.surface.entries[key];
  const capability =
    surfaceContext.entryContext.verificationContext.capabilityContext.capability.entries[key];
  const eligible = resolveAssemblyEligibility(lifecycleStatus);
  const status = resolveAssemblyStatus(
    lifecycleStatus,
    surfaceRecord.status,
    entryRecord.status,
    capability.available,
    capability.status,
    verificationStatus,
  );

  const assembly = {
    key,
    type: key,
    surface: key,
    status,
    eligible,
    version: RUNTIME_ASSEMBLY_VERSION,
    layer: "runtime-foundation",
  } as T;
  return assembly;
}

function buildAssemblyEntries(surfaceContext: WorkspaceRuntimeSurfaceContext): RuntimeAssemblyEntries {
  return {
    workspace: createMappedAssembly<WorkspaceRuntimeAssembly>("workspace", surfaceContext),
    quote: createMappedAssembly<QuoteRuntimeAssembly>("quote", surfaceContext),
    project: createMappedAssembly<ProjectRuntimeAssembly>("project", surfaceContext),
    report: createMappedAssembly<ReportRuntimeAssembly>("report", surfaceContext),
  };
}

function resolveAggregateAssemblyAssembled(entries: RuntimeAssemblyEntries): boolean {
  return listRuntimeAssemblyKeys().some((key) => resolveAssemblyAssembled(entries[key].status));
}

export function createAssemblySnapshot(surfaceContext: WorkspaceRuntimeSurfaceContext): AssemblySnapshot {
  const lifecycleStatus = surfaceContext.surface.lifecycleStatus;
  const verificationStatus = surfaceContext.surface.verificationStatus;
  const eligible = resolveAssemblyEligibility(lifecycleStatus);
  const entries = buildAssemblyEntries(surfaceContext);

  return {
    workspaceId: surfaceContext.workspaceId,
    version: RUNTIME_ASSEMBLY_VERSION,
    lifecycleStatus,
    verificationStatus,
    entryStatus: surfaceContext.surface.entryStatus,
    surfaceStatus: surfaceContext.surface.aggregateStatus,
    eligible,
    assembled: resolveAggregateAssemblyAssembled(entries),
    aggregateStatus: resolveAggregateAssemblyStatus(entries),
    entries,
  };
}

export function registerAssembly(
  snapshot: AssemblySnapshot,
  key: AssemblyKey,
  assembly: RuntimeMappedAssembly,
): AssemblySnapshot {
  if (assembly.key !== key || assembly.surface !== key || assembly.type !== key) {
    throw new Error(`Assembly key mismatch for ${key}`);
  }
  if (!validateRuntimeMappedAssembly(assembly)) {
    throw new Error(`Invalid assembly for ${key}`);
  }

  const normalized = {
    ...assembly,
    key,
    type: key,
    surface: key,
    eligible: resolveAssemblyEligibility(snapshot.lifecycleStatus),
    version: RUNTIME_ASSEMBLY_VERSION,
    layer: "runtime-foundation",
  } as RuntimeAssemblyEntries[typeof key];

  const entries: RuntimeAssemblyEntries = {
    ...snapshot.entries,
    [key]: normalized,
  };

  return {
    ...snapshot,
    entries,
    eligible: resolveAssemblyEligibility(snapshot.lifecycleStatus),
    assembled: resolveAggregateAssemblyAssembled(entries),
    aggregateStatus: resolveAggregateAssemblyStatus(entries),
  };
}

export function resolveAssembly(
  snapshot: AssemblySnapshot,
  key: AssemblyKey,
): RuntimeMappedAssembly | undefined {
  return snapshot.entries[key];
}

export function resolveWorkspaceAssembly(snapshot: AssemblySnapshot): WorkspaceRuntimeAssembly | undefined {
  return snapshot.entries.workspace;
}

export function resolveQuoteAssembly(snapshot: AssemblySnapshot): QuoteRuntimeAssembly | undefined {
  return snapshot.entries.quote;
}

export function resolveProjectAssembly(snapshot: AssemblySnapshot): ProjectRuntimeAssembly | undefined {
  return snapshot.entries.project;
}

export function resolveReportAssembly(snapshot: AssemblySnapshot): ReportRuntimeAssembly | undefined {
  return snapshot.entries.report;
}

export function listAssemblies(snapshot: AssemblySnapshot): RuntimeMappedAssembly[] {
  return listRuntimeAssemblyKeys().map((key) => snapshot.entries[key]);
}

export function hasAssembly(snapshot: AssemblySnapshot, key: AssemblyKey): boolean {
  const assembly = snapshot.entries[key];
  return Boolean(assembly && validateRuntimeMappedAssembly(assembly));
}

export function validateAssembly(snapshot: AssemblySnapshot): boolean {
  if (!validateAssemblySnapshot(snapshot)) {
    return false;
  }

  const expectedEligible = resolveAssemblyEligibility(snapshot.lifecycleStatus);
  if (snapshot.eligible !== expectedEligible) {
    return false;
  }

  if (snapshot.assembled !== resolveAggregateAssemblyAssembled(snapshot.entries)) {
    return false;
  }

  if (snapshot.aggregateStatus !== resolveAggregateAssemblyStatus(snapshot.entries)) {
    return false;
  }

  return listRuntimeAssemblyKeys().every((key) => {
    const assembly = snapshot.entries[key];
    if (assembly.key !== key || assembly.type !== key || assembly.surface !== key) {
      return false;
    }
    if (assembly.eligible !== expectedEligible) {
      return false;
    }
    if (!expectedEligible) {
      return assembly.status === "inactive";
    }
    return (
      assembly.status === "assembled" ||
      assembly.status === "partial" ||
      assembly.status === "degraded" ||
      assembly.status === "inactive" ||
      assembly.status === "reserved"
    );
  });
}

export function resolveAssemblyResult(snapshot: AssemblySnapshot, key: AssemblyKey): AssemblyResult {
  const assembly = snapshot.entries[key];
  return {
    key,
    type: assembly.type,
    status: assembly.status,
    eligible: assembly.eligible,
    assembled: resolveAssemblyAssembled(assembly.status),
  };
}

export function listAssemblyResults(snapshot: AssemblySnapshot): AssemblyResult[] {
  return listRuntimeAssemblyKeys().map((key) => resolveAssemblyResult(snapshot, key));
}

export function describeRuntimeAssembly(snapshot: AssemblySnapshot): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `lifecycleStatus=${snapshot.lifecycleStatus}`,
    `verificationStatus=${snapshot.verificationStatus}`,
    `entryStatus=${snapshot.entryStatus}`,
    `surfaceStatus=${snapshot.surfaceStatus}`,
    `eligible=${snapshot.eligible}`,
    `assembled=${snapshot.assembled}`,
    `aggregateStatus=${snapshot.aggregateStatus}`,
    `version=${snapshot.version}`,
  ].join(" ");
}

export function syncAssemblyWithSurfaceContext(
  surfaceContext: WorkspaceRuntimeSurfaceContext,
  _snapshot: AssemblySnapshot,
): AssemblySnapshot {
  return createAssemblySnapshot(surfaceContext);
}

export function assertRuntimeAssemblyHasAllMappings(snapshot: AssemblySnapshot): boolean {
  return (
    hasAssembly(snapshot, "workspace") &&
    hasAssembly(snapshot, "quote") &&
    hasAssembly(snapshot, "project") &&
    hasAssembly(snapshot, "report")
  );
}
