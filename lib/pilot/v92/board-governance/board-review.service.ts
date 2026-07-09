/**
 * V92 — Board account view (read from V91 portfolio ops)
 */

import type { PortfolioOpsQueueItem } from "@/lib/pilot/v91";

import { getGovernanceRecord } from "./governance.store";
import type { BoardAccountView, GovernanceRecord } from "./governance.types";

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

function deriveNextDecision(
  opsItem: PortfolioOpsQueueItem,
  governance: GovernanceRecord,
): string {
  if (governance.outcome === "approved") return "董事会已批准";
  if (governance.outcome === "deferred") return "决策已延期";
  if (governance.outcome === "blocked") return "决策已阻断";
  if (!governance.executiveOwnerId) return "分配高管负责人";
  if (governance.scheduledBoardReviewAt) {
    return `董事会评审 ${new Date(governance.scheduledBoardReviewAt).toLocaleDateString()}`;
  }
  if (governance.status === "board_review") return "等待董事会决议";
  return opsItem.nextAction;
}

export function buildBoardAccountView(
  opsItem: PortfolioOpsQueueItem,
  organizationId: string,
): BoardAccountView {
  const account = opsItem.portfolioAccount;
  const governance =
    getGovernanceRecord(opsItem.sessionId, organizationId) ??
    defaultGovernance(opsItem.sessionId, organizationId, opsItem.expectedValue);

  return {
    sessionId: opsItem.sessionId,
    segment: account.primarySegment,
    segments: account.segments,
    value: {
      expectedValue: opsItem.expectedValue,
      expansionPotential: opsItem.expansionPotential,
      rankScore: opsItem.rankScore,
    },
    risk: {
      riskScore: opsItem.riskScore,
      churnExposure: account.churnExposure,
      openRisks: account.account.openRisks,
    },
    nextDecision: deriveNextDecision(opsItem, governance),
    readOnly: true,
  };
}
