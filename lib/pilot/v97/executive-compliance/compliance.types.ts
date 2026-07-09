/**
 * V97 — Executive compliance & retention policy types
 */

export const V97_EXECUTIVE_COMPLIANCE_VERSION = "v97-executive-compliance-1";

export const DEFAULT_RETENTION_WINDOW_DAYS = 365;
export const DEFAULT_REVIEW_WINDOW_DAYS = 90;

export type ComplianceDisposition = "keep" | "purge" | "hold";

export type ComplianceStatus =
  | "pending"
  | "reviewed"
  | "on_hold"
  | "purge_scheduled"
  | "expired"
  | "compliant";

export type ComplianceQueue =
  | "reviewed"
  | "pending_review"
  | "retention_required"
  | "export_requested"
  | "expired";

export type ComplianceActionType =
  | "assign_reviewer"
  | "mark_reviewed"
  | "mark_hold"
  | "mark_purge"
  | "request_export";

export type RetentionPolicyView = {
  retentionWindowDays: number;
  reviewWindowDays: number;
  disposition: ComplianceDisposition;
  complianceStatus: ComplianceStatus;
  reviewDueDate: string;
  expiresAt: string;
  readOnly: true;
};

export type ComplianceRecord = {
  id: string;
  organizationId: string;
  sessionId: string;
  archiveRecordId: string;
  projectName?: string;
  reviewerId?: string;
  reviewerName?: string;
  disposition: ComplianceDisposition;
  complianceStatus: ComplianceStatus;
  retentionWindowDays: number;
  archivedAt: string;
  reviewDueDate: string;
  expiresAt: string;
  reviewedAt?: string;
  holdAt?: string;
  purgeAt?: string;
  exportRequestedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ComplianceQueueItem = {
  sessionId: string;
  archiveRecordId: string;
  complianceRecordId?: string;
  projectName?: string;
  complianceQueue: ComplianceQueue;
  complianceStatus: ComplianceStatus;
  disposition: ComplianceDisposition;
  reviewDueDate: string;
  expiresAt: string;
  reviewerName?: string;
  isExpired: boolean;
  retentionPolicy: RetentionPolicyView;
  readOnly: true;
};

export type ComplianceActionEntry = {
  id: string;
  organizationId: string;
  actorId: string;
  action: ComplianceActionType;
  complianceRecordId?: string;
  archiveRecordId?: string;
  sessionId?: string;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type ComplianceExportResult = {
  organizationId: string;
  exportedAt: string;
  format: "json";
  sessionId: string;
  archiveRecordId: string;
  complianceRecordId?: string;
  payload: Record<string, unknown>;
  readOnly: true;
};

export type ExecutiveComplianceDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  policy: {
    retentionWindowDays: number;
    reviewWindowDays: number;
    readOnly: true;
  };
  queues: {
    reviewed: ComplianceQueueItem[];
    pendingReview: ComplianceQueueItem[];
    retentionRequired: ComplianceQueueItem[];
    exportRequested: ComplianceQueueItem[];
    expired: ComplianceQueueItem[];
  };
  allItems: ComplianceQueueItem[];
  summary: {
    total: number;
    reviewed: number;
    pendingReview: number;
    retentionRequired: number;
    exportRequested: number;
    expired: number;
    onHold: number;
    purgeScheduled: number;
    exportsRequested: number;
  };
  recentActions: ComplianceActionEntry[];
  readOnly: true;
};
