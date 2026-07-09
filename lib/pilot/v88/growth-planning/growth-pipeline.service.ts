/**
 * V88 — Growth planning queue (read V87 revenue + V85 health)
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import { buildAccountHealthDashboard } from "@/lib/pilot/v85";
import {
  buildRevenueOpsDashboard,
  resolveExpectedRenewalValue,
  type RevenueQueueItem,
} from "@/lib/pilot/v87";

import {
  computeExpansionPotential,
  computePredictedValue,
  isHighValueAccount,
} from "./growth-forecast.service";
import { getGrowthOpsRecord } from "./growth-ops.store";
import type {
  GrowthOpsRecord,
  GrowthOutcome,
  GrowthPlanningQueue,
  GrowthPlanningQueueItem,
} from "./growth-ops.types";

function defaultGrowthOps(
  sessionId: string,
  organizationId: string,
  baseValue: number,
  expansion: number,
): GrowthOpsRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    baseRenewalValue: baseValue,
    expansionPotential: expansion,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveGrowthOps(
  sessionId: string,
  organizationId: string,
  baseValue: number,
  expansion: number,
): GrowthOpsRecord {
  return (
    getGrowthOpsRecord(sessionId, organizationId) ??
    defaultGrowthOps(sessionId, organizationId, baseValue, expansion)
  );
}

export function classifyPlanningQueue(input: {
  account: AccountHealthRow;
  revenueItem: RevenueQueueItem | null;
  growthOutcome: GrowthOutcome;
  baseRenewalValue: number;
}): GrowthPlanningQueue | null {
  const { account, revenueItem, growthOutcome, baseRenewalValue } = input;

  if (
    growthOutcome === "retained" ||
    growthOutcome === "expanded" ||
    growthOutcome === "lost"
  ) {
    return null;
  }

  const revenueQueue = revenueItem?.revenueQueue;
  const revenueOutcome = revenueItem?.outcome ?? "open";

  if (revenueOutcome === "churned") return null;

  if (
    account.forecast.category === "at_risk" ||
    revenueQueue === "at_risk" ||
    revenueQueue === "churn_risk" ||
    account.scores.riskScore >= 60
  ) {
    return "churn_rescue";
  }

  if (
    isHighValueAccount(baseRenewalValue) &&
    (account.forecast.daysUntilRenewal <= 45 || revenueQueue === "expiring_soon")
  ) {
    return "high_value_retain";
  }

  if (
    account.forecast.category === "likely_renew" ||
    (account.scores.renewalLikelihood >= 65 && account.scores.engagementScore >= 50)
  ) {
    return "expansion_target";
  }

  if (
    account.forecast.outreachRecommended ||
    account.forecast.category === "needs_outreach" ||
    revenueQueue === "expiring_soon"
  ) {
    return "forecast_watch";
  }

  return "forecast_watch";
}

function deriveNextAction(
  growthOps: GrowthOpsRecord,
  planningQueue: GrowthPlanningQueue,
): string {
  if (growthOps.outcome === "retained") return "已留存 — 监控续约";
  if (growthOps.outcome === "expanded") return "已扩展 — 确认增量收入";
  if (growthOps.outcome === "lost") return "已流失 — 增长复盘";
  if (!growthOps.ownerId) return "分配增长负责人";
  if (growthOps.scheduledExpansionFollowUpAt) {
    return `扩展跟进 ${new Date(growthOps.scheduledExpansionFollowUpAt).toLocaleDateString()}`;
  }
  switch (planningQueue) {
    case "high_value_retain":
      return "高价值客户留存计划";
    case "expansion_target":
      return "识别扩展机会";
    case "churn_rescue":
      return "流失救援干预";
    case "forecast_watch":
      return "预测监控与调整";
  }
}

export function buildGrowthPlanningQueueItem(
  account: AccountHealthRow,
  organizationId: string,
  planningQueue: GrowthPlanningQueue,
  queuePosition: number,
  revenueItem: RevenueQueueItem | null,
): GrowthPlanningQueueItem {
  const baseRenewalValue =
    revenueItem?.expectedRenewalValue ?? resolveExpectedRenewalValue(account.sessionId);
  const expansionPotential = computeExpansionPotential(account, baseRenewalValue);
  const growthOps = resolveGrowthOps(
    account.sessionId,
    organizationId,
    baseRenewalValue,
    expansionPotential,
  );

  const weightedRenewalValue =
    revenueItem?.weightedValue ??
    Math.round(baseRenewalValue * (account.scores.renewalLikelihood / 100));

  return {
    sessionId: account.sessionId,
    releasePackageId: account.releasePackageId,
    projectName: account.projectName,
    planningQueue,
    queuePosition,
    baseRenewalValue,
    expansionPotential,
    weightedRenewalValue,
    predictedValue: computePredictedValue(
      baseRenewalValue,
      account.scores.renewalLikelihood,
      expansionPotential,
    ),
    daysUntilRenewal: account.forecast.daysUntilRenewal,
    renewalDate: account.forecast.renewalDate,
    riskScore: account.scores.riskScore,
    renewalLikelihood: account.scores.renewalLikelihood,
    revenueQueue: revenueItem?.revenueQueue,
    ownerId: growthOps.ownerId ?? revenueItem?.ownerId,
    ownerName: growthOps.ownerName ?? revenueItem?.ownerName,
    growthStatus: growthOps.status,
    outcome: growthOps.outcome,
    nextAction: deriveNextAction(growthOps, planningQueue),
    openRisks: account.openRisks,
    revenueItem,
    growthOps,
    readOnly: true,
  };
}

export function buildGrowthPlanningPipeline(organizationId: string): {
  highValueRetain: GrowthPlanningQueueItem[];
  expansionTarget: GrowthPlanningQueueItem[];
  churnRescue: GrowthPlanningQueueItem[];
  forecastWatch: GrowthPlanningQueueItem[];
  allItems: GrowthPlanningQueueItem[];
  lostRecords: Array<{ sessionId: string; baseRenewalValue: number }>;
} {
  const revenue = buildRevenueOpsDashboard(organizationId);
  const health = buildAccountHealthDashboard(organizationId);

  const highValueRetain: GrowthPlanningQueueItem[] = [];
  const expansionTarget: GrowthPlanningQueueItem[] = [];
  const churnRescue: GrowthPlanningQueueItem[] = [];
  const forecastWatch: GrowthPlanningQueueItem[] = [];
  const lostRecords: Array<{ sessionId: string; baseRenewalValue: number }> = [];

  for (const account of health.accounts) {
    const revenueItem =
      revenue.allItems.find((i) => i.sessionId === account.sessionId) ?? null;
    const baseValue =
      revenueItem?.expectedRenewalValue ?? resolveExpectedRenewalValue(account.sessionId);
    const expansion = computeExpansionPotential(account, baseValue);
    const storedGrowth = getGrowthOpsRecord(account.sessionId, organizationId);
    const growthOutcome = storedGrowth?.outcome ?? "open";

    if (growthOutcome === "lost") {
      lostRecords.push({ sessionId: account.sessionId, baseRenewalValue: baseValue });
      continue;
    }

    const queue = classifyPlanningQueue({
      account,
      revenueItem,
      growthOutcome,
      baseRenewalValue: baseValue,
    });
    if (!queue) continue;

    const item = buildGrowthPlanningQueueItem(
      account,
      organizationId,
      queue,
      0,
      revenueItem,
    );

    switch (queue) {
      case "high_value_retain":
        highValueRetain.push(item);
        break;
      case "expansion_target":
        expansionTarget.push(item);
        break;
      case "churn_rescue":
        churnRescue.push(item);
        break;
      case "forecast_watch":
        forecastWatch.push(item);
        break;
    }
  }

  const sortFn = (a: GrowthPlanningQueueItem, b: GrowthPlanningQueueItem) => {
    if (a.predictedValue !== b.predictedValue) {
      return b.predictedValue - a.predictedValue;
    }
    return a.daysUntilRenewal - b.daysUntilRenewal;
  };

  for (const list of [highValueRetain, expansionTarget, churnRescue, forecastWatch]) {
    list.sort(sortFn);
    list.forEach((item, i) => {
      item.queuePosition = i + 1;
    });
  }

  const allItems = [
    ...highValueRetain,
    ...expansionTarget,
    ...churnRescue,
    ...forecastWatch,
  ].sort(sortFn);

  return {
    highValueRetain,
    expansionTarget,
    churnRescue,
    forecastWatch,
    allItems,
    lostRecords,
  };
}
