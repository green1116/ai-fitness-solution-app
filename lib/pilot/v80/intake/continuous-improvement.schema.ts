/**
 * V80 Pilot P15 — Continuous improvement schema (recommendation outcomes → knowledge)
 */

export const CONTINUOUS_IMPROVEMENT_VERSION = "v80-pilot-p15-improve-1";

export type KnowledgeQualityBand =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "insufficient";

export type GovernanceSuggestionAction =
  | "promote"
  | "demote"
  | "deprecate"
  | "review"
  | "keep";

export type PatternQualityScore = {
  patternId: string;
  title: string;
  kind: string;
  authority: string;
  status: string;
  shown: number;
  accepted: number;
  dismissed: number;
  acceptRate: number;
  dismissRate: number;
  qualityScore: number;
  qualityBand: KnowledgeQualityBand;
  /** Additive adjustment applied to future recommendation ranking (−0.25…+0.25) */
  confidenceAdjustment: number;
  suggestion: {
    action: GovernanceSuggestionAction;
    reason: string;
    priority: number;
  };
};

export type ImprovementTrendPoint = {
  date: string;
  accepted: number;
  dismissed: number;
  shownApprox: number;
  acceptRate: number;
};

export type ImprovementAggregation = {
  patternsScored: number;
  totalShown: number;
  totalAccepted: number;
  totalDismissed: number;
  overallAcceptRate: number;
  overallDismissRate: number;
  byQualityBand: Record<KnowledgeQualityBand, number>;
  bySuggestion: Record<GovernanceSuggestionAction, number>;
  trends: ImprovementTrendPoint[];
};

export type AppliedGovernanceFeedback = {
  id: string;
  at: string;
  actorId: string;
  patternId: string;
  action: GovernanceSuggestionAction;
  dryRun: boolean;
  applied: boolean;
  message: string;
};

export type ContinuousImprovementReport = {
  version: typeof CONTINUOUS_IMPROVEMENT_VERSION;
  organizationId: string;
  generatedAt: string;
  contentHash: string;
  aggregation: ImprovementAggregation;
  quality: PatternQualityScore[];
  suggestions: PatternQualityScore[];
  confidenceAdjustments: Record<string, number>;
  recentApplied: AppliedGovernanceFeedback[];
};

export type ContinuousImprovementState = {
  version: typeof CONTINUOUS_IMPROVEMENT_VERSION;
  organizationId: string;
  updatedAt: string;
  lastReportHash?: string;
  /** Persisted confidence adjustments by patternId */
  confidenceAdjustments: Record<string, number>;
  appliedFeedback: AppliedGovernanceFeedback[];
};
