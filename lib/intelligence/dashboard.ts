/**
 * FEAT-52 — Intelligence Dashboard
 * Dashboard snapshot built on Context / Snapshot / Metrics.
 */
import { getIntelligenceContext } from "./context";
import { getIntelligenceSnapshot } from "./snapshot";
import {
  buildIntelligenceMetrics,
  getIntelligenceMetrics,
} from "./metrics";

export const FEAT_52_ID = "FEAT-52" as const;
export const INTELLIGENCE_DASHBOARD_CAPABILITY =
  "IntelligenceDashboard" as const;

export const INTELLIGENCE_TRENDS = ["UP", "STABLE", "DOWN"] as const;

export type IntelligenceTrend = (typeof INTELLIGENCE_TRENDS)[number];

export type IntelligenceDashboard = Readonly<{
  dashboardId: string;
  metricsId: string;
  overallScore: number;
  trend: IntelligenceTrend;
  summary: string;
  updatedAt: string;
}>;

let cachedDashboard: IntelligenceDashboard | null = null;
let previousOverallScore: number | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDashboard(row: IntelligenceDashboard): IntelligenceDashboard {
  return { ...row };
}

function resolveTrend(overallScore: number): IntelligenceTrend {
  if (previousOverallScore === null) return "STABLE";
  if (overallScore > previousOverallScore) return "UP";
  if (overallScore < previousOverallScore) return "DOWN";
  return "STABLE";
}

/**
 * Build (and cache) the intelligence dashboard.
 */
export function buildIntelligenceDashboard(): IntelligenceDashboard {
  const context = getIntelligenceContext();
  const metrics = buildIntelligenceMetrics();
  const snapshot = getIntelligenceSnapshot(metrics.snapshotId);
  if (!snapshot) {
    throw new Error(`snapshot not found: ${metrics.snapshotId}`);
  }

  // Ensure get paths are reused.
  void getIntelligenceMetrics().metricsId;
  void context.contextId;

  const overallScore = Math.round(
    (metrics.healthScore +
      metrics.retentionScore +
      metrics.expansionScore +
      metrics.automationScore) /
      4,
  );
  const trend = resolveTrend(overallScore);
  previousOverallScore = overallScore;

  const summary = [
    `overall=${overallScore}`,
    `trend=${trend}`,
    `health=${metrics.healthScore}`,
    `retention=${metrics.retentionScore}`,
    `expansion=${metrics.expansionScore}`,
    `automation=${metrics.automationScore}`,
    `customers=${context.customerSummary.totalCustomers}`,
    `snapshot=${snapshot.snapshotId}`,
  ].join(" ");

  const dashboard: IntelligenceDashboard = {
    dashboardId: createId("dash"),
    metricsId: metrics.metricsId,
    overallScore,
    trend,
    summary,
    updatedAt: nowIso(),
  };
  cachedDashboard = dashboard;
  return cloneDashboard(dashboard);
}

/**
 * Get the last built intelligence dashboard, or build one if none cached.
 */
export function getIntelligenceDashboard(): IntelligenceDashboard {
  if (!cachedDashboard) {
    return buildIntelligenceDashboard();
  }
  return cloneDashboard(cachedDashboard);
}

/** Test helper — clears cached intelligence dashboard. */
export function clearIntelligenceDashboard(): void {
  cachedDashboard = null;
  previousOverallScore = null;
}
