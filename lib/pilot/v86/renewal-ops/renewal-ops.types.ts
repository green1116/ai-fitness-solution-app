/**
 * V86 — Renewal ops & churn prevention types
 */

import type { AccountHealthRow, RenewalForecastCategory } from "@/lib/pilot/v85";

export const V86_RENEWAL_OPS_VERSION = "v86-renewal-ops-1";

export type RenewalOutcome = "open" | "saved" | "renewed" | "churned";

export type RenewalOpsStatus =
  | "queued"
  | "in_outreach"
  | "negotiating"
  | "saved"
  | "renewed"
  | "churned";

export type RenewalPipelineQueue = "expiring_soon" | "outreach_needed" | "at_risk";

export type RenewalOpsActionType =
  | "assign_owner"
  | "schedule_outreach"
  | "renewal_attempt"
  | "mark_saved"
  | "mark_renewed"
  | "mark_churned";

export type RenewalOpsRecord = {
  sessionId: string;
  organizationId: string;
  ownerId?: string;
  ownerName?: string;
  status: RenewalOpsStatus;
  outcome: RenewalOutcome;
  outreachAttempts: number;
  lastOutreachAt?: string;
  scheduledOutreachAt?: string;
  savedAt?: string;
  renewedAt?: string;
  churnedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RenewalOpsActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: RenewalOpsActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type RenewalOpsQueueItem = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  pipelineQueue: RenewalPipelineQueue;
  queuePosition: number;
  forecastCategory: RenewalForecastCategory;
  daysUntilRenewal: number;
  renewalDate: string;
  riskScore: number;
  renewalLikelihood: number;
  accountHealthScore: number;
  ownerId?: string;
  ownerName?: string;
  opsStatus: RenewalOpsStatus;
  outcome: RenewalOutcome;
  nextAction: string;
  openRisks: string[];
  renewalOps: RenewalOpsRecord;
  readOnly: true;
};

export type RenewalOpsDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  queues: {
    expiringSoon: RenewalOpsQueueItem[];
    outreachNeeded: RenewalOpsQueueItem[];
    atRisk: RenewalOpsQueueItem[];
  };
  allItems: RenewalOpsQueueItem[];
  summary: {
    total: number;
    expiringSoon: number;
    outreachNeeded: number;
    atRisk: number;
    saved: number;
    renewed: number;
    churned: number;
    inOutreach: number;
  };
  readOnly: true;
};

export type RenewalOpsDetail = {
  sessionId: string;
  account: AccountHealthRow;
  queueItem: RenewalOpsQueueItem;
  actionHistory: RenewalOpsActionEntry[];
  readOnly: true;
};
