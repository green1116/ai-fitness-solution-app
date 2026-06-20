import type { WorkspaceRuntimeVerificationContext } from "./runtime-verification-types";
import type {
  EntryKey,
  EntryResult,
  EntrySnapshot,
  EntryStatus,
  ProjectEntry,
  QuoteEntry,
  ReportEntry,
  RuntimeEntryEntries,
  RuntimeSurfaceEntry,
  WorkspaceEntry,
} from "./runtime-entry-types";
import { listRuntimeEntryKeys } from "./runtime-entry-types";
import {
  resolveAggregateEntryStatus,
  resolveEntryActive,
  resolveEntryEligibility,
  resolveEntryStatus,
  validateEntrySnapshot,
  validateRuntimeSurfaceEntry,
} from "./runtime-entry-validation";
import { RUNTIME_ENTRY_VERSION } from "./shared/runtime-constants";

function createSurfaceEntry<T extends RuntimeSurfaceEntry>(
  key: T["key"],
  verificationContext: WorkspaceRuntimeVerificationContext,
): T {
  const lifecycleStatus = verificationContext.verification.lifecycleStatus;
  const verificationStatus = verificationContext.verification.aggregateStatus;
  const capability = verificationContext.capabilityContext.capability.entries[key];
  const eligible = resolveEntryEligibility(lifecycleStatus);
  const status = resolveEntryStatus(
    lifecycleStatus,
    capability.available,
    capability.status,
    verificationStatus,
  );

  const entry = {
    key,
    type: key,
    surface: key,
    status,
    eligible,
    version: RUNTIME_ENTRY_VERSION,
    layer: "runtime-foundation",
  } as T;
  return entry;
}

function buildEntryEntries(verificationContext: WorkspaceRuntimeVerificationContext): RuntimeEntryEntries {
  return {
    workspace: createSurfaceEntry<WorkspaceEntry>("workspace", verificationContext),
    quote: createSurfaceEntry<QuoteEntry>("quote", verificationContext),
    project: createSurfaceEntry<ProjectEntry>("project", verificationContext),
    report: createSurfaceEntry<ReportEntry>("report", verificationContext),
  };
}

function resolveAggregateEntryActive(entries: RuntimeEntryEntries): boolean {
  return listRuntimeEntryKeys().some((key) => resolveEntryActive(entries[key].status));
}

export function createEntrySnapshot(verificationContext: WorkspaceRuntimeVerificationContext): EntrySnapshot {
  const lifecycleStatus = verificationContext.verification.lifecycleStatus;
  const verificationStatus = verificationContext.verification.aggregateStatus;
  const eligible = resolveEntryEligibility(lifecycleStatus);
  const entries = buildEntryEntries(verificationContext);

  return {
    workspaceId: verificationContext.workspaceId,
    version: RUNTIME_ENTRY_VERSION,
    lifecycleStatus,
    verificationStatus,
    eligible,
    active: resolveAggregateEntryActive(entries),
    aggregateStatus: resolveAggregateEntryStatus(entries),
    entries,
  };
}

export function registerEntry(
  snapshot: EntrySnapshot,
  key: EntryKey,
  entry: RuntimeSurfaceEntry,
): EntrySnapshot {
  if (entry.key !== key || entry.surface !== key || entry.type !== key) {
    throw new Error(`Entry key mismatch for ${key}`);
  }
  if (!validateRuntimeSurfaceEntry(entry)) {
    throw new Error(`Invalid entry for ${key}`);
  }

  const normalized = {
    ...entry,
    key,
    type: key,
    surface: key,
    eligible: resolveEntryEligibility(snapshot.lifecycleStatus),
    version: RUNTIME_ENTRY_VERSION,
    layer: "runtime-foundation",
  } as RuntimeEntryEntries[typeof key];

  const entries: RuntimeEntryEntries = {
    ...snapshot.entries,
    [key]: normalized,
  };

  return {
    ...snapshot,
    entries,
    eligible: resolveEntryEligibility(snapshot.lifecycleStatus),
    active: resolveAggregateEntryActive(entries),
    aggregateStatus: resolveAggregateEntryStatus(entries),
  };
}

