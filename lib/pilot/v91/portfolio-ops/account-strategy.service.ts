/**
 * V91 — Account strategy view (read from V90 portfolio intelligence)
 */

import type { PortfolioAccountRow } from "@/lib/pilot/v90";

import { getPortfolioOpsRecord } from "./portfolio-ops.store";
import type { AccountStrategyView, PortfolioOpsRecord } from "./portfolio-ops.types";

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

function deriveStrategicAction(
  row: PortfolioAccountRow,
  ops: PortfolioOpsRecord,
): string {
  if (ops.outcome === "completed") return "战略行动已完成";
  if (ops.outcome === "deferred") return "已延期 — 重新排期";
  if (ops.outcome === "lost") return "已流失 — 战略复盘";
  if (!ops.ownerId) return "分配组合负责人";
  if (ops.scheduledReviewAt) {
    return `战略评审 ${new Date(ops.scheduledReviewAt).toLocaleDateString()}`;
  }
  if (ops.status === "in_review") return "执行战略评审";
  return row.nextAction;
}

export function buildAccountStrategyView(
  portfolioAccount: PortfolioAccountRow,
  organizationId: string,
): AccountStrategyView {
  const ops =
    getPortfolioOpsRecord(portfolioAccount.sessionId, organizationId) ??
    defaultOps(
      portfolioAccount.sessionId,
      organizationId,
      portfolioAccount.expectedValue,
    );

  return {
    sessionId: portfolioAccount.sessionId,
    segment: portfolioAccount.primarySegment,
    segments: portfolioAccount.segments,
    health: {
      segmentHealthScore: portfolioAccount.segmentHealthScore,
      renewalLikelihood: portfolioAccount.renewalLikelihood,
      accountHealthScore: portfolioAccount.account.scores.accountHealthScore,
    },
    value: {
      expectedValue: portfolioAccount.expectedValue,
      expansionPotential: portfolioAccount.expansionPotential,
      rankScore: portfolioAccount.rankScore,
    },
    risk: {
      riskScore: portfolioAccount.riskScore,
      churnExposure: portfolioAccount.churnExposure,
      openRisks: portfolioAccount.account.openRisks,
    },
    nextStrategicAction: deriveStrategicAction(portfolioAccount, ops),
    readOnly: true,
  };
}
