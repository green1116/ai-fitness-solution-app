/**
 * V91 — Portfolio ops & strategic actions types
 */

import type { PortfolioAccountRow, PortfolioSegment } from "@/lib/pilot/v90";

export const V91_PORTFOLIO_OPS_VERSION = "v91-portfolio-ops-1";

export type PortfolioOpsQueue =
  | "enterprise_priority"
  | "expansion_ready"
  | "at_risk"
  | "rescue"
  | "follow_up_needed";

export type PortfolioOpsOutcome = "open" | "completed" | "deferred" | "lost";

export type PortfolioOpsStatus =
  | "queued"
  | "assigned"
  | "in_review"
  | "completed"
  | "deferred"
  | "lost";

export type PortfolioOpsActionType =
  | "assign_portfolio_owner"
  | "schedule_strategic_review"
  | "record_action"
  | "mark_completed"
  | "mark_deferred"
  | "mark_lost";

export type PortfolioOpsRecord = {
  sessionId: string;
  organizationId: string;
  ownerId?: string;
  ownerName?: string;
  status: PortfolioOpsStatus;
  outcome: PortfolioOpsOutcome;
  expectedValue: number;
  scheduledReviewAt?: string;
  completedAt?: string;
  deferredAt?: string;
  lostAt?: string;
  actionCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioOpsActionEntry = {
  id: string;
  sessionId: string;
  organizationId: string;
  actorId: string;
  action: PortfolioOpsActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type AccountStrategyView = {
  sessionId: string;
  segment: PortfolioSegment;
  segments: PortfolioSegment[];
  health: {
    segmentHealthScore: number;
    renewalLikelihood: number;
    accountHealthScore: number;
  };
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
  nextStrategicAction: string;
  readOnly: true;
};

export type PortfolioOpsQueueItem = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  opsQueue: PortfolioOpsQueue;
  queuePosition: number;
  expectedValue: number;
  expansionPotential: number;
  riskScore: number;
  rankScore: number;
  ownerId?: string;
  ownerName?: string;
  opsStatus: PortfolioOpsStatus;
  outcome: PortfolioOpsOutcome;
  nextAction: string;
  portfolioAccount: PortfolioAccountRow;
  portfolioOps: PortfolioOpsRecord;
  readOnly: true;
};

export type PortfolioOpsDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  queues: {
    enterprisePriority: PortfolioOpsQueueItem[];
    expansionReady: PortfolioOpsQueueItem[];
    atRisk: PortfolioOpsQueueItem[];
    rescue: PortfolioOpsQueueItem[];
    followUpNeeded: PortfolioOpsQueueItem[];
  };
  allItems: PortfolioOpsQueueItem[];
  summary: {
    total: number;
    enterprisePriority: number;
    expansionReady: number;
    atRisk: number;
    rescue: number;
    followUpNeeded: number;
    completed: number;
    deferred: number;
    lost: number;
    inReview: number;
  };
  readOnly: true;
};

export type PortfolioOpsDetail = {
  sessionId: string;
  accountStrategy: AccountStrategyView;
  queueItem: PortfolioOpsQueueItem;
  actionHistory: PortfolioOpsActionEntry[];
  readOnly: true;
};

export const OPS_QUEUE_LABELS: Record<PortfolioOpsQueue, string> = {
  enterprise_priority: "企业优先",
  expansion_ready: "扩展就绪",
  at_risk: "高风险",
  rescue: "流失救援",
  follow_up_needed: "需跟进",
};
