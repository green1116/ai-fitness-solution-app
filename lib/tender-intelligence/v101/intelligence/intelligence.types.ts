/**
 * E01-P3 — Tender Intelligence Engine types
 * RequirementIndex → TenderAnalysis → OpportunityProfile lifecycle
 */

import type {
  RequirementCategory,
  RequirementIndex,
  RequirementPriority,
} from "../understanding/understanding.types";

export const V101_TENDER_INTELLIGENCE_VERSION = "v101-tender-intelligence-1" as const;
export const V101_TENDER_INTELLIGENCE_FREEZE_VERSION =
  "v101-tender-intelligence-freeze-1" as const;

export type IntelligenceLifecycleStage =
  | "requirements"
  | "analysis"
  | "opportunity";

export type IntelligenceStatus =
  | "pending"
  | "analyzed"
  | "profiled"
  | "ready"
  | "failed";

export type RiskSeverity = "low" | "medium" | "high";

export type OpportunityTier = "low" | "medium" | "high" | "strategic";

export type FitScoreBand = "weak" | "fair" | "strong" | "excellent";

export type AnalysisSignal = {
  id: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  label: string;
  weight: number;
  evidenceEntryIds: string[];
  readOnly: true;
};

export type RiskSignal = {
  id: string;
  severity: RiskSeverity;
  label: string;
  rationale: string;
  relatedEntryIds: string[];
  readOnly: true;
};

export type TenderAnalysis = {
  id: string;
  requirementIndexId: string;
  workspaceId: string;
  status: IntelligenceStatus;
  signalCount: number;
  riskCount: number;
  mustCoverage: number;
  complexityScore: number;
  signals: AnalysisSignal[];
  risks: RiskSignal[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type OpportunityCapabilityGap = {
  id: string;
  label: string;
  severity: RiskSeverity;
  mitigation: string;
  readOnly: true;
};

export type OpportunityProfile = {
  id: string;
  analysisId: string;
  requirementIndexId: string;
  workspaceId: string;
  status: IntelligenceStatus;
  tier: OpportunityTier;
  fitScore: number;
  fitBand: FitScoreBand;
  winProbability: number;
  estimatedValueHint?: number;
  strengths: string[];
  gaps: OpportunityCapabilityGap[];
  recommendedActions: string[];
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type IntelligenceLifecycleTransition = {
  from: IntelligenceLifecycleStage;
  to: IntelligenceLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type IntelligenceLifecycle = {
  current: IntelligenceLifecycleStage;
  stages: IntelligenceLifecycleStage[];
  transitions: IntelligenceLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type IntelligenceKernelInput = {
  deploymentId?: string;
  requirementIndex: RequirementIndex;
  estimatedValueHint?: number;
};

export type IntelligenceKernelResult = {
  version: typeof V101_TENDER_INTELLIGENCE_VERSION;
  freezeVersion: typeof V101_TENDER_INTELLIGENCE_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  requirementIndex: RequirementIndex;
  analysis: TenderAnalysis | null;
  opportunity: OpportunityProfile | null;
  lifecycle: IntelligenceLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
