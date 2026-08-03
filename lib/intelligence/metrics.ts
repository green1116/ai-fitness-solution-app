/**
 * FEAT-51 — Intelligence Metrics
 * Scored metrics derived from IntelligenceContext + IntelligenceSnapshot.
 */
import { getIntelligenceContext } from "./context";
import {
  createIntelligenceSnapshot,
  getIntelligenceSnapshot,
  listIntelligenceSnapshots,
} from "./snapshot";

export const FEAT_51_ID = "FEAT-51" as const;
export const INTELLIGENCE_METRICS_CAPABILITY = "IntelligenceMetrics" as const;

export type IntelligenceMetrics = Readonly<{
  metricsId: string;
  snapshotId: string;
  healthScore: number;
  retentionScore: number;
  expansionScore: number;
  automationScore: number;
  updatedAt: string;
}>;

let cachedMetrics: IntelligenceMetrics | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(row: IntelligenceMetrics): IntelligenceMetrics {
  return { ...row };
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Build (and cache) intelligence metrics from context + snapshot.
 */
export function buildIntelligenceMetrics(): IntelligenceMetrics {
  const context = getIntelligenceContext();

  // Prefer an existing snapshot for this context; otherwise create one.
  const existing = listIntelligenceSnapshots({
    contextId: context.contextId,
  });
  const snapshot =
    existing.length > 0
      ? existing[existing.length - 1]!
      : createIntelligenceSnapshot();

  // Confirm snapshot get path is reused.
  const gotSnapshot = getIntelligenceSnapshot(snapshot.snapshotId);
  if (!gotSnapshot) {
    throw new Error(`snapshot not found: ${snapshot.snapshotId}`);
  }

  const customer = context.customerSummary;
  const operations = context.operationsSummary;
  const automation = context.automationSummary;

  const healthScore = clampScore(
    customer.totalCustomers === 0
      ? 0
      : (customer.healthyCustomers / customer.totalCustomers) * 100,
  );
  const retentionScore = clampScore(operations.retentionRate * 100);
  const expansionScore = clampScore(
    operations.wonExpansions === 0 ? 0 : operations.wonExpansions * 100,
  );

  const taskTotal =
    automation.pendingTasks +
    automation.runningTasks +
    automation.completedTasks +
    automation.failedTasks;
  const automationScore = clampScore(
    taskTotal === 0
      ? automation.totalAutomations > 0
        ? 50
        : 0
      : (automation.completedTasks / taskTotal) * 100 +
          (automation.activeWorkflows > 0 ? 10 : 0),
  );

  const metrics: IntelligenceMetrics = {
    metricsId: createId("metrics"),
    snapshotId: gotSnapshot.snapshotId,
    healthScore,
    retentionScore,
    expansionScore,
    automationScore,
    updatedAt: nowIso(),
  };
  cachedMetrics = metrics;
  return cloneMetrics(metrics);
}

/**
 * Get the last built intelligence metrics, or build one if none cached.
 */
export function getIntelligenceMetrics(): IntelligenceMetrics {
  if (!cachedMetrics) {
    return buildIntelligenceMetrics();
  }
  return cloneMetrics(cachedMetrics);
}

/** Test helper — clears cached intelligence metrics. */
export function clearIntelligenceMetrics(): void {
  cachedMetrics = null;
}