export function resolveEntry(snapshot: EntrySnapshot, key: EntryKey): RuntimeSurfaceEntry | undefined {
  return snapshot.entries[key];
}

export function resolveWorkspaceEntry(snapshot: EntrySnapshot): WorkspaceEntry | undefined {
  return snapshot.entries.workspace;
}

export function resolveQuoteEntry(snapshot: EntrySnapshot): QuoteEntry | undefined {
  return snapshot.entries.quote;
}

export function resolveProjectEntry(snapshot: EntrySnapshot): ProjectEntry | undefined {
  return snapshot.entries.project;
}

export function resolveReportEntry(snapshot: EntrySnapshot): ReportEntry | undefined {
  return snapshot.entries.report;
}

export function listEntries(snapshot: EntrySnapshot): RuntimeSurfaceEntry[] {
  return listRuntimeEntryKeys().map((key) => snapshot.entries[key]);
}

export function hasEntry(snapshot: EntrySnapshot, key: EntryKey): boolean {
  const entry = snapshot.entries[key];
  return Boolean(entry && validateRuntimeSurfaceEntry(entry));
}

export function validateEntry(snapshot: EntrySnapshot): boolean {
  if (!validateEntrySnapshot(snapshot)) {
    return false;
  }

  const expectedEligible = resolveEntryEligibility(snapshot.lifecycleStatus);
  if (snapshot.eligible !== expectedEligible) {
    return false;
  }

  if (snapshot.active !== resolveAggregateEntryActive(snapshot.entries)) {
    return false;
  }

  if (snapshot.aggregateStatus !== resolveAggregateEntryStatus(snapshot.entries)) {
    return false;
  }

  return listRuntimeEntryKeys().every((key) => {
    const entry = snapshot.entries[key];
    if (entry.key !== key || entry.type !== key || entry.surface !== key) {
      return false;
    }
    if (entry.eligible !== expectedEligible) {
      return false;
    }
    if (!expectedEligible) {
      return entry.status === "inactive";
    }
    return (
      entry.status === "active" ||
      entry.status === "inactive" ||
      entry.status === "hidden" ||
      entry.status === "reserved"
    );
  });
}

export function resolveEntryResult(snapshot: EntrySnapshot, key: EntryKey): EntryResult {
  const entry = snapshot.entries[key];
  return {
    key,
    type: entry.type,
    status: entry.status,
    eligible: entry.eligible,
    active: resolveEntryActive(entry.status),
  };
}

export function listEntryResults(snapshot: EntrySnapshot): EntryResult[] {
  return listRuntimeEntryKeys().map((key) => resolveEntryResult(snapshot, key));
}

export function describeRuntimeEntry(snapshot: EntrySnapshot): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `lifecycleStatus=${snapshot.lifecycleStatus}`,
    `verificationStatus=${snapshot.verificationStatus}`,
    `eligible=${snapshot.eligible}`,
    `active=${snapshot.active}`,
    `aggregateStatus=${snapshot.aggregateStatus}`,
    `version=${snapshot.version}`,
  ].join(" ");
}

export function syncEntryWithVerificationContext(
  verificationContext: WorkspaceRuntimeVerificationContext,
  _snapshot: EntrySnapshot,
): EntrySnapshot {
  return createEntrySnapshot(verificationContext);
}

export function assertRuntimeEntryHasAllSurfaces(snapshot: EntrySnapshot): boolean {
  return (
    hasEntry(snapshot, "workspace") &&
    hasEntry(snapshot, "quote") &&
    hasEntry(snapshot, "project") &&
    hasEntry(snapshot, "report")
  );
}
