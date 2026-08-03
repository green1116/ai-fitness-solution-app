/**
 * WP-52 — Recommendation Engine
 * Deterministic, read-only recommendations from IP-1 intelligence surfaces.
 */
import { getIntelligenceContext } from "./context";
import {
  getIntelligenceSnapshot,
  listIntelligenceSnapshots,
} from "./snapshot";
import { getIntelligenceMetrics } from "./metrics";
import { getAutomationDashboard } from "../post-launch";

export const FEAT_53_ID = "FEAT-53" as const;
export const RECOMMENDATION_ENGINE_CAPABILITY =
  "RecommendationEngine" as const;

export const RECOMMENDATION_TYPES = [
  "HEALTH",
  "RETENTION",
  "EXPANSION",
  "AUTOMATION",
  "SUPPORT",
] as const;

export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];

export const RECOMMENDATION_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

export type RecommendationPriority =
  (typeof RECOMMENDATION_PRIORITIES)[number];

export type Recommendation = Readonly<{
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  reason: string;
}>;

const PRIORITY_RANK: Record<RecommendationPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

let cachedRecommendations: Recommendation[] | null = null;

function cloneRecommendation(row: Recommendation): Recommendation {
  return { ...row };
}

function rec(
  id: string,
  type: RecommendationType,
  priority: RecommendationPriority,
  title: string,
  reason: string,
): Recommendation {
  return { id, type, priority, title, reason };
}

/**
 * Build deterministic recommendations from Context / Metrics / Snapshot /
 * Automation state (read-only).
 */
export function buildRecommendations(): Recommendation[] {
  const context = getIntelligenceContext();
  const metrics = getIntelligenceMetrics();
  const snapshots = listIntelligenceSnapshots({
    contextId: context.contextId,
  });
  const snapshot =
    snapshots.length > 0
      ? snapshots[snapshots.length - 1]!
      : getIntelligenceSnapshot(metrics.snapshotId);
  const automation = getAutomationDashboard();

  void snapshot?.summary;
  void automation.totalAutomations;

  const out: Recommendation[] = [];
  const customer = context.customerSummary;
  const operations = context.operationsSummary;
  const analytics = context.analyticsSummary;

  if (customer.atRiskCustomers > 0) {
    out.push(
      rec(
        "rec-health-at-risk",
        "HEALTH",
        "HIGH",
        "Engage at-risk customers",
        `atRiskCustomers=${customer.atRiskCustomers}; healthScore=${metrics.healthScore}`,
      ),
    );
  }

  if (metrics.healthScore < 50) {
    out.push(
      rec(
        "rec-health-low-score",
        "HEALTH",
        "HIGH",
        "Improve customer health",
        `healthScore=${metrics.healthScore}; healthy=${customer.healthyCustomers}/${customer.totalCustomers}`,
      ),
    );
  }

  if (metrics.retentionScore < 50 || operations.openRenewals > 0) {
    out.push(
      rec(
        "rec-retention-action",
        "RETENTION",
        metrics.retentionScore < 50 ? "HIGH" : "MEDIUM",
        "Advance renewal pipeline",
        `retentionScore=${metrics.retentionScore}; openRenewals=${operations.openRenewals}; retentionRate=${operations.retentionRate}`,
      ),
    );
  }

  if (metrics.expansionScore === 0 && customer.totalCustomers > 0) {
    out.push(
      rec(
        "rec-expansion-opportunity",
        "EXPANSION",
        "MEDIUM",
        "Identify expansion opportunities",
        `expansionScore=${metrics.expansionScore}; wonExpansions=${operations.wonExpansions}`,
      ),
    );
  }

  if (automation.failedTasks > 0 || context.automationSummary.failedTasks > 0) {
    out.push(
      rec(
        "rec-automation-failed-tasks",
        "AUTOMATION",
        "HIGH",
        "Resolve failed automation tasks",
        `failedTasks=${automation.failedTasks}; automationScore=${metrics.automationScore}`,
      ),
    );
  } else if (
    automation.pendingTasks > 0 ||
    context.automationSummary.pendingTasks > 0
  ) {
    out.push(
      rec(
        "rec-automation-pending-tasks",
        "AUTOMATION",
        "MEDIUM",
        "Clear pending automation tasks",
        `pendingTasks=${automation.pendingTasks}; activeWorkflows=${automation.activeWorkflows}`,
      ),
    );
  } else if (automation.totalAutomations === 0) {
    out.push(
      rec(
        "rec-automation-setup",
        "AUTOMATION",
        "LOW",
        "Enable customer automations",
        `totalAutomations=0; snapshot=${metrics.snapshotId}`,
      ),
    );
  }

  if (analytics.openSupportCases > 0) {
    out.push(
      rec(
        "rec-support-open-cases",
        "SUPPORT",
        "MEDIUM",
        "Follow up open support cases",
        `openSupportCases=${analytics.openSupportCases}; recentEngagements=${analytics.recentEngagements}`,
      ),
    );
  }

  out.sort((a, b) => {
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    return a.id.localeCompare(b.id);
  });

  cachedRecommendations = out.map(cloneRecommendation);
  return cachedRecommendations.map(cloneRecommendation);
}

/**
 * Get the last built recommendations, or build if none cached.
 */
export function getRecommendations(): Recommendation[] {
  if (!cachedRecommendations) {
    return buildRecommendations();
  }
  return cachedRecommendations.map(cloneRecommendation);
}

/** Test helper — clears cached recommendations. */
export function clearRecommendations(): void {
  cachedRecommendations = null;
}
