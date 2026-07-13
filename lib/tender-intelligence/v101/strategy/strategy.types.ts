/**
 * E01-P4 — AI Bid Strategy Engine types
 * OpportunityProfile → BidStrategy lifecycle
 */

import type {
  OpportunityProfile,
  OpportunityTier,
  RiskSeverity,
} from "../intelligence/intelligence.types";

export const V101_BID_STRATEGY_VERSION = "v101-bid-strategy-1" as const;
export const V101_BID_STRATEGY_FREEZE_VERSION = "v101-bid-strategy-freeze-1" as const;

export type StrategyLifecycleStage = "opportunity" | "strategy";

export type StrategyStatus = "pending" | "drafted" | "ready" | "failed";

export type BidPosture = "pursue" | "selective" | "hold" | "pass";

export type PricingStance = "aggressive" | "balanced" | "premium" | "conservative";

export type ProposalEmphasis =
  | "compliance"
  | "equipment"
  | "commercial"
  | "delivery"
  | "differentiation";

export type StrategyWorkstream = {
  id: string;
  title: string;
  ownerHint: string;
  priority: RiskSeverity;
  dueHint: "immediate" | "this_week" | "pre_submission";
  actions: string[];
  readOnly: true;
};

export type StrategyRiskBuffer = {
  id: string;
  label: string;
  severity: RiskSeverity;
  buffer: string;
  readOnly: true;
};

export type BidStrategy = {
  id: string;
  opportunityId: string;
  analysisId: string;
  requirementIndexId: string;
  workspaceId: string;
  status: StrategyStatus;
  posture: BidPosture;
  pricingStance: PricingStance;
  emphasis: ProposalEmphasis[];
  narrativeThemes: string[];
  workstreams: StrategyWorkstream[];
  riskBuffers: StrategyRiskBuffer[];
  goNoGoScore: number;
  confidence: number;
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type StrategyLifecycleTransition = {
  from: StrategyLifecycleStage;
  to: StrategyLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type StrategyLifecycle = {
  current: StrategyLifecycleStage;
  stages: StrategyLifecycleStage[];
  transitions: StrategyLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type StrategyKernelInput = {
  deploymentId?: string;
  opportunity: OpportunityProfile;
  preferredEmphasis?: ProposalEmphasis[];
};

export type StrategyKernelResult = {
  version: typeof V101_BID_STRATEGY_VERSION;
  freezeVersion: typeof V101_BID_STRATEGY_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  opportunity: OpportunityProfile;
  strategy: BidStrategy | null;
  lifecycle: StrategyLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};

export type { OpportunityTier };
