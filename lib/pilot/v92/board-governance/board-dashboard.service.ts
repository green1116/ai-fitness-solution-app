/**
 * V92 — Board governance dashboard (read V91 portfolio ops + governance state)
 */

import { buildPortfolioOpsDashboard } from "@/lib/pilot/v91";

import { buildBoardAccountView } from "./board-review.service";
import { getGovernanceRecord, listGovernanceActions } from "./governance.store";
import {
  buildExecutiveGovernancePipeline,
  buildExecutiveQueueItem,
  classifyExecutiveQueue,
} from "./governance-pipeline.service";
import type { BoardGovernanceDashboard, BoardGovernanceDetail } from "./governance.types";
import { V92_BOARD_GOVERNANCE_VERSION } from "./governance.types";
import { listGovernanceRecordsForOrg } from "./governance.store";

export function buildBoardGovernanceDashboard(
  organizationId: string,
): BoardGovernanceDashboard {
  const pipeline = buildExecutiveGovernancePipeline(organizationId);
  const closedRecords = listGovernanceRecordsForOrg(organizationId);

  const summary = {
    total: pipeline.allItems.length,
    enterprisePriority: pipeline.enterprisePriority.length,
    expansionReady: pipeline.expansionReady.length,
    atRisk: pipeline.atRisk.length,
    rescue: pipeline.rescue.length,
    followUpNeeded: pipeline.followUpNeeded.length,
    approved: closedRecords.filter((r) => r.outcome === "approved").length,
    deferred: closedRecords.filter((r) => r.outcome === "deferred").length,
    blocked: pipeline.closedRecords.filter((r) => r.outcome === "blocked").length,
    inBoardReview: closedRecords.filter((r) => r.status === "board_review").length,
  };

  return {
    version: V92_BOARD_GOVERNANCE_VERSION,
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
  const dashboard = buildBoardGovernanceDashboard(organizationId);
  const existing = dashboard.allItems.find((i) => i.sessionId === sessionId);
  if (existing) return existing;

  const portfolioOps = buildPortfolioOpsDashboard(organizationId);
  const opsItem = portfolioOps.allItems.find((i) => i.sessionId === sessionId);
  if (!opsItem) return null;

  const governance = getGovernanceRecord(sessionId, organizationId);
  const governanceOutcome = governance?.outcome ?? "open";
  const queue = classifyExecutiveQueue({ opsItem, governanceOutcome });

  if (!queue) {
    if (governanceOutcome === "approved") {
      return buildExecutiveQueueItem(opsItem, organizationId, "enterprise_priority", 0);
    }
    if (governanceOutcome === "deferred") {
      return buildExecutiveQueueItem(opsItem, organizationId, "follow_up_needed", 0);
    }
    if (governanceOutcome === "blocked") {
      return buildExecutiveQueueItem(opsItem, organizationId, "rescue", 0);
    }
    return null;
  }

  return buildExecutiveQueueItem(opsItem, organizationId, queue, 0);
}

export function buildBoardGovernanceDetail(
  sessionId: string,
  organizationId: string,
): BoardGovernanceDetail {
  const queueItem = findOrBuildQueueItem(sessionId, organizationId);
  if (!queueItem) throw new Error("NOT_RELEASED");

  const boardView = buildBoardAccountView(queueItem.opsItem, organizationId);

  return {
    sessionId,
    boardView,
    queueItem,
    decisionHistory: listGovernanceActions(sessionId),
    readOnly: true,
  };
}
