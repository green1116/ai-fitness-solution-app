/**
 * V87 — Revenue ops & forecast control types
 */

import type { AccountHealthRow } from "@/lib/pilot/v85";
import type { RenewalOpsRecord, RenewalOutcome } from "@/lib/pilot/v86";

export const V87_REVENUE_OPS_VERSION = "v87-revenue-ops-1";

export type RevenueQueueCategory =
  | "saved"
  | "renewed"
  | "churn_risk"
  | "expiring_soon"
  | "at_risk";

export type RevenueOpsOutcome = RenewalOutcome;

export type RevenueOpsStatus =
  | "queued"
  | "in_control"
  | "escalated"
  | "saved"
  | "renewed"
  | "churned";

export type RevenueOpsActionType =
  | "assign_owner"
  | "escalate"
  | "schedule_follow_up"
  | "mark_saved"
  | "mark_renewed"
  | "mark_churned";

export type RevenueOpsRecord = {
  sessionId: string;
  organizationId: string;
  ownerId?: string;
  ownerName?: string;
  status: RevenueOpsStatus;
  outcome: RevenueOpsOutcome;
  expectedRenewalValue: number;
  escalationLevel: number;
  escalatedAt?: string;
  scheduledFollowUpAt?: string;
  savedAt?: string;
  renewedAt?: string;
  churnedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RevenueOpsActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: RevenueOpsActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type RevenueForecastSummary = {
  expectedRenewalValue: number;
  atRiskRevenue: number;
  savedRevenue: number;
  renewedRevenue: number;
  churnedRevenue: number;
  readOnly: true;
};

export type RevenueQueueItem = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  revenueQueue: RevenueQueueCategory;
  queuePosition: number;
  expectedRenewalValue: number;
  weightedValue: number;
  daysUntilRenewal: number;
  renewalDate: string;
  riskScore: number;
  renewalLikelihood: number;
  ownerId?: string;
  ownerName?: string;
  opsStatus: RevenueOpsStatus;
  outcome: RevenueOpsOutcome;
  escalationLevel: number;
  nextAction: string;
  openRisks: string[];
  renewalOps: RenewalOpsRecord;
  revenueOps: RevenueOpsRecord;
  readOnly: true;
};

export type RevenueOpsDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  forecast: RevenueForecastSummary;
  queues: {
    saved: RevenueQueueItem[];
    renewed: RevenueQueueItem[];
    churnRisk: RevenueQueueItem[];
    expiringSoon: RevenueQueueItem[];
    atRisk: RevenueQueueItem[];
  };
  allItems: RevenueQueueItem[];
  summary: {
    total: number;
    saved: number;
    renewed: number;
    churnRisk: number;
    expiringSoon: number;
    atRisk: number;
    churned: number;
    escalated: number;
  };
  readOnly: true;
};

export type RevenueOpsDetail = {
  sessionId: string;
  account: AccountHealthRow;
  queueItem: RevenueQueueItem;
  actionHistory: RevenueOpsActionEntry[];
  readOnly: true;
};
