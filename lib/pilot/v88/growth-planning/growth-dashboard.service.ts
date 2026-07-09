/**
 * V88 — Growth planning dashboard (read revenue ops + growth ops state)
 */

import { buildAccountHealthDashboard, buildAccountHealthDetail } from "@/lib/pilot/v85";
import { buildRevenueOpsDashboard, resolveExpectedRenewalValue } from "@/lib/pilot/v87";

import { buildGrowthForecastSummary } from "./growth-forecast.service";
import { getGrowthOpsRecord, listGrowthOpsActions, listGrowthOpsRecordsForOrg } from "./growth-ops.store";
import {
  buildGrowthPlanningPipeline,
  buildGrowthPlanningQueueItem,
  classifyPlanningQueue,
} from "./growth-pipeline.service";
import type { GrowthPlanningDashboard, GrowthPlanningDetail } from "./growth-ops.types";
import { V88_GROWTH_PLANNING_VERSION } from "./growth-ops.types";

export function buildGrowthPlanningDashboard(
  organizationId: string,
): GrowthPlanningDashboard {
  const pipeline = buildGrowthPlanningPipeline(organizationId);
  const revenueDashboard = buildRevenueOpsDashboard(organizationId);
  const forecast = buildGrowthForecastSummary(
    revenueDashboard,
    pipeline.allItems,
    pipeline.lostRecords,
  );

  const closedRecords = listGrowthOpsRecordsForOrg(organizationId);

  const summary = {
    total: pipeline.allItems.length,
    highValueRetain: pipeline.highValueRetain.length,
    expansionTarget: pipeline.expansionTarget.length,
    churnRescue: pipeline.churnRescue.length,
    forecastWatch: pipeline.forecastWatch.length,
    retained: closedRecords.filter((r) => r.outcome === "retained").length,
    expanded: closedRecords.filter((r) => r.outcome === "expanded").length,
    lost: pipeline.lostRecords.length,
  };

  return {
    version: V88_GROWTH_PLANNING_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    forecast,
    queues: {
      highValueRetain: pipeline.highValueRetain,
      expansionTarget: pipeline.expansionTarget,
      churnRescue: pipeline.churnRescue,
      forecastWatch: pipeline.forecastWatch,
    },
    allItems: pipeline.allItems,
    summary,
    readOnly: true,
  };
}

function findOrBuildQueueItem(sessionId: string, organizationId: string) {
  const dashboard = buildGrowthPlanningDashboard(organizationId);
  const existing = dashboard.allItems.find((i) => i.sessionId === sessionId);
  if (existing) return existing;

  const health = buildAccountHealthDashboard(organizationId);
  const account = health.accounts.find((a) => a.sessionId === sessionId);
  if (!account) return null;

  const revenueDashboard = buildRevenueOpsDashboard(organizationId);
  const revenueItem =
    revenueDashboard.allItems.find((i) => i.sessionId === sessionId) ?? null;
  const baseValue =
    revenueItem?.expectedRenewalValue ?? resolveExpectedRenewalValue(sessionId);
  const growthOps = getGrowthOpsRecord(sessionId, organizationId);
  const growthOutcome = growthOps?.outcome ?? "open";

  const queue = classifyPlanningQueue({
    account,
    revenueItem,
    growthOutcome,
    baseRenewalValue: baseValue,
  });

  if (!queue) {
    if (growthOutcome === "lost") {
      return buildGrowthPlanningQueueItem(
        account,
        organizationId,
        "churn_rescue",
        0,
        revenueItem,
      );
    }
    if (growthOutcome === "retained" || growthOutcome === "expanded") {
      return buildGrowthPlanningQueueItem(
        account,
        organizationId,
        growthOutcome === "expanded" ? "expansion_target" : "high_value_retain",
        0,
        revenueItem,
      );
    }
    return null;
  }

  return buildGrowthPlanningQueueItem(account, organizationId, queue, 0, revenueItem);
}

export function buildGrowthPlanningDetail(
  sessionId: string,
  organizationId: string,
): GrowthPlanningDetail {
  const queueItem = findOrBuildQueueItem(sessionId, organizationId);
  if (!queueItem) throw new Error("NOT_RELEASED");

  const accountDetail = buildAccountHealthDetail(sessionId, organizationId);

  return {
    sessionId,
    account: accountDetail.account,
    queueItem,
    actionHistory: listGrowthOpsActions(sessionId),
    readOnly: true,
  };
}
