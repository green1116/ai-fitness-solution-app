/**
 * V89 — Expansion ops dashboard (read growth planning + expansion ops state)
 */

import { buildAccountHealthDetail } from "@/lib/pilot/v85";
import { buildGrowthPlanningDashboard, buildGrowthPlanningDetail } from "@/lib/pilot/v88";

import { buildAccountGrowthView } from "./account-growth.service";
import { getExpansionOpsRecord, listExpansionOpsActions, listExpansionOpsRecordsForOrg } from "./expansion-ops.store";
import {
  buildExpansionPipeline,
  buildExpansionQueueItem,
  qualifyExpansionQueue,
} from "./expansion-pipeline.service";
import type { ExpansionOpsDashboard, ExpansionOpsDetail } from "./expansion-ops.types";
import { V89_EXPANSION_OPS_VERSION } from "./expansion-ops.types";
import type { GrowthPlanningQueueItem } from "@/lib/pilot/v88";

export function buildExpansionOpsDashboard(organizationId: string): ExpansionOpsDashboard {
  const pipeline = buildExpansionPipeline(organizationId);
  const closedRecords = listExpansionOpsRecordsForOrg(organizationId);

  const summary = {
    total: pipeline.allItems.length,
    expansionTarget: pipeline.expansionTarget.length,
    highValueRetain: pipeline.highValueRetain.length,
    forecastWatch: pipeline.forecastWatch.length,
    churnRescue: pipeline.churnRescue.length,
    expanded: closedRecords.filter((r) => r.outcome === "expanded").length,
    retained: closedRecords.filter((r) => r.outcome === "retained").length,
    lost: pipeline.lostRecords.length,
    proposing: closedRecords.filter((r) => r.status === "proposing").length,
  };

  return {
    version: V89_EXPANSION_OPS_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    queues: {
      expansionTarget: pipeline.expansionTarget,
      highValueRetain: pipeline.highValueRetain,
      forecastWatch: pipeline.forecastWatch,
      churnRescue: pipeline.churnRescue,
    },
    allItems: pipeline.allItems,
    summary,
    readOnly: true,
  };
}

function resolveGrowthItem(
  sessionId: string,
  organizationId: string,
): GrowthPlanningQueueItem | null {
  const growth = buildGrowthPlanningDashboard(organizationId);
  const fromDashboard = growth.allItems.find((i) => i.sessionId === sessionId);
  if (fromDashboard) return fromDashboard;

  try {
    const detail = buildGrowthPlanningDetail(sessionId, organizationId);
    return detail.queueItem;
  } catch {
    return null;
  }
}

function findOrBuildQueueItem(sessionId: string, organizationId: string) {
  const dashboard = buildExpansionOpsDashboard(organizationId);
  const existing = dashboard.allItems.find((i) => i.sessionId === sessionId);
  if (existing) return existing;

  const growthItem = resolveGrowthItem(sessionId, organizationId);
  if (!growthItem) return null;

  const expansionOps = getExpansionOpsRecord(sessionId, organizationId);
  const expansionOutcome = expansionOps?.outcome ?? "open";
  const queue = qualifyExpansionQueue({ growthItem, expansionOutcome });

  if (!queue) {
    if (expansionOutcome === "expanded") {
      return buildExpansionQueueItem(growthItem, organizationId, "expansion_target", 0);
    }
    if (expansionOutcome === "retained") {
      return buildExpansionQueueItem(growthItem, organizationId, "high_value_retain", 0);
    }
    if (expansionOutcome === "lost") {
      return buildExpansionQueueItem(growthItem, organizationId, "churn_rescue", 0);
    }
    return null;
  }

  return buildExpansionQueueItem(growthItem, organizationId, queue, 0);
}

export function buildExpansionOpsDetail(
  sessionId: string,
  organizationId: string,
): ExpansionOpsDetail {
  const queueItem = findOrBuildQueueItem(sessionId, organizationId);
  if (!queueItem) throw new Error("NOT_RELEASED");

  const accountDetail = buildAccountHealthDetail(sessionId, organizationId);
  const accountGrowth = buildAccountGrowthView(
    accountDetail.account,
    queueItem.growthItem,
    organizationId,
    queueItem.nextAction,
  );

  return {
    sessionId,
    account: accountDetail.account,
    accountGrowth,
    queueItem,
    actionHistory: listExpansionOpsActions(sessionId),
    readOnly: true,
  };
}
