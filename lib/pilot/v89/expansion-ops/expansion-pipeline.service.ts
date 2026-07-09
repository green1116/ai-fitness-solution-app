/**
 * V89 — Expansion execution queue (read from V88 growth planning)
 */

import { buildGrowthPlanningDashboard } from "@/lib/pilot/v88";
import type { GrowthPlanningQueueItem } from "@/lib/pilot/v88";

import { getExpansionOpsRecord } from "./expansion-ops.store";
import type {
  ExpansionOpsRecord,
  ExpansionOutcome,
  ExpansionQueue,
  ExpansionQueueItem,
} from "./expansion-ops.types";
import { mapPlanningToExpansionQueue } from "./expansion-ops.types";

function defaultExpansionOps(
  sessionId: string,
  organizationId: string,
  expansionOpportunity: number,
): ExpansionOpsRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expansionOpportunity,
    proposalCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveExpansionOps(
  sessionId: string,
  organizationId: string,
  expansionOpportunity: number,
): ExpansionOpsRecord {
  return (
    getExpansionOpsRecord(sessionId, organizationId) ??
    defaultExpansionOps(sessionId, organizationId, expansionOpportunity)
  );
}

export function qualifyExpansionQueue(input: {
  growthItem: GrowthPlanningQueueItem;
  expansionOutcome: ExpansionOutcome;
}): ExpansionQueue | null {
  const { growthItem, expansionOutcome } = input;

  if (
    expansionOutcome === "expanded" ||
    expansionOutcome === "retained" ||
    expansionOutcome === "lost"
  ) {
    return null;
  }

  if (growthItem.outcome === "expanded" || growthItem.outcome === "lost") {
    return null;
  }

  if (growthItem.outcome === "retained") {
    return "high_value_retain";
  }

  return mapPlanningToExpansionQueue(growthItem.planningQueue);
}

function deriveNextAction(
  expansionOps: ExpansionOpsRecord,
  expansionQueue: ExpansionQueue,
): string {
  if (expansionOps.outcome === "expanded") return "已扩展 — 确认增量";
  if (expansionOps.outcome === "retained") return "已留存 — 持续培育";
  if (expansionOps.outcome === "lost") return "已流失 — 复盘";
  if (!expansionOps.ownerId) return "分配扩展负责人";
  if (expansionOps.scheduledFollowUpAt) {
    return `跟进 ${new Date(expansionOps.scheduledFollowUpAt).toLocaleDateString()}`;
  }
  if (expansionOps.proposalCount === 0) return "准备扩展方案";
  if (expansionOps.status === "proposing") return "跟进方案反馈";
  switch (expansionQueue) {
    case "expansion_target":
      return "推进扩展提案";
    case "high_value_retain":
      return "高价值留存执行";
    case "churn_rescue":
      return "流失救援执行";
    case "forecast_watch":
      return "监控扩展信号";
  }
}

export function buildExpansionQueueItem(
  growthItem: GrowthPlanningQueueItem,
  organizationId: string,
  expansionQueue: ExpansionQueue,
  queuePosition: number,
): ExpansionQueueItem {
  const expansionOps = resolveExpansionOps(
    growthItem.sessionId,
    organizationId,
    growthItem.expansionPotential,
  );
  const outcome =
    expansionOps.outcome !== "open" ? expansionOps.outcome : growthItem.outcome;

  return {
    sessionId: growthItem.sessionId,
    releasePackageId: growthItem.releasePackageId,
    projectName: growthItem.projectName,
    expansionQueue,
    queuePosition,
    expansionOpportunity: growthItem.expansionPotential,
    baseRenewalValue: growthItem.baseRenewalValue,
    predictedValue: growthItem.predictedValue,
    daysUntilRenewal: growthItem.daysUntilRenewal,
    riskScore: growthItem.riskScore,
    renewalLikelihood: growthItem.renewalLikelihood,
    ownerId: expansionOps.ownerId ?? growthItem.ownerId,
    ownerName: expansionOps.ownerName ?? growthItem.ownerName,
    opsStatus: expansionOps.status,
    outcome,
    proposalCount: expansionOps.proposalCount,
    nextAction: deriveNextAction(expansionOps, expansionQueue),
    openRisks: growthItem.openRisks,
    growthItem,
    expansionOps,
    readOnly: true,
  };
}

export function buildExpansionPipeline(organizationId: string): {
  expansionTarget: ExpansionQueueItem[];
  highValueRetain: ExpansionQueueItem[];
  forecastWatch: ExpansionQueueItem[];
  churnRescue: ExpansionQueueItem[];
  allItems: ExpansionQueueItem[];
  lostRecords: Array<{ sessionId: string; expansionOpportunity: number }>;
} {
  const growth = buildGrowthPlanningDashboard(organizationId);

  const expansionTarget: ExpansionQueueItem[] = [];
  const highValueRetain: ExpansionQueueItem[] = [];
  const forecastWatch: ExpansionQueueItem[] = [];
  const churnRescue: ExpansionQueueItem[] = [];
  const lostRecords: Array<{ sessionId: string; expansionOpportunity: number }> = [];

  for (const growthItem of growth.allItems) {
    const stored = getExpansionOpsRecord(growthItem.sessionId, organizationId);
    const expansionOutcome = stored?.outcome ?? "open";

    if (expansionOutcome === "lost") {
      lostRecords.push({
        sessionId: growthItem.sessionId,
        expansionOpportunity: growthItem.expansionPotential,
      });
      continue;
    }

    const queue = qualifyExpansionQueue({ growthItem, expansionOutcome });
    if (!queue) continue;

    const item = buildExpansionQueueItem(
      growthItem,
      organizationId,
      queue,
      0,
    );

    switch (queue) {
      case "expansion_target":
        expansionTarget.push(item);
        break;
      case "high_value_retain":
        highValueRetain.push(item);
        break;
      case "forecast_watch":
        forecastWatch.push(item);
        break;
      case "churn_rescue":
        churnRescue.push(item);
        break;
    }
  }

  const sortFn = (a: ExpansionQueueItem, b: ExpansionQueueItem) => {
    if (a.expansionOpportunity !== b.expansionOpportunity) {
      return b.expansionOpportunity - a.expansionOpportunity;
    }
    return a.daysUntilRenewal - b.daysUntilRenewal;
  };

  for (const list of [expansionTarget, highValueRetain, forecastWatch, churnRescue]) {
    list.sort(sortFn);
    list.forEach((item, i) => {
      item.queuePosition = i + 1;
    });
  }

  const allItems = [
    ...expansionTarget,
    ...highValueRetain,
    ...forecastWatch,
    ...churnRescue,
  ].sort(sortFn);

  return {
    expansionTarget,
    highValueRetain,
    forecastWatch,
    churnRescue,
    allItems,
    lostRecords,
  };
}
