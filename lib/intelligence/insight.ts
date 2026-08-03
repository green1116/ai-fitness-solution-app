/**
 * WP-53 — Insight Engine
 * Deterministic, read-only insights from IP-1 + optional Recommendations.
 */
import { getIntelligenceContext } from "./context";
import {
  getIntelligenceSnapshot,
  listIntelligenceSnapshots,
} from "./snapshot";
import { getIntelligenceMetrics } from "./metrics";
import {
  getRecommendations,
  type Recommendation,
} from "./recommendation";

export const FEAT_54_ID = "FEAT-54" as const;
export const INSIGHT_ENGINE_CAPABILITY = "InsightEngine" as const;

export const INSIGHT_TYPES = [
  "HEALTH",
  "RETENTION",
  "EXPANSION",
  "AUTOMATION",
  "SUPPORT",
  "COMPOSITE",
] as const;

export type InsightType = (typeof INSIGHT_TYPES)[number];

export const INSIGHT_SEVERITIES = ["CRITICAL", "WARNING", "INFO"] as const;

export type InsightSeverity = (typeof INSIGHT_SEVERITIES)[number];

export type Insight = Readonly<{
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  summary: string;
}>;

export type BuildInsightsInput = Readonly<{
  recommendations?: readonly Recommendation[];
}>;

const SEVERITY_RANK: Record<InsightSeverity, number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
};

let cachedInsights: Insight[] | null = null;

function cloneInsight(row: Insight): Insight {
  return { ...row };
}

function insight(
  id: string,
  type: InsightType,
  severity: InsightSeverity,
  title: string,
  summary: string,
): Insight {
  return { id, type, severity, title, summary };
}

/**
 * Build deterministic insights from Context / Metrics / Snapshot /
 * and optional Recommendation[] (defaults to cached/getRecommendations).
 */
export function buildInsights(input: BuildInsightsInput = {}): Insight[] {
  const context = getIntelligenceContext();
  const metrics = getIntelligenceMetrics();
  const snapshots = listIntelligenceSnapshots({
    contextId: context.contextId,
  });
  const snapshot =
    snapshots.length > 0
      ? snapshots[snapshots.length - 1]!
      : getIntelligenceSnapshot(metrics.snapshotId);

  const recommendations = input.recommendations
    ? [...input.recommendations]
    : getRecommendations();

  void snapshot?.summary;

  const out: Insight[] = [];
  const customer = context.customerSummary;
  const operations = context.operationsSummary;
  const analytics = context.analyticsSummary;
  const automation = context.automationSummary;

  if (customer.atRiskCustomers > 0 || metrics.healthScore < 50) {
    out.push(
      insight(
        "ins-health-pressure",
        "HEALTH",
        customer.atRiskCustomers > 0 && metrics.healthScore < 50
          ? "CRITICAL"
          : "WARNING",
        "Customer health pressure detected",
        `atRisk=${customer.atRiskCustomers}; healthScore=${metrics.healthScore}; healthy=${customer.healthyCustomers}/${customer.totalCustomers}`,
      ),
    );
  }

  if (metrics.retentionScore < 50 || operations.openRenewals > 0) {
    out.push(
      insight(
        "ins-retention-gap",
        "RETENTION",
        metrics.retentionScore < 50 ? "CRITICAL" : "WARNING",
        "Retention gap in renewal pipeline",
        `retentionScore=${metrics.retentionScore}; openRenewals=${operations.openRenewals}; retentionRate=${operations.retentionRate}`,
      ),
    );
  }

  if (metrics.expansionScore === 0 && customer.totalCustomers > 0) {
    out.push(
      insight(
        "ins-expansion-idle",
        "EXPANSION",
        "INFO",
        "Expansion pipeline is idle",
        `expansionScore=${metrics.expansionScore}; wonExpansions=${operations.wonExpansions}`,
      ),
    );
  }

  if (automation.failedTasks > 0) {
    out.push(
      insight(
        "ins-automation-failures",
        "AUTOMATION",
        "CRITICAL",
        "Automation failures present",
        `failedTasks=${automation.failedTasks}; automationScore=${metrics.automationScore}`,
      ),
    );
  } else if (automation.pendingTasks > 0) {
    out.push(
      insight(
        "ins-automation-backlog",
        "AUTOMATION",
        "WARNING",
        "Automation task backlog",
        `pendingTasks=${automation.pendingTasks}; runningTasks=${automation.runningTasks}`,
      ),
    );
  } else if (automation.totalAutomations === 0) {
    out.push(
      insight(
        "ins-automation-absent",
        "AUTOMATION",
        "INFO",
        "No automations configured",
        `totalAutomations=0; snapshotId=${metrics.snapshotId}`,
      ),
    );
  }

  if (analytics.openSupportCases > 0) {
    out.push(
      insight(
        "ins-support-load",
        "SUPPORT",
        "WARNING",
        "Open support load",
        `openSupportCases=${analytics.openSupportCases}; recentEngagements=${analytics.recentEngagements}`,
      ),
    );
  }

  const highRecs = recommendations.filter((r) => r.priority === "HIGH").length;
  if (highRecs > 0 || recommendations.length > 0) {
    out.push(
      insight(
        "ins-recommendation-signal",
        "COMPOSITE",
        highRecs > 0 ? "WARNING" : "INFO",
        "Recommendation signal present",
        `recommendations=${recommendations.length}; highPriority=${highRecs}; contextId=${context.contextId}`,
      ),
    );
  }

  out.sort((a, b) => {
    const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (bySeverity !== 0) return bySeverity;
    return a.id.localeCompare(b.id);
  });

  cachedInsights = out.map(cloneInsight);
  return cachedInsights.map(cloneInsight);
}

/**
 * Get the last built insights, or build if none cached.
 */
export function getInsights(): Insight[] {
  if (!cachedInsights) {
    return buildInsights();
  }
  return cachedInsights.map(cloneInsight);
}

/** Test helper — clears cached insights. */
export function clearInsights(): void {
  cachedInsights = null;
}
