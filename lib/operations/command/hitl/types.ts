import type { AutonomousCommandRuntimeResult, CommandIntent } from "../types";

export const HUMAN_IN_THE_LOOP_COMMAND_VERSION = "v4-a5-a2-human-in-the-loop-command-1" as const;
export type HumanInTheLoopCommandVersion = typeof HUMAN_IN_THE_LOOP_COMMAND_VERSION;

export type CommandReviewStatus =
  | "pending"
  | "in-review"
  | "approved"
  | "rejected"
  | "overridden"
  | "suspended"
  | "cancelled"
  | "escalated";

export type CommandReviewDecision =
  | "approve"
  | "reject"
  | "override"
  | "suspend"
  | "cancel"
  | "escalate"
  | "rollback-request"
  | "confirm";

export type CommandApprovalQueueEntry = {
  entryId: string;
  intentId: string;
  intentName: string;
  severity: CommandIntent["severity"];
  priority: CommandIntent["priority"];
  reason: string;
  status: CommandReviewStatus;
  queuedAt: string;
};

export type CommandApprovalQueue = {
  queueId: string;
  deploymentId: string;
  entries: CommandApprovalQueueEntry[];
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
};

export type CommandReviewCase = {
  caseId: string;
  intentId: string;
  reviewer: string;
  status: CommandReviewStatus;
  decision: CommandReviewDecision | null;
  rationale: string;
  openedAt: string;
  closedAt: string | null;
};

export type CommandOverrideRecord = {
  overrideId: string;
  intentId: string;
  originalDecision: string;
  newDecision: string;
  operator: string;
  reason: string;
  timestamp: string;
};

export type CommandCancellationRecord = {
  cancellationId: string;
  intentId: string;
  operator: string;
  reason: string;
  timestamp: string;
};

export type CommandSuspensionRecord = {
  suspensionId: string;
  intentId: string;
  operator: string;
  reason: string;
  until: string | null;
  timestamp: string;
};

export type CommandEscalationRecord = {
  escalationId: string;
  intentId: string;
  fromLevel: number;
  toLevel: number;
  operator: string;
  reason: string;
  timestamp: string;
};

export type CommandRollbackRequest = {
  requestId: string;
  intentId: string;
  operator: string;
  reason: string;
  status: "pending" | "acknowledged" | "completed" | "denied";
  timestamp: string;
};

export type CommandReviewTrailRecord = {
  recordId: string;
  intentId: string;
  action: CommandReviewDecision;
  operator: string;
  detail: string;
  outcome: "pass" | "fail" | "skip";
  timestamp: string;
};

export type CommandReviewTrail = {
  trailId: string;
  records: CommandReviewTrailRecord[];
  summary: string;
};

export type HumanInTheLoopCommandRuntimeInput = {
  deploymentId: string;
  command: AutonomousCommandRuntimeResult;
  defaultReviewer?: string;
};

export type HumanInTheLoopCommandRuntimeResult = {
  version: HumanInTheLoopCommandVersion;
  queue: CommandApprovalQueue;
  reviewCases: CommandReviewCase[];
  overrides: CommandOverrideRecord[];
  cancellations: CommandCancellationRecord[];
  suspensions: CommandSuspensionRecord[];
  escalations: CommandEscalationRecord[];
  rollbackRequests: CommandRollbackRequest[];
  reviewTrail: CommandReviewTrail;
  bridgeEligibleIntentIds: string[];
  blockedIntentIds: string[];
  flags: {
    queue: boolean;
    review: boolean;
    approval: boolean;
    override: boolean;
    suspension: boolean;
    cancellation: boolean;
    escalation: boolean;
    rollback: boolean;
    audit: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: "idle" | "pending-review" | "cleared" | "blocked" | "partial";
};
