/**
 * V86 — Renewal ops dashboard (read forecasts + renewal ops state)
 */

import { buildAccountHealthDashboard, buildAccountHealthDetail } from "@/lib/pilot/v85";

import { listRenewalOpsActions, listRenewalOpsRecordsForOrg } from "./renewal-ops.store";
import {
  buildRenewalOpsQueueItem,
  buildRenewalPipeline,
  mapForecastToPipelineQueue,
} from "./renewal-pipeline.service";
import type { RenewalOpsDashboard, RenewalOpsDetail } from "./renewal-ops.types";
import { V86_RENEWAL_OPS_VERSION } from "./renewal-ops.types";

export function buildRenewalOpsDashboard(organizationId: string): RenewalOpsDashboard {
  const pipeline = buildRenewalPipeline(organizationId);
  const closedRecords = listRenewalOpsRecordsForOrg(organizationId);

  const summary = {
    total: pipeline.allActive.length,
    expiringSoon: pipeline.expiringSoon.length,
    outreachNeeded: pipeline.outreachNeeded.length,
    atRisk: pipeline.atRisk.length,
    saved: closedRecords.filter((r) => r.outcome === "saved").length,
    renewed: closedRecords.filter((r) => r.outcome === "renewed").length,
    churned: closedRecords.filter((r) => r.outcome === "churned").length,
    inOutreach: closedRecords.filter(
      (r) => r.status === "in_outreach" || r.status === "negotiating",
    ).length,
  };

  return {
    version: V86_RENEWAL_OPS_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    queues: {
      expiringSoon: pipeline.expiringSoon,
      outreachNeeded: pipeline.outreachNeeded,
      atRisk: pipeline.atRisk,
    },
    allItems: pipeline.allActive,
    summary,
    readOnly: true,
  };
}

function findOrBuildQueueItem(sessionId: string, organizationId: string) {
  const dashboard = buildRenewalOpsDashboard(organizationId);
  const existing = dashboard.allItems.find((i) => i.sessionId === sessionId);
  if (existing) return existing;

  const health = buildAccountHealthDashboard(organizationId);
  const account = health.accounts.find((a) => a.sessionId === sessionId);
  if (!account) return null;

  const queue = mapForecastToPipelineQueue(account.forecast.category) ?? "outreach_needed";
  return buildRenewalOpsQueueItem(account, organizationId, queue, 0);
}

export function buildRenewalOpsDetail(
  sessionId: string,
  organizationId: string,
): RenewalOpsDetail {
  const queueItem = findOrBuildQueueItem(sessionId, organizationId);
  if (!queueItem) throw new Error("NOT_RELEASED");

  const accountDetail = buildAccountHealthDetail(sessionId, organizationId);

  return {
    sessionId,
    account: accountDetail.account,
    queueItem,
    actionHistory: listRenewalOpsActions(sessionId),
    readOnly: true,
  };
}
