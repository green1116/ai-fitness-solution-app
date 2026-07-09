/**
 * V87 — Revenue ops dashboard (read forecasts + revenue ops state)
 */

import { buildAccountHealthDashboard, buildAccountHealthDetail } from "@/lib/pilot/v85";
import { getRenewalOpsRecord } from "@/lib/pilot/v86";

import { buildRevenueForecastSummary } from "./revenue-forecast.service";
import { getRevenueOpsRecord, listRevenueOpsActions } from "./revenue-ops.store";
import {
  buildRevenuePipeline,
  buildRevenueQueueItem,
  classifyRevenueQueue,
} from "./revenue-pipeline.service";
import type { RevenueOpsDashboard, RevenueOpsDetail } from "./revenue-ops.types";
import { V87_REVENUE_OPS_VERSION } from "./revenue-ops.types";

export function buildRevenueOpsDashboard(organizationId: string): RevenueOpsDashboard {
  const pipeline = buildRevenuePipeline(organizationId);
  const forecast = buildRevenueForecastSummary(pipeline.allItems, pipeline.churnedRecords);

  const summary = {
    total: pipeline.allItems.length,
    saved: pipeline.saved.length,
    renewed: pipeline.renewed.length,
    churnRisk: pipeline.churnRisk.length,
    expiringSoon: pipeline.expiringSoon.length,
    atRisk: pipeline.atRisk.length,
    churned: pipeline.churnedRecords.length,
    escalated: pipeline.allItems.filter((i) => i.escalationLevel > 0).length,
  };

  return {
    version: V87_REVENUE_OPS_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    forecast,
    queues: {
      saved: pipeline.saved,
      renewed: pipeline.renewed,
      churnRisk: pipeline.churnRisk,
      expiringSoon: pipeline.expiringSoon,
      atRisk: pipeline.atRisk,
    },
    allItems: pipeline.allItems,
    summary,
    readOnly: true,
  };
}

function findOrBuildQueueItem(sessionId: string, organizationId: string) {
  const dashboard = buildRevenueOpsDashboard(organizationId);
  const existing = dashboard.allItems.find((i) => i.sessionId === sessionId);
  if (existing) return existing;

  const health = buildAccountHealthDashboard(organizationId);
  const account = health.accounts.find((a) => a.sessionId === sessionId);
  if (!account) return null;

  const renewalOps = getRenewalOpsRecord(sessionId, organizationId);
  const revenueOps = getRevenueOpsRecord(sessionId, organizationId);
  const renewalOutcome = renewalOps?.outcome ?? "open";
  const revenueOutcome = revenueOps?.outcome ?? "open";

  const queue = classifyRevenueQueue({ account, renewalOutcome, revenueOutcome });
  if (queue) return buildRevenueQueueItem(account, organizationId, queue, 0);

  if (revenueOutcome === "churned" || renewalOutcome === "churned") {
    return buildRevenueQueueItem(account, organizationId, "at_risk", 0);
  }

  return null;
}

export function buildRevenueOpsDetail(
  sessionId: string,
  organizationId: string,
): RevenueOpsDetail {
  const queueItem = findOrBuildQueueItem(sessionId, organizationId);
  if (!queueItem) throw new Error("NOT_RELEASED");

  const accountDetail = buildAccountHealthDetail(sessionId, organizationId);

  return {
    sessionId,
    account: accountDetail.account,
    queueItem,
    actionHistory: listRevenueOpsActions(sessionId),
    readOnly: true,
  };
}
