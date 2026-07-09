/**
 * V95 — Executive actions & governance closure types
 */

import type { BriefingPriority } from "@/lib/pilot/v94";

export const V95_EXECUTIVE_ACTIONS_VERSION = "v95-executive-actions-1";

export type ExecutiveActionQueue =
  | "priority_decision"
  | "risk_mitigation"
  | "opportunity_capture"
  | "overdue_action";

export type ExecutiveActionOutcome = "open" | "acted" | "deferred" | "closed";

export type ExecutiveActionStatus =
  | "queued"
  | "assigned"
  | "confirmed"
  | "acted"
  | "deferred"
  | "closed";

export type ExecutiveActionType =
  | "assign_executive_owner"
  | "confirm_decision"
  | "mark_acted"
  | "mark_deferred"
  | "mark_closed"
  | "record_outcome";

export type ExecutiveActionRecord = {
  sessionId: string;
  organizationId: string;
  executiveOwnerId?: string;
  executiveOwnerName?: string;
  status: ExecutiveActionStatus;
  outcome: ExecutiveActionOutcome;
  priority: BriefingPriority;
  recommendedAction: string;
  dueDate: string;
  outcomeNote?: string;
  actedAt?: string;
  deferredAt?: string;
  closedAt?: string;
  actionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ExecutiveActionQueueItem = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  actionQueue: ExecutiveActionQueue;
  queuePosition: number;
  priority: BriefingPriority;
  recommendedAction: string;
  dueDate: string;
  executiveOwnerId?: string;
  executiveOwnerName?: string;
  status: ExecutiveActionStatus;
  outcome: ExecutiveActionOutcome;
  isOverdue: boolean;
  rankScore: number;
  expectedValue: number;
  riskScore: number;
  actionRecord: ExecutiveActionRecord;
  readOnly: true;
};

export type ExecutiveActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: ExecutiveActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type GovernanceClosureView = {
  pendingDecisions: ExecutiveActionQueueItem[];
  completedDecisions: ExecutiveActionQueueItem[];
  overdueItems: ExecutiveActionQueueItem[];
  actionHistory: ExecutiveActionEntry[];
  readOnly: true;
};

export type ExecutiveActionDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  queues: {
    priorityDecision: ExecutiveActionQueueItem[];
    riskMitigation: ExecutiveActionQueueItem[];
    opportunityCapture: ExecutiveActionQueueItem[];
    overdueAction: ExecutiveActionQueueItem[];
  };
  allItems: ExecutiveActionQueueItem[];
  closure: GovernanceClosureView;
  summary: {
    total: number;
    priorityDecision: number;
    riskMitigation: number;
    opportunityCapture: number;
    overdueAction: number;
    pending: number;
    completed: number;
    overdue: number;
  };
  recentActions: ExecutiveActionEntry[];
  readOnly: true;
};
