/**
 * V86 — Renewal pipeline queues (read from V85 forecasts)
 */

import type { AccountHealthRow, RenewalForecastCategory } from "@/lib/pilot/v85";
import { buildAccountHealthDashboard } from "@/lib/pilot/v85";

import { getRenewalOpsRecord } from "./renewal-ops.store";
import type {
  RenewalOpsQueueItem,
  RenewalOpsRecord,
  RenewalPipelineQueue,
} from "./renewal-ops.types";

function defaultOpsRecord(sessionId: string, organizationId: string): RenewalOpsRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    outreachAttempts: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveOpsRecord(sessionId: string, organizationId: string): RenewalOpsRecord {
  return getRenewalOpsRecord(sessionId, organizationId) ?? defaultOpsRecord(sessionId, organizationId);
}

export function mapForecastToPipelineQueue(
  category: RenewalForecastCategory,
): RenewalPipelineQueue | null {
  switch (category) {
    case "expiring_soon":
      return "expiring_soon";
    case "needs_outreach":
      return "outreach_needed";
    case "at_risk":
      return "at_risk";
    case "likely_renew":
      return null;
    default:
      return null;
  }
}

function deriveNextAction(
  ops: RenewalOpsRecord,
  account: AccountHealthRow,
): string {
  if (ops.outcome === "saved") return "已挽留 — 监控续约";
  if (ops.outcome === "renewed") return "已续约 — 归档";
  if (ops.outcome === "churned") return "已流失 — 复盘";
  if (!ops.ownerId) return "分配续约负责人";
  if (ops.scheduledOutreachAt) return `计划外联 ${new Date(ops.scheduledOutreachAt).toLocaleDateString()}`;
  if (account.forecast.outreachRecommended) return "执行续约外联";
  if (ops.outreachAttempts === 0) return "首次续约触达";
  return "跟进续约谈判";
}

export function buildRenewalOpsQueueItem(
  account: AccountHealthRow,
  organizationId: string,
  pipelineQueue: RenewalPipelineQueue,
  queuePosition: number,
): RenewalOpsQueueItem {
  const ops = resolveOpsRecord(account.sessionId, organizationId);

  return {
    sessionId: account.sessionId,
    releasePackageId: account.releasePackageId,
    projectName: account.projectName,
    pipelineQueue,
    queuePosition,
    forecastCategory: account.forecast.category,
    daysUntilRenewal: account.forecast.daysUntilRenewal,
    renewalDate: account.forecast.renewalDate,
    riskScore: account.scores.riskScore,
    renewalLikelihood: account.scores.renewalLikelihood,
    accountHealthScore: account.scores.accountHealthScore,
    ownerId: ops.ownerId,
    ownerName: ops.ownerName,
    opsStatus: ops.status,
    outcome: ops.outcome,
    nextAction: deriveNextAction(ops, account),
    openRisks: account.openRisks,
    renewalOps: ops,
    readOnly: true,
  };
}

export function buildRenewalPipeline(organizationId: string): {
  expiringSoon: RenewalOpsQueueItem[];
  outreachNeeded: RenewalOpsQueueItem[];
  atRisk: RenewalOpsQueueItem[];
  allActive: RenewalOpsQueueItem[];
} {
  const health = buildAccountHealthDashboard(organizationId);

  const expiringSoon: RenewalOpsQueueItem[] = [];
  const outreachNeeded: RenewalOpsQueueItem[] = [];
  const atRisk: RenewalOpsQueueItem[] = [];

  for (const account of health.accounts) {
    const ops = resolveOpsRecord(account.sessionId, organizationId);
    if (ops.outcome === "saved" || ops.outcome === "renewed" || ops.outcome === "churned") {
      continue;
    }

    const queue = mapForecastToPipelineQueue(account.forecast.category);
    if (!queue) continue;

    const item = buildRenewalOpsQueueItem(account, organizationId, queue, 0);
    if (queue === "expiring_soon") expiringSoon.push(item);
    else if (queue === "outreach_needed") outreachNeeded.push(item);
    else if (queue === "at_risk") atRisk.push(item);
  }

  const sortFn = (a: RenewalOpsQueueItem, b: RenewalOpsQueueItem) => {
    if (a.daysUntilRenewal !== b.daysUntilRenewal) {
      return a.daysUntilRenewal - b.daysUntilRenewal;
    }
    return b.riskScore - a.riskScore;
  };

  expiringSoon.sort(sortFn);
  outreachNeeded.sort(sortFn);
  atRisk.sort(sortFn);

  expiringSoon.forEach((item, i) => {
    item.queuePosition = i + 1;
  });
  outreachNeeded.forEach((item, i) => {
    item.queuePosition = i + 1;
  });
  atRisk.forEach((item, i) => {
    item.queuePosition = i + 1;
  });

  const allActive = [...expiringSoon, ...outreachNeeded, ...atRisk].sort(sortFn);

  return { expiringSoon, outreachNeeded, atRisk, allActive };
}
