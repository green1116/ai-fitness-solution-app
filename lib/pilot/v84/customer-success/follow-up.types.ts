/**
 * V84 — Customer success follow-up & retention types
 */

import type { PriorityLevel, RecommendationAction } from "@/lib/pilot/v83";

export const V84_CUSTOMER_SUCCESS_VERSION = "v84-customer-success-1";

export type FollowUpStatus = "pending" | "in_progress" | "escalated" | "resolved";

export type ResponseStatus = "no_response" | "responded" | "declined" | "unknown";

export type ResolutionStatus = "open" | "resolved" | "escalated";

export type RetentionActionType =
  | "assign_owner"
  | "contact_attempt"
  | "escalate_hot"
  | "schedule_callback"
  | "send_reminder"
  | "mark_resolved";

export type FollowUpRecord = {
  sessionId: string;
  organizationId: string;
  ownerId?: string;
  ownerName?: string;
  status: FollowUpStatus;
  responseStatus: ResponseStatus;
  resolutionStatus: ResolutionStatus;
  contactAttempts: number;
  lastContactAt?: string;
  callbackScheduledAt?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RetentionActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: RetentionActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type CrmCustomerRow = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  fileName?: string;
  riskScore: number;
  priority: PriorityLevel;
  due: string;
  lastEventAt?: string;
  lastEventLabel?: string;
  recommendedAction: RecommendationAction;
  recommendedTitle: string;
  followUp: FollowUpRecord;
  readOnly: true;
};

export type FollowUpQueueItem = CrmCustomerRow & {
  queuePosition: number;
};

export type CrmDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  customers: CrmCustomerRow[];
  queue: FollowUpQueueItem[];
  summary: {
    total: number;
    pending: number;
    inProgress: number;
    escalated: number;
    resolved: number;
    hotAccounts: number;
  };
  readOnly: true;
};

export type SessionFollowUpDetail = {
  sessionId: string;
  customer: CrmCustomerRow;
  actionHistory: RetentionActionEntry[];
  intelligencePath: string;
  readOnly: true;
};
