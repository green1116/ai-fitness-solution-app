/**
 * V89 — Expansion ops & account growth types
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import type { GrowthPlanningQueue, GrowthPlanningQueueItem } from "@/lib/pilot/v88";

export const V89_EXPANSION_OPS_VERSION = "v89-expansion-ops-1";

export type ExpansionQueue =
  | "expansion_target"
  | "high_value_retain"
  | "forecast_watch"
  | "churn_rescue";

export type ExpansionOutcome = "open" | "expanded" | "retained" | "lost";

export type ExpansionOpsStatus =
  | "queued"
  | "qualified"
  | "proposing"
  | "expanded"
  | "retained"
  | "lost";

export type ExpansionOpsActionType =
  | "assign_owner"
  | "schedule_expansion_follow_up"
  | "record_proposal"
  | "mark_expanded"
  | "mark_retained"
  | "mark_lost";

export type ExpansionOpsRecord = {
  sessionId: string;
  organizationId: string;
  ownerId?: string;
  ownerName?: string;
  status: ExpansionOpsStatus;
  outcome: ExpansionOutcome;
  expansionOpportunity: number;
  proposalCount: number;
  lastProposalAt?: string;
  scheduledFollowUpAt?: string;
  expandedAt?: string;
  retainedAt?: string;
  lostAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpansionOpsActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: ExpansionOpsActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type ExpansionQueueItem = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  expansionQueue: ExpansionQueue;
  queuePosition: number;
  expansionOpportunity: number;
  baseRenewalValue: number;
  predictedValue: number;
  daysUntilRenewal: number;
  riskScore: number;
  renewalLikelihood: number;
  ownerId?: string;
  ownerName?: string;
  opsStatus: ExpansionOpsStatus;
  outcome: ExpansionOutcome;
  proposalCount: number;
  nextAction: string;
  openRisks: string[];
  growthItem: GrowthPlanningQueueItem;
  expansionOps: ExpansionOpsRecord;
  readOnly: true;
};

export type AccountGrowthView = {
  sessionId: string;
  customer: {
    projectName?: string;
    fileName?: string;
    releasePackageId?: string;
    signedOffAt?: string;
  };
  currentState: {
    growthOutcome: string;
    growthStatus: string;
    revenueQueue?: string;
    planningQueue: GrowthPlanningQueue;
    expansionStatus: ExpansionOpsStatus;
    expansionOutcome: ExpansionOutcome;
  };
  expansionOpportunity: number;
  risk: {
    riskScore: number;
    renewalLikelihood: number;
    openRisks: string[];
  };
  nextAction: string;
  readOnly: true;
};

export type ExpansionOpsDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  queues: {
    expansionTarget: ExpansionQueueItem[];
    highValueRetain: ExpansionQueueItem[];
    forecastWatch: ExpansionQueueItem[];
    churnRescue: ExpansionQueueItem[];
  };
  allItems: ExpansionQueueItem[];
  summary: {
    total: number;
    expansionTarget: number;
    highValueRetain: number;
    forecastWatch: number;
    churnRescue: number;
    expanded: number;
    retained: number;
    lost: number;
    proposing: number;
  };
  readOnly: true;
};

export type ExpansionOpsDetail = {
  sessionId: string;
  account: AccountHealthRow;
  accountGrowth: AccountGrowthView;
  queueItem: ExpansionQueueItem;
  actionHistory: ExpansionOpsActionEntry[];
  readOnly: true;
};

export function mapPlanningToExpansionQueue(
  planningQueue: GrowthPlanningQueue,
): ExpansionQueue {
  return planningQueue;
}
