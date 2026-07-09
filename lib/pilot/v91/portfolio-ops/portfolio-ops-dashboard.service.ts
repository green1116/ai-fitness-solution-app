/**
 * V91 — Portfolio ops dashboard (read V90 portfolio + portfolio ops state)
 */

import { buildPortfolioDashboard } from "@/lib/pilot/v90";

import { buildAccountStrategyView } from "./account-strategy.service";
import { getPortfolioOpsRecord, listPortfolioOpsActions } from "./portfolio-ops.store";
import {
  buildPortfolioOpsPipeline,
  buildPortfolioOpsQueueItem,
  classifyPortfolioOpsQueue,
} from "./portfolio-ops-pipeline.service";
import type { PortfolioOpsDashboard, PortfolioOpsDetail } from "./portfolio-ops.types";
import { V91_PORTFOLIO_OPS_VERSION } from "./portfolio-ops.types";
import { listPortfolioOpsRecordsForOrg } from "./portfolio-ops.store";

export function buildPortfolioOpsDashboard(organizationId: string): PortfolioOpsDashboard {
  const pipeline = buildPortfolioOpsPipeline(organizationId);
  const closedRecords = listPortfolioOpsRecordsForOrg(organizationId);

  const summary = {
    total: pipeline.allItems.length,
    enterprisePriority: pipeline.enterprisePriority.length,
    expansionReady: pipeline.expansionReady.length,
    atRisk: pipeline.atRisk.length,
    rescue: pipeline.rescue.length,
    followUpNeeded: pipeline.followUpNeeded.length,
    completed: closedRecords.filter((r) => r.outcome === "completed").length,
    deferred: closedRecords.filter((r) => r.outcome === "deferred").length,
    lost: pipeline.closedRecords.filter((r) => r.outcome === "lost").length,
    inReview: closedRecords.filter((r) => r.status === "in_review").length,
  };

  return {
    version: V91_PORTFOLIO_OPS_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    queues: {
      enterprisePriority: pipeline.enterprisePriority,
      expansionReady: pipeline.expansionReady,
      atRisk: pipeline.atRisk,
      rescue: pipeline.rescue,
      followUpNeeded: pipeline.followUpNeeded,
    },
    allItems: pipeline.allItems,
    summary,
    readOnly: true,
  };
}

function findOrBuildQueueItem(sessionId: string, organizationId: string) {
  const dashboard = buildPortfolioOpsDashboard(organizationId);
  const existing = dashboard.allItems.find((i) => i.sessionId === sessionId);
  if (existing) return existing;

  const portfolio = buildPortfolioDashboard(organizationId);
  const account = portfolio.rankedAccounts.find((a) => a.sessionId === sessionId);
  if (!account) return null;

  const ops = getPortfolioOpsRecord(sessionId, organizationId);
  const opsOutcome = ops?.outcome ?? "open";
  const queue = classifyPortfolioOpsQueue({ account, opsOutcome });

  if (!queue) {
    if (opsOutcome === "completed") {
      return buildPortfolioOpsQueueItem(account, organizationId, "enterprise_priority", 0);
    }
    if (opsOutcome === "deferred") {
      return buildPortfolioOpsQueueItem(account, organizationId, "follow_up_needed", 0);
    }
    if (opsOutcome === "lost") {
      return buildPortfolioOpsQueueItem(account, organizationId, "rescue", 0);
    }
    return null;
  }

  return buildPortfolioOpsQueueItem(account, organizationId, queue, 0);
}

export function buildPortfolioOpsDetail(
  sessionId: string,
  organizationId: string,
): PortfolioOpsDetail {
  const queueItem = findOrBuildQueueItem(sessionId, organizationId);
  if (!queueItem) throw new Error("NOT_RELEASED");

  const accountStrategy = buildAccountStrategyView(
    queueItem.portfolioAccount,
    organizationId,
  );

  return {
    sessionId,
    accountStrategy,
    queueItem,
    actionHistory: listPortfolioOpsActions(sessionId),
    readOnly: true,
  };
}
