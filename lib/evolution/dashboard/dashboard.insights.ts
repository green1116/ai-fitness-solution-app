/**
 * Evolution P4 — Operational Insights
 */

import { getExecutiveOpsDashboard } from "../../operations/control/control.dashboard";
import { listEngagementAutomations } from "../customer/customer.engagement";
import { listChurnPreventionPlans } from "../customer/customer.churn";
import { listCapacityForecasts } from "../predictive/predictive.capacity";
import { listIncidentPredictions } from "../predictive/predictive.incident";
import { listRiskScores } from "../predictive/predictive.risk";
import { OPERATIONAL_INSIGHT_KINDS } from "./dashboard.constants";
import { getIntelligenceDashboard } from "./dashboard.model";
import type {
  GenerateOperationalInsightsInput,
  OperationalInsight,
  OperationalInsightKind,
} from "./dashboard.types";

const insights = new Map<string, OperationalInsight>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneInsight(insight: OperationalInsight): OperationalInsight {
  return { ...insight };
}

export function generateOperationalInsights(
  input: GenerateOperationalInsightsInput,
): OperationalInsight[] {
  const dashboard = getIntelligenceDashboard(
    input.intelligenceDashboardId.trim(),
  );
  if (!dashboard) {
    throw new Error(
      `intelligence dashboard not found: ${input.intelligenceDashboardId}`,
    );
  }

  const prefix = input.idPrefix?.trim() || `opins_${dashboard.id}`;
  const created: OperationalInsight[] = [];

  const candidates: Array<{
    suffix: string;
    kind: OperationalInsightKind;
    title: string;
    severity: number;
    detail: string;
  }> = [];

  if (dashboard.executiveOpsDashboardId) {
    const exec = getExecutiveOpsDashboard(dashboard.executiveOpsDashboardId);
    if (exec) {
      candidates.push({
        suffix: "health",
        kind: "HEALTH",
        title: "Operations health posture",
        severity: Math.max(1, 100 - exec.health.overallScore),
        detail: `health=${exec.health.overallLevel} score=${exec.executiveScore}`,
      });
      candidates.push({
        suffix: "decision",
        kind: "DECISION",
        title: "Control plane decision signal",
        severity: Math.max(1, 100 - exec.decision.confidence),
        detail: `verdict=${exec.decision.verdict} confidence=${exec.decision.confidence}`,
      });
    }
  }

  if (dashboard.predictionModelId) {
    const risks = listRiskScores({
      predictionModelId: dashboard.predictionModelId,
    });
    const incidents = listIncidentPredictions({
      predictionModelId: dashboard.predictionModelId,
    });
    const capacity = listCapacityForecasts({
      predictionModelId: dashboard.predictionModelId,
    });
    if (risks[0]) {
      candidates.push({
        suffix: "risk",
        kind: "RISK",
        title: "Predictive risk pressure",
        severity: risks[0].score,
        detail: `band=${risks[0].band} score=${risks[0].score}`,
      });
    }
    if (incidents[0]) {
      candidates.push({
        suffix: "incident",
        kind: "RISK",
        title: "Incident likelihood outlook",
        severity: incidents[0].probability,
        detail: `level=${incidents[0].level}`,
      });
    }
    if (capacity[0]) {
      candidates.push({
        suffix: "capacity",
        kind: "CAPACITY",
        title: "Capacity forecast outlook",
        severity: capacity[0].projectedUtilization,
        detail: `outlook=${capacity[0].outlook}`,
      });
    }
  }

  if (dashboard.customerIntelligenceId) {
    const engagements = listEngagementAutomations({
      customerIntelligenceId: dashboard.customerIntelligenceId,
    });
    const churn = listChurnPreventionPlans({
      customerIntelligenceId: dashboard.customerIntelligenceId,
    });
    if (engagements[0]) {
      candidates.push({
        suffix: "engagement",
        kind: "ENGAGEMENT",
        title: "Autonomous engagement activity",
        severity: engagements[0].priority * 15,
        detail: `channel=${engagements[0].channel} status=${engagements[0].status}`,
      });
    }
    if (churn[0]) {
      candidates.push({
        suffix: "churn",
        kind: "RISK",
        title: "Churn prevention posture",
        severity: churn[0].churnScore,
        detail: `threat=${churn[0].threatLevel}`,
      });
    }
  }

  if (candidates.length === 0) {
    candidates.push({
      suffix: "baseline",
      kind: "HEALTH",
      title: "Baseline operational watch",
      severity: 20,
      detail: "no elevated insights detected",
    });
  }

  for (const candidate of candidates) {
    if (
      !(OPERATIONAL_INSIGHT_KINDS as readonly string[]).includes(candidate.kind)
    ) {
      throw new Error(`invalid operational insight kind: ${candidate.kind}`);
    }
    const id = `${prefix}.${candidate.suffix}`;
    if (insights.has(id)) {
      throw new Error(`operational insight already exists: ${id}`);
    }
    const insight: OperationalInsight = {
      id,
      intelligenceDashboardId: dashboard.id,
      kind: candidate.kind,
      title: candidate.title,
      severity: Math.max(0, Math.min(100, Math.round(candidate.severity))),
      detail: candidate.detail,
      createdAt: nowIso(),
    };
    insights.set(id, insight);
    created.push(cloneInsight(insight));
  }

  return created;
}

export function getOperationalInsight(
  id: string,
): OperationalInsight | undefined {
  const insight = insights.get(id.trim());
  return insight ? cloneInsight(insight) : undefined;
}

export function listOperationalInsights(filter?: {
  intelligenceDashboardId?: string;
  kind?: OperationalInsightKind;
}): OperationalInsight[] {
  let result = [...insights.values()];
  if (filter?.intelligenceDashboardId) {
    const did = filter.intelligenceDashboardId.trim();
    result = result.filter((i) => i.intelligenceDashboardId === did);
  }
  if (filter?.kind) result = result.filter((i) => i.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInsight);
}

export function clearOperationalInsights(): void {
  insights.clear();
}
