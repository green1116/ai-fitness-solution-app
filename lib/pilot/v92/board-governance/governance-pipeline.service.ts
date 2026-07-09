/**
 * V92 — Executive governance queue (read from V91 portfolio ops)
 */

import { buildPortfolioOpsDashboard, type PortfolioOpsQueueItem } from "@/lib/pilot/v91";

import { getGovernanceRecord } from "./governance.store";
import type {
  ExecutiveQueue,
  ExecutiveQueueItem,
  GovernanceOutcome,
  GovernanceRecord,
} from "./governance.types";

function defaultGovernance(
  sessionId: string,
  organizationId: string,
  expectedValue: number,
): GovernanceRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expectedValue,
    decisionCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function resolveGovernance(
  sessionId: string,
  organizationId: string,
  expectedValue: number,
): GovernanceRecord {
  return (
    getGovernanceRecord(sessionId, organizationId) ??
    defaultGovernance(sessionId, organizationId, expectedValue)
  );
}

export function classifyExecutiveQueue(input: {
  opsItem: PortfolioOpsQueueItem;
  governanceOutcome: GovernanceOutcome;
}): ExecutiveQueue | null {
  const { opsItem, governanceOutcome } = input;

  if (
    governanceOutcome === "approved" ||
    governanceOutcome === "deferred" ||
    governanceOutcome === "blocked"
  ) {
    return null;
  }

  return opsItem.opsQueue;
}

function deriveNextDecision(
  governance: GovernanceRecord,
  opsItem: PortfolioOpsQueueItem,
): string {
  if (governance.outcome === "approved") return "已批准";
  if (governance.outcome === "deferred") return "已延期";
  if (governance.outcome === "blocked") return "已阻断";
  if (!governance.executiveOwnerId) return "分配高管负责人";
  if (governance.scheduledBoardReviewAt) {
    return `董事会 ${new Date(governance.scheduledBoardReviewAt).toLocaleDateString()}`;
  }
  return opsItem.nextAction;
}

export function buildExecutiveQueueItem(
  opsItem: PortfolioOpsQueueItem,
  organizationId: string,
  executiveQueue: ExecutiveQueue,
  queuePosition: number,
): ExecutiveQueueItem {
  const governance = resolveGovernance(
    opsItem.sessionId,
    organizationId,
    opsItem.expectedValue,
  );

  return {
    sessionId: opsItem.sessionId,
    releasePackageId: opsItem.releasePackageId,
    projectName: opsItem.projectName,
    executiveQueue,
    queuePosition,
    expectedValue: opsItem.expectedValue,
    expansionPotential: opsItem.expansionPotential,
    riskScore: opsItem.riskScore,
    rankScore: opsItem.rankScore,
    executiveOwnerId: governance.executiveOwnerId,
    executiveOwnerName: governance.executiveOwnerName,
    governanceStatus: governance.status,
    outcome: governance.outcome,
    nextDecision: deriveNextDecision(governance, opsItem),
    opsItem,
    governance,
    readOnly: true,
  };
}

export function buildExecutiveGovernancePipeline(organizationId: string): {
  enterprisePriority: ExecutiveQueueItem[];
  expansionReady: ExecutiveQueueItem[];
  atRisk: ExecutiveQueueItem[];
  rescue: ExecutiveQueueItem[];
  followUpNeeded: ExecutiveQueueItem[];
  allItems: ExecutiveQueueItem[];
  closedRecords: Array<{ sessionId: string; outcome: GovernanceOutcome }>;
} {
  const portfolioOps = buildPortfolioOpsDashboard(organizationId);

  const enterprisePriority: ExecutiveQueueItem[] = [];
  const expansionReady: ExecutiveQueueItem[] = [];
  const atRisk: ExecutiveQueueItem[] = [];
  const rescue: ExecutiveQueueItem[] = [];
  const followUpNeeded: ExecutiveQueueItem[] = [];
  const closedRecords: Array<{ sessionId: string; outcome: GovernanceOutcome }> = [];

  for (const opsItem of portfolioOps.allItems) {
    const stored = getGovernanceRecord(opsItem.sessionId, organizationId);
    const governanceOutcome = stored?.outcome ?? "open";

    if (
      governanceOutcome === "approved" ||
      governanceOutcome === "deferred" ||
      governanceOutcome === "blocked"
    ) {
      closedRecords.push({ sessionId: opsItem.sessionId, outcome: governanceOutcome });
      continue;
    }

    const queue = classifyExecutiveQueue({ opsItem, governanceOutcome });
    if (!queue) continue;

    const item = buildExecutiveQueueItem(opsItem, organizationId, queue, 0);

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

  const sortFn = (a: ExecutiveQueueItem, b: ExecutiveQueueItem) => {
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
