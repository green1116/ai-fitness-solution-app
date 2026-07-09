/**
 * V91 — Portfolio ops queue (read from V90 portfolio prioritization)
 */

import { buildPortfolioDashboard, type PortfolioAccountRow } from "@/lib/pilot/v90";

import { getPortfolioOpsRecord } from "./portfolio-ops.store";
import type {
  PortfolioOpsOutcome,
  PortfolioOpsQueue,
  PortfolioOpsQueueItem,
  PortfolioOpsRecord,
} from "./portfolio-ops.types";

function defaultOps(
  sessionId: string,
  organizationId: string,
  expectedValue: number,
): PortfolioOpsRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expectedValue,
    actionCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveOps(
  sessionId: string,
  organizationId: string,
  expectedValue: number,
): PortfolioOpsRecord {
  return (
    getPortfolioOpsRecord(sessionId, organizationId) ??
    defaultOps(sessionId, organizationId, expectedValue)
  );
}

export function classifyPortfolioOpsQueue(input: {
  account: PortfolioAccountRow;
  opsOutcome: PortfolioOpsOutcome;
}): PortfolioOpsQueue | null {
  const { account, opsOutcome } = input;

  if (
    opsOutcome === "completed" ||
    opsOutcome === "deferred" ||
    opsOutcome === "lost"
  ) {
    return null;
  }

  if (account.segments.includes("churn_rescue")) return "rescue";
  if (account.segments.includes("at_risk")) return "at_risk";
  if (account.segments.includes("enterprise")) return "enterprise_priority";
  if (account.segments.includes("expansion_ready")) return "expansion_ready";
  if (account.segments.includes("follow_up_needed")) return "follow_up_needed";

  switch (account.primarySegment) {
    case "churn_rescue":
      return "rescue";
    case "at_risk":
      return "at_risk";
    case "enterprise":
      return "enterprise_priority";
    case "expansion_ready":
      return "expansion_ready";
    case "follow_up_needed":
      return "follow_up_needed";
    default:
      return "follow_up_needed";
  }
}

function deriveNextAction(
  ops: PortfolioOpsRecord,
  account: PortfolioAccountRow,
  queue: PortfolioOpsQueue,
): string {
  if (ops.outcome === "completed") return "已完成";
  if (ops.outcome === "deferred") return "已延期";
  if (ops.outcome === "lost") return "已流失";
  if (!ops.ownerId) return "分配组合负责人";
  if (ops.scheduledReviewAt) {
    return `战略评审 ${new Date(ops.scheduledReviewAt).toLocaleDateString()}`;
  }
  switch (queue) {
    case "enterprise_priority":
      return "企业级战略回顾";
    case "expansion_ready":
      return "推进扩展战略";
    case "at_risk":
      return "风险干预计划";
    case "rescue":
      return "紧急救援行动";
    case "follow_up_needed":
      return account.nextAction;
  }
}

export function buildPortfolioOpsQueueItem(
  account: PortfolioAccountRow,
  organizationId: string,
  opsQueue: PortfolioOpsQueue,
  queuePosition: number,
): PortfolioOpsQueueItem {
  const ops = resolveOps(account.sessionId, organizationId, account.expectedValue);

  return {
    sessionId: account.sessionId,
    releasePackageId: account.releasePackageId,
    projectName: account.projectName,
    opsQueue,
    queuePosition,
    expectedValue: account.expectedValue,
    expansionPotential: account.expansionPotential,
    riskScore: account.riskScore,
    rankScore: account.rankScore,
    ownerId: ops.ownerId,
    ownerName: ops.ownerName,
    opsStatus: ops.status,
    outcome: ops.outcome,
    nextAction: deriveNextAction(ops, account, opsQueue),
    portfolioAccount: account,
    portfolioOps: ops,
    readOnly: true,
  };
}

export function buildPortfolioOpsPipeline(organizationId: string): {
  enterprisePriority: PortfolioOpsQueueItem[];
  expansionReady: PortfolioOpsQueueItem[];
  atRisk: PortfolioOpsQueueItem[];
  rescue: PortfolioOpsQueueItem[];
  followUpNeeded: PortfolioOpsQueueItem[];
  allItems: PortfolioOpsQueueItem[];
  closedRecords: Array<{ sessionId: string; outcome: PortfolioOpsOutcome }>;
} {
  const portfolio = buildPortfolioDashboard(organizationId);

  const enterprisePriority: PortfolioOpsQueueItem[] = [];
  const expansionReady: PortfolioOpsQueueItem[] = [];
  const atRisk: PortfolioOpsQueueItem[] = [];
  const rescue: PortfolioOpsQueueItem[] = [];
  const followUpNeeded: PortfolioOpsQueueItem[] = [];
  const closedRecords: Array<{ sessionId: string; outcome: PortfolioOpsOutcome }> = [];

  for (const account of portfolio.rankedAccounts) {
    const stored = getPortfolioOpsRecord(account.sessionId, organizationId);
    const opsOutcome = stored?.outcome ?? "open";

    if (
      opsOutcome === "completed" ||
      opsOutcome === "deferred" ||
      opsOutcome === "lost"
    ) {
      closedRecords.push({ sessionId: account.sessionId, outcome: opsOutcome });
      continue;
    }

    const queue = classifyPortfolioOpsQueue({ account, opsOutcome });
    if (!queue) continue;

    const item = buildPortfolioOpsQueueItem(account, organizationId, queue, 0);

    switch (queue) {
      case "enterprise_priority":
        enterprisePriority.push(item);
        break;
      case "expansion_ready":
        expansionReady.push(item);
        break;
      case "at_risk":
        atRisk.push(item);
        break;
      case "rescue":
        rescue.push(item);
        break;
      case "follow_up_needed":
        followUpNeeded.push(item);
        break;
    }
  }

  const sortFn = (a: PortfolioOpsQueueItem, b: PortfolioOpsQueueItem) => {
    if (a.rankScore !== b.rankScore) return b.rankScore - a.rankScore;
    return b.expectedValue - a.expectedValue;
  };

  for (const list of [
    enterprisePriority,
    expansionReady,
    atRisk,
    rescue,
    followUpNeeded,
  ]) {
    list.sort(sortFn);
    list.forEach((item, i) => {
      item.queuePosition = i + 1;
    });
  }

  const allItems = [
    ...enterprisePriority,
    ...expansionReady,
    ...atRisk,
    ...rescue,
    ...followUpNeeded,
  ].sort(sortFn);

  return {
    enterprisePriority,
    expansionReady,
    atRisk,
    rescue,
    followUpNeeded,
    allItems,
    closedRecords,
  };
}
