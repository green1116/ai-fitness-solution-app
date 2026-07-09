/**
 * V89 — Account growth view (read from growth / revenue / health)
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import type { GrowthPlanningQueueItem } from "@/lib/pilot/v88";

import { getExpansionOpsRecord } from "./expansion-ops.store";
import type { AccountGrowthView, ExpansionOpsRecord } from "./expansion-ops.types";

function defaultExpansionOps(
  sessionId: string,
  organizationId: string,
  expansionOpportunity: number,
): ExpansionOpsRecord {
  const now = new Date().toISOString();
  return {
    sessionId,
    organizationId,
    status: "queued",
    outcome: "open",
    expansionOpportunity,
    proposalCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildAccountGrowthView(
  account: AccountHealthRow,
  growthItem: GrowthPlanningQueueItem,
  organizationId: string,
  nextAction: string,
): AccountGrowthView {
  const expansionOps =
    getExpansionOpsRecord(account.sessionId, organizationId) ??
    defaultExpansionOps(account.sessionId, organizationId, growthItem.expansionPotential);

  return {
    sessionId: account.sessionId,
    customer: {
      projectName: account.projectName,
      fileName: account.fileName,
      releasePackageId: account.releasePackageId,
      signedOffAt: account.signedOffAt,
    },
    currentState: {
      growthOutcome: growthItem.outcome,
      growthStatus: growthItem.growthStatus,
      revenueQueue: growthItem.revenueQueue,
      planningQueue: growthItem.planningQueue,
      expansionStatus: expansionOps.status,
      expansionOutcome: expansionOps.outcome,
    },
    expansionOpportunity: growthItem.expansionPotential,
    risk: {
      riskScore: account.scores.riskScore,
      renewalLikelihood: account.scores.renewalLikelihood,
      openRisks: account.openRisks,
    },
    nextAction,
    readOnly: true,
  };
}
