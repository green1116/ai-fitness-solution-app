/**
 * V98 — Policy enforcement & automation types
 */

export const V98_POLICY_ENFORCEMENT_VERSION = "v98-policy-enforcement-1";

export type PolicyDueType =
  | "review_due"
  | "retention_due"
  | "purge_due"
  | "export_due"
  | "hold_required";

export type EnforcementStatus = "pending" | "enforced" | "blocked" | "completed";

export type EnforcementActionType =
  | "auto_assign_reviewer"
  | "auto_mark_due"
  | "auto_hold"
  | "auto_purge"
  | "auto_request_export";

export type EnforcementRecord = {
  id: string;
  organizationId: string;
  sessionId: string;
  archiveRecordId: string;
  complianceRecordId?: string;
  projectName?: string;
  policyDue: PolicyDueType;
  policyStatus: EnforcementStatus;
  dueDate: string;
  nextStep: string;
  blockedReason?: string;
  reviewerId?: string;
  reviewerName?: string;
  enforcedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PolicyQueueItem = {
  sessionId: string;
  archiveRecordId: string;
  complianceRecordId?: string;
  projectName?: string;
  policyDue: PolicyDueType;
  policyStatus: EnforcementStatus;
  dueDate: string;
  nextStep: string;
  isBlocked: boolean;
  blockedReason?: string;
  enforcementRecordId?: string;
  readOnly: true;
};

export type EnforcementActionEntry = {
  id: string;
  organizationId: string;
  actorId: string;
  action: EnforcementActionType;
  enforcementRecordId?: string;
  archiveRecordId?: string;
  sessionId?: string;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type EnforcementView = {
  policyStatus: EnforcementStatus;
  dueDates: {
    reviewDue?: string;
    retentionDue?: string;
    purgeDue?: string;
    exportDue?: string;
  };
  blockedItems: PolicyQueueItem[];
  nextStep: string;
  actionHistory: EnforcementActionEntry[];
  readOnly: true;
};

export type PolicyEnforcementDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  queues: {
    reviewDue: PolicyQueueItem[];
    retentionDue: PolicyQueueItem[];
    purgeDue: PolicyQueueItem[];
    exportDue: PolicyQueueItem[];
    holdRequired: PolicyQueueItem[];
  };
  allItems: PolicyQueueItem[];
  enforcement: EnforcementView;
  summary: {
    total: number;
    reviewDue: number;
    retentionDue: number;
    purgeDue: number;
    exportDue: number;
    holdRequired: number;
    blocked: number;
    enforced: number;
    actionsTaken: number;
  };
  recentActions: EnforcementActionEntry[];
  readOnly: true;
};
