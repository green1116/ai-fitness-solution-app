/**
 * FEAT-50 — Intelligence Snapshot
 * Immutable snapshots derived from IntelligenceContext.
 */
import {
  getIntelligenceContext,
  type IntelligenceContext,
} from "./context";

export const FEAT_50_ID = "FEAT-50" as const;
export const INTELLIGENCE_SNAPSHOT_CAPABILITY =
  "IntelligenceSnapshot" as const;

export type IntelligenceSnapshot = Readonly<{
  snapshotId: string;
  contextId: string;
  version: string;
  createdAt: string;
  summary: string;
}>;

export type CreateIntelligenceSnapshotInput = Readonly<{
  snapshotId?: string;
  version?: string;
}>;

export type ListIntelligenceSnapshotsFilter = Readonly<{
  contextId?: string;
  version?: string;
}>;

const snapshots = new Map<string, IntelligenceSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSnapshot(row: IntelligenceSnapshot): IntelligenceSnapshot {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`intelligenceSnapshot.${field} is required`);
  return trimmed;
}

function formatSummary(context: IntelligenceContext): string {
  const c = context.customerSummary;
  const o = context.operationsSummary;
  const a = context.analyticsSummary;
  const m = context.automationSummary;
  return [
    `customers=${c.totalCustomers}`,
    `active=${c.activeCustomers}`,
    `atRisk=${c.atRiskCustomers}`,
    `healthy=${c.healthyCustomers}`,
    `churned=${c.churnedCustomers}`,
    `retention=${o.retentionRate}`,
    `optimization=${o.optimizationScore}`,
    `support=${a.openSupportCases}`,
    `automations=${m.totalAutomations}`,
    `activeWorkflows=${m.activeWorkflows}`,
    `pendingTasks=${m.pendingTasks}`,
  ].join(" ");
}

/**
 * Create a snapshot from the current intelligence context.
 */
export function createIntelligenceSnapshot(
  input: CreateIntelligenceSnapshotInput = {},
): IntelligenceSnapshot {
  const context = getIntelligenceContext();
  const snapshotId = input.snapshotId
    ? requireTrimmed(input.snapshotId, "snapshotId")
    : createId("snap");
  const version = input.version
    ? requireTrimmed(input.version, "version")
    : `v${snapshots.size + 1}`;

  if (snapshots.has(snapshotId)) {
    throw new Error(`snapshot already exists: ${snapshotId}`);
  }

  const row: IntelligenceSnapshot = {
    snapshotId,
    contextId: context.contextId,
    version,
    createdAt: nowIso(),
    summary: formatSummary(context),
  };
  snapshots.set(snapshotId, row);
  return cloneSnapshot(row);
}

/**
 * Get snapshot by snapshotId.
 */
export function getIntelligenceSnapshot(
  snapshotId: string,
): IntelligenceSnapshot | undefined {
  const id = snapshotId.trim();
  if (!id) return undefined;
  const row = snapshots.get(id);
  return row ? cloneSnapshot(row) : undefined;
}

/**
 * List snapshots with optional filters.
 */
export function listIntelligenceSnapshots(
  filter: ListIntelligenceSnapshotsFilter = {},
): IntelligenceSnapshot[] {
  let rows = [...snapshots.values()];
  if (filter.contextId) {
    const contextId = requireTrimmed(filter.contextId, "contextId");
    rows = rows.filter((r) => r.contextId === contextId);
  }
  if (filter.version) {
    const version = requireTrimmed(filter.version, "version");
    rows = rows.filter((r) => r.version === version);
  }
  return rows
    .slice()
    .sort((a, b) => a.snapshotId.localeCompare(b.snapshotId))
    .map(cloneSnapshot);
}

/** Test helper — clears in-memory snapshots. */
export function clearIntelligenceSnapshots(): void {
  snapshots.clear();
}
