/**
 * V96 — Executive archive & audit retrieval types
 */

import type { GovernanceActionEntry } from "@/lib/pilot/v92";
import type { BriefingActionEntry } from "@/lib/pilot/v94";
import type { ExecutiveActionEntry, ExecutiveActionOutcome } from "@/lib/pilot/v95";

export const V96_EXECUTIVE_ARCHIVE_VERSION = "v96-executive-archive-1";

export type ArchiveQueue =
  | "closed"
  | "acted"
  | "deferred"
  | "overdue_resolved"
  | "archived";

export type ArchiveRecordStatus = "active" | "archived" | "reviewed";

export type LinkedIds = {
  sessionId: string;
  briefingPackIds: string[];
  boardPacketIds: string[];
  governanceActionIds: string[];
  executiveActionIds: string[];
  briefingActionIds: string[];
  readOnly: true;
};

export type ArchiveRecord = {
  id: string;
  organizationId: string;
  sessionId: string;
  projectName?: string;
  archiveQueue: ArchiveQueue;
  outcome: ExecutiveActionOutcome;
  linkedIds: LinkedIds;
  status: ArchiveRecordStatus;
  archivedAt?: string;
  reviewedAt?: string;
  restoredAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveQueueItem = {
  sessionId: string;
  projectName?: string;
  archiveQueue: ArchiveQueue;
  outcome: ExecutiveActionOutcome;
  archiveRecordId?: string;
  status: ArchiveRecordStatus;
  closedAt?: string;
  linkedIds: LinkedIds;
  readOnly: true;
};

export type AuditTrail = {
  sessionId: string;
  projectName?: string;
  executiveActionHistory: ExecutiveActionEntry[];
  briefingPackHistory: Array<{
    packId: string;
    title: string;
    generatedAt: string;
    status: string;
  }>;
  briefingActionHistory: BriefingActionEntry[];
  decisionTrail: GovernanceActionEntry[];
  closureTrail: ExecutiveActionEntry[];
  linkedIds: LinkedIds;
  readOnly: true;
};

export type ArchiveActionType =
  | "archive_record"
  | "restore_view"
  | "export_audit_bundle"
  | "mark_reviewed";

export type ArchiveActionEntry = {
  id: string;
  organizationId: string;
  actorId: string;
  action: ArchiveActionType;
  archiveRecordId?: string;
  sessionId?: string;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type AuditBundleExport = {
  organizationId: string;
  exportedAt: string;
  format: "json";
  sessionId?: string;
  archiveRecordId?: string;
  payload: {
    trail?: AuditTrail;
    archiveRecord?: ArchiveRecord;
    searchResults?: ArchiveQueueItem[];
  };
  readOnly: true;
};

export type ExecutiveArchiveDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  queues: {
    closed: ArchiveQueueItem[];
    acted: ArchiveQueueItem[];
    deferred: ArchiveQueueItem[];
    overdueResolved: ArchiveQueueItem[];
    archived: ArchiveQueueItem[];
  };
  allItems: ArchiveQueueItem[];
  summary: {
    total: number;
    closed: number;
    acted: number;
    deferred: number;
    overdueResolved: number;
    archived: number;
    reviewed: number;
    exportsCount: number;
  };
  recentActions: ArchiveActionEntry[];
  readOnly: true;
};

export type ArchiveSearchResult = {
  query: string;
  matches: ArchiveQueueItem[];
  trails: AuditTrail[];
  readOnly: true;
};
