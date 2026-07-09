/**
 * V92 — Executive portfolio governance & board review types
 */

import type { PortfolioSegment } from "@/lib/pilot/v90";
import type { PortfolioOpsQueue, PortfolioOpsQueueItem } from "@/lib/pilot/v91";

export const V92_BOARD_GOVERNANCE_VERSION = "v92-board-governance-1";

export type ExecutiveQueue = PortfolioOpsQueue;

export type GovernanceOutcome = "open" | "approved" | "deferred" | "blocked";

export type GovernanceStatus =
  | "queued"
  | "assigned"
  | "board_review"
  | "approved"
  | "deferred"
  | "blocked";

export type GovernanceActionType =
  | "assign_executive_owner"
  | "schedule_board_review"
  | "record_decision"
  | "mark_approved"
  | "mark_deferred"
  | "mark_blocked";

export type GovernanceRecord = {
  sessionId: string;
  organizationId: string;
  executiveOwnerId?: string;
  executiveOwnerName?: string;
  status: GovernanceStatus;
  outcome: GovernanceOutcome;
  expectedValue: number;
  scheduledBoardReviewAt?: string;
  approvedAt?: string;
  deferredAt?: string;
  blockedAt?: string;
  decisionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type GovernanceActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: GovernanceActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type BoardAccountView = {
  sessionId: string;
  segment: PortfolioSegment;
  segments: PortfolioSegment[];
  value: {
    expectedValue: number;
    expansionPotential: number;
    rankScore: number;
  };
  risk: {
    riskScore: number;
    churnExposure: number;
    openRisks: string[];
  };
  nextDecision: string;
  readOnly: true;
};

export type ExecutiveQueueItem = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  executiveQueue: ExecutiveQueue;
  queuePosition: number;
  expectedValue: number;
  expansionPotential: number;
  riskScore: number;
  rankScore: number;
  executiveOwnerId?: string;
  executiveOwnerName?: string;
  governanceStatus: GovernanceStatus;
  outcome: GovernanceOutcome;
  nextDecision: string;
  opsItem: PortfolioOpsQueueItem;
  governance: GovernanceRecord;
  readOnly: true;
};

export type BoardGovernanceDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  queues: {
    enterprisePriority: ExecutiveQueueItem[];
    expansionReady: ExecutiveQueueItem[];
    atRisk: ExecutiveQueueItem[];
    rescue: ExecutiveQueueItem[];
    followUpNeeded: ExecutiveQueueItem[];
  };
  allItems: ExecutiveQueueItem[];
  summary: {
    total: number;
    enterprisePriority: number;
    expansionReady: number;
    atRisk: number;
    rescue: number;
    followUpNeeded: number;
    approved: number;
    deferred: number;
    blocked: number;
    inBoardReview: number;
  };
  readOnly: true;
};

export type BoardGovernanceDetail = {
  sessionId: string;
  boardView: BoardAccountView;
  queueItem: ExecutiveQueueItem;
  decisionHistory: GovernanceActionEntry[];
  readOnly: true;
};

export const EXECUTIVE_QUEUE_LABELS: Record<ExecutiveQueue, string> = {
  enterprise_priority: "企业优先",
  expansion_ready: "扩展就绪",
  at_risk: "高风险",
  rescue: "流失救援",
  follow_up_needed: "需跟进",
};
