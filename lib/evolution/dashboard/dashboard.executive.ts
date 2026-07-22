/**
 * Evolution P4 — Executive Analytics
 */

import { getExecutiveOpsDashboard } from "../../operations/control/control.dashboard";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { getCustomerIntelligenceProfile } from "../customer/customer.intelligence";
import { getPredictionModel } from "../predictive/predictive.model";
import { listRiskScores } from "../predictive/predictive.risk";
import { EXECUTIVE_TRENDS } from "./dashboard.constants";
import { getIntelligenceDashboard } from "./dashboard.model";
import type {
  ComputeExecutiveAnalyticsInput,
  ExecutiveAnalytics,
  ExecutiveTrend,
} from "./dashboard.types";

const analytics = new Map<string, ExecutiveAnalytics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAnalytics(item: ExecutiveAnalytics): ExecutiveAnalytics {
  return { ...item, highlights: [...item.highlights] };
}

function trendFromScore(score: number): ExecutiveTrend {
  if (score >= 70) return "UP";
  if (score >= 45) return "FLAT";
  if (score > 0) return "DOWN";
  return "UNKNOWN";
}

export function computeExecutiveAnalytics(
  input: ComputeExecutiveAnalyticsInput,
): ExecutiveAnalytics {
  const dashboard = getIntelligenceDashboard(
    input.intelligenceDashboardId.trim(),
  );
  if (!dashboard) {
    throw new Error(
      `intelligence dashboard not found: ${input.intelligenceDashboardId}`,
    );
  }

  let predictiveScore = 55;
  if (dashboard.predictionModelId) {
    const model = getPredictionModel(dashboard.predictionModelId);
    predictiveScore = model?.confidence ?? 55;
    const risks = listRiskScores({
      predictionModelId: dashboard.predictionModelId,
    });
    if (risks.length > 0) {
      predictiveScore = Math.round(
        (predictiveScore + Math.max(0, 100 - risks[0]!.score)) / 2,
      );
    }
  }

  let customerScore = 55;
  if (dashboard.customerIntelligenceId) {
    customerScore =
      getCustomerIntelligenceProfile(dashboard.customerIntelligenceId)
        ?.intelligenceScore ?? 55;
  }

  let growthScore = 55;
  if (dashboard.growthDashboardId) {
    growthScore =
      getGrowthDashboard(dashboard.growthDashboardId)?.growthScore ?? 55;
  }

  let operationsScore = 55;
  if (dashboard.executiveOpsDashboardId) {
    operationsScore =
      getExecutiveOpsDashboard(dashboard.executiveOpsDashboardId)
        ?.executiveScore ?? 55;
  }

  const executiveScore = Math.round(
    predictiveScore * 0.25 +
      customerScore * 0.25 +
      growthScore * 0.25 +
      operationsScore * 0.25,
  );
  const trend = trendFromScore(executiveScore);
  if (!(EXECUTIVE_TRENDS as readonly string[]).includes(trend)) {
    throw new Error(`invalid executive trend: ${trend}`);
  }

  const highlights: string[] = [];
  if (executiveScore >= 70) highlights.push("enterprise-momentum-strong");
  if (predictiveScore < 50) highlights.push("predictive-pressure");
  if (customerScore >= 70) highlights.push("customer-success-healthy");
  if (growthScore >= 65) highlights.push("growth-accelerating");
  if (operationsScore >= 65) highlights.push("operations-stable");
  if (highlights.length === 0) highlights.push("steady-state-watch");

  const id = input.id?.trim() || createId("execan");
  if (analytics.has(id)) {
    throw new Error(`executive analytics already exists: ${id}`);
  }

  const item: ExecutiveAnalytics = {
    id,
    intelligenceDashboardId: dashboard.id,
    trend,
    executiveScore,
    predictiveScore,
    customerScore,
    growthScore,
    operationsScore,
    highlights,
    detail: `trend=${trend} score=${executiveScore}`,
    analyzedAt: nowIso(),
  };
  analytics.set(id, item);
  return cloneAnalytics(item);
}

export function getExecutiveAnalytics(
  id: string,
): ExecutiveAnalytics | undefined {
  const item = analytics.get(id.trim());
  return item ? cloneAnalytics(item) : undefined;
}

export function listExecutiveAnalytics(filter?: {
  intelligenceDashboardId?: string;
}): ExecutiveAnalytics[] {
  let result = [...analytics.values()];
  if (filter?.intelligenceDashboardId) {
    const did = filter.intelligenceDashboardId.trim();
    result = result.filter((a) => a.intelligenceDashboardId === did);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalytics);
}

export function clearExecutiveAnalytics(): void {
  analytics.clear();
}
