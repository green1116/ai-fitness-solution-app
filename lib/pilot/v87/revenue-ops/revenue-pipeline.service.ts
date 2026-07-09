/**
 * V87 — Revenue queue classification (read V85 forecast + V86 renewal ops)
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import { buildAccountHealthDashboard } from "@/lib/pilot/v85";
import { getRenewalOpsRecord, type RenewalOpsRecord } from "@/lib/pilot/v86";

import {
  computeWeightedValue,
  resolveExpectedRenewalValue,
} from "./revenue-forecast.service";
import { getOrCreateRevenueOpsRecord, getRevenueOpsRecord } from "./revenue-ops.store";
import type {
  RevenueOpsRecord,
  RevenueQueueCategory,
  RevenueQueueItem,
} from "./revenue-ops.types";

function defaultRenewalOps(sessionId: string, organizationId: string): RenewalOpsRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued" as const,
    outcome: "open" as const,
    outreachAttempts: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveRenewalOps(sessionId: string, organizationId: string) {
  return getRenewalOpsRecord(sessionId, organizationId) ?? defaultRenewalOps(sessionId, organizationId);
}

function resolveRevenueOps(
  sessionId: string,
  organizationId: string,
  expectedValue: number,
): RevenueOpsRecord {
  return (
    getRevenueOpsRecord(sessionId, organizationId) ??
    getOrCreateRevenueOpsRecord(sessionId, organizationId, expectedValue)
  );
}

export function classifyRevenueQueue(input: {
  account: AccountHealthRow;
  renewalOutcome: string;
  revenueOutcome: string;
}): RevenueQueueCategory | null {
  const { account, renewalOutcome, revenueOutcome } = input;
  const outcome = revenueOutcome !== "open" ? revenueOutcome : renewalOutcome;

  if (outcome === "saved") return "saved";
  if (outcome === "renewed") return "renewed";
  if (outcome === "churned") return null;

  if (account.forecast.category === "at_risk") return "at_risk";
  if (account.forecast.category === "expiring_soon") return "expiring_soon";

  if (
    account.scores.riskScore >= 55 ||
    account.forecast.category === "needs_outreach" ||
    account.scores.renewalLikelihood < 55
  ) {
    return "churn_risk";
  }

  if (account.forecast.outreachRecommended) return "churn_risk";

  return null;
}

function deriveNextAction(
  revenueOps: RevenueOpsRecord,
  account: AccountHealthRow,
): string {
  if (revenueOps.outcome === "saved") return "已挽留 — 确认回款";
  if (revenueOps.outcome === "renewed") return "已续约 — 归档收入";
  if (revenueOps.outcome === "churned") return "已流失 — 收入复盘";
  if (revenueOps.escalationLevel > 0) return `已升级 L${revenueOps.escalationLevel} — 高管跟进`;
  if (!revenueOps.ownerId) return "分配收入负责人";
  if (revenueOps.scheduledFollowUpAt) {
    return `计划跟进 ${new Date(revenueOps.scheduledFollowUpAt).toLocaleDateString()}`;
  }
  if (account.forecast.category === "at_risk") return "高风险收入干预";
  if (account.forecast.category === "expiring_soon") return "续约窗口收入确认";
  return "收入风险监控";
}

export function buildRevenueQueueItem(
  account: AccountHealthRow,
  organizationId: string,
  revenueQueue: RevenueQueueCategory,
  queuePosition: number,
): RevenueQueueItem {
  const expectedValue = resolveExpectedRenewalValue(account.sessionId);
  const renewalOps = resolveRenewalOps(account.sessionId, organizationId);
  const revenueOps = resolveRevenueOps(account.sessionId, organizationId, expectedValue);
  const outcome =
    revenueOps.outcome !== "open" ? revenueOps.outcome : renewalOps.outcome;

  return {
    sessionId: account.sessionId,
    releasePackageId: account.releasePackageId,
    projectName: account.projectName,
    revenueQueue,
    queuePosition,
    expectedRenewalValue: expectedValue,
    weightedValue: computeWeightedValue(expectedValue, account.scores.renewalLikelihood),
    daysUntilRenewal: account.forecast.daysUntilRenewal,
    renewalDate: account.forecast.renewalDate,
    riskScore: account.scores.riskScore,
    renewalLikelihood: account.scores.renewalLikelihood,
    ownerId: revenueOps.ownerId ?? renewalOps.ownerId,
    ownerName: revenueOps.ownerName ?? renewalOps.ownerName,
    opsStatus: revenueOps.status,
    outcome,
    escalationLevel: revenueOps.escalationLevel,
    nextAction: deriveNextAction(revenueOps, account),
    openRisks: account.openRisks,
    renewalOps,
    revenueOps,
    readOnly: true,
  };
}

export function buildRevenuePipeline(organizationId: string): {
  saved: RevenueQueueItem[];
  renewed: RevenueQueueItem[];
  churnRisk: RevenueQueueItem[];
  expiringSoon: RevenueQueueItem[];
  atRisk: RevenueQueueItem[];
  allItems: RevenueQueueItem[];
  churnedRecords: Array<{ sessionId: string; expectedRenewalValue: number }>;
} {
  const health = buildAccountHealthDashboard(organizationId);

  const saved: RevenueQueueItem[] = [];
  const renewed: RevenueQueueItem[] = [];
  const churnRisk: RevenueQueueItem[] = [];
  const expiringSoon: RevenueQueueItem[] = [];
  const atRisk: RevenueQueueItem[] = [];
  const churnedRecords: Array<{ sessionId: string; expectedRenewalValue: number }> = [];

  for (const account of health.accounts) {
    const renewalOps = resolveRenewalOps(account.sessionId, organizationId);
    const revenueOps = getRevenueOpsRecord(account.sessionId, organizationId);
    const renewalOutcome = renewalOps.outcome;
    const revenueOutcome = revenueOps?.outcome ?? "open";

    if (renewalOutcome === "churned" || revenueOutcome === "churned") {
      churnedRecords.push({
        sessionId: account.sessionId,
        expectedRenewalValue: resolveExpectedRenewalValue(account.sessionId),
      });
      continue;
    }

    const queue = classifyRevenueQueue({ account, renewalOutcome, revenueOutcome });
    if (!queue) continue;

    const item = buildRevenueQueueItem(account, organizationId, queue, 0);
    switch (queue) {
      case "saved":
        saved.push(item);
        break;
      case "renewed":
        renewed.push(item);
        break;
      case "churn_risk":
        churnRisk.push(item);
        break;
      case "expiring_soon":
        expiringSoon.push(item);
        break;
      case "at_risk":
        atRisk.push(item);
        break;
    }
  }

  const sortFn = (a: RevenueQueueItem, b: RevenueQueueItem) => {
    if (a.expectedRenewalValue !== b.expectedRenewalValue) {
      return b.expectedRenewalValue - a.expectedRenewalValue;
    }
    return a.daysUntilRenewal - b.daysUntilRenewal;
  };

  for (const list of [saved, renewed, churnRisk, expiringSoon, atRisk]) {
    list.sort(sortFn);
    list.forEach((item, i) => {
      item.queuePosition = i + 1;
    });
  }

  const allItems = [...saved, ...renewed, ...churnRisk, ...expiringSoon, ...atRisk].sort(sortFn);

  return { saved, renewed, churnRisk, expiringSoon, atRisk, allItems, churnedRecords };
}
