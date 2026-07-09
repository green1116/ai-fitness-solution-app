/**
 * V88 — Growth planning & forecast types
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import type { RevenueQueueCategory, RevenueQueueItem } from "@/lib/pilot/v87";

export const V88_GROWTH_PLANNING_VERSION = "v88-growth-planning-1";

export type GrowthPlanningQueue =
  | "high_value_retain"
  | "expansion_target"
  | "churn_rescue"
  | "forecast_watch";

export type GrowthOutcome = "open" | "retained" | "expanded" | "lost";

export type GrowthOpsStatus =
  | "queued"
  | "planning"
  | "active"
  | "retained"
  | "expanded"
  | "lost";

export type GrowthOpsActionType =
  | "assign_growth_owner"
  | "schedule_expansion_follow_up"
  | "mark_retained"
  | "mark_expanded"
  | "mark_lost"
  | "log_outcome";

export type GrowthOpsRecord = {
  sessionId: string;
  organizationId: string;
  ownerId?: string;
  ownerName?: string;
  status: GrowthOpsStatus;
  outcome: GrowthOutcome;
  baseRenewalValue: number;
  expansionPotential: number;
  scheduledExpansionFollowUpAt?: string;
  retainedAt?: string;
  expandedAt?: string;
  lostAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type GrowthOpsActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: GrowthOpsActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type GrowthForecastSummary = {
  predictedRenewalRevenue: number;
  expansionOpportunity: number;
  churnExposure: number;
  netGrowthOutlook: number;
  readOnly: true;
};

export type GrowthPlanningQueueItem = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  planningQueue: GrowthPlanningQueue;
  queuePosition: number;
  baseRenewalValue: number;
  expansionPotential: number;
  weightedRenewalValue: number;
  predictedValue: number;
  daysUntilRenewal: number;
  renewalDate: string;
  riskScore: number;
  renewalLikelihood: number;
  revenueQueue?: RevenueQueueCategory;
  ownerId?: string;
  ownerName?: string;
  growthStatus: GrowthOpsStatus;
  outcome: GrowthOutcome;
  nextAction: string;
  openRisks: string[];
  revenueItem: RevenueQueueItem | null;
  growthOps: GrowthOpsRecord;
  readOnly: true;
};

export type GrowthPlanningDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  forecast: GrowthForecastSummary;
  queues: {
    highValueRetain: GrowthPlanningQueueItem[];
    expansionTarget: GrowthPlanningQueueItem[];
    churnRescue: GrowthPlanningQueueItem[];
    forecastWatch: GrowthPlanningQueueItem[];
  };
  allItems: GrowthPlanningQueueItem[];
  summary: {
    total: number;
    highValueRetain: number;
    expansionTarget: number;
    churnRescue: number;
    forecastWatch: number;
    retained: number;
    expanded: number;
    lost: number;
  };
  readOnly: true;
};

export type GrowthPlanningDetail = {
  sessionId: string;
  account: AccountHealthRow;
  queueItem: GrowthPlanningQueueItem;
  actionHistory: GrowthOpsActionEntry[];
  readOnly: true;
};
