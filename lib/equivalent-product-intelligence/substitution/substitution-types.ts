import type { EquivalentProductIntelligenceMode } from "../shared/constants";

export type SubstitutionRiskLevel = "low" | "medium" | "high" | "blocked";

export type CompatibilityLevel = "compatible" | "partial" | "incompatible";

export interface SubstitutionRiskScore {
  totalRiskScore: number;
  complianceRiskScore: number;
  deliveryRiskScore: number;
  brandRiskScore: number;
  performanceRiskScore: number;
  priceRiskScore: number;
  evidenceRiskScore: number;
  reasons: string[];
}

export interface CompatibilityMatrix {
  matrixId: string;
  requirementId?: string;
  sourceProductId: string;
  targetProductId: string;
  specMatches: number;
  specGaps: number;
  specExcess: number;
  totalSpecs: number;
  compatibilityLevel: CompatibilityLevel;
  specMatchRatio: number;
  mode: EquivalentProductIntelligenceMode;
}

export type CompatibilityGapType =
  | "missing-spec"
  | "weaker-spec"
  | "unsupported-spec"
  | "brand-mismatch"
  | "evidence-missing"
  | "installation-incompatible"
  | "maintenance-incompatible";

export type CompatibilityGapSeverity = "low" | "medium" | "high";

export interface CompatibilityGap {
  gapId: string;
  specId: string;
  specName: string;
  gapType: CompatibilityGapType;
  severity: CompatibilityGapSeverity;
  explanation: string;
  sourceSpecRef?: string;
  targetSpecRef?: string;
  mode: EquivalentProductIntelligenceMode;
}

export interface SubstitutionAssessment {
  assessmentId: string;
  sourceProductId: string;
  targetProductId: string;
  requirementId?: string;
  riskLevel: SubstitutionRiskLevel;
  riskScore: SubstitutionRiskScore;
  compatibility: CompatibilityMatrix;
  gaps: CompatibilityGap[];
  explanation: string[];
  trace: string[];
  canUseForTender: boolean;
  mode: EquivalentProductIntelligenceMode;
}

export interface SubstitutionReasoning {
  reasoningId: string;
  sourceProductId: string;
  targetProductId: string;
  requirementId?: string;
  whySubstitutable: string[];
  whyNotFullyCompatible: string[];
  riskSummary: string[];
  tenderSuitability: string[];
  usableScenarios: string[];
  mode: EquivalentProductIntelligenceMode;
}

export interface SubstitutionContext {
  contextId: string;
  productCount: number;
  specificationCount: number;
  equivalentEdgeCount: number;
  requirementCount: number;
  evidenceBrandCount: number;
  tenderContextReady: boolean;
  contextReady: boolean;
  mode: EquivalentProductIntelligenceMode;
}

export interface SubstitutionValidation {
  valid: boolean;
  assessmentCount: number;
  compatibleCount: number;
  partialCount: number;
  incompatibleCount: number;
  riskEngineReady: boolean;
  compatibilityMatrixReady: boolean;
  gapExplanationReady: boolean;
  reasoningReady: boolean;
  summary: string;
}

export interface EquivalentProductIntelligencePhase3Validation {
  valid: boolean;
  phase2Valid: boolean;
  substitution: SubstitutionValidation;
}

export interface EquivalentProductIntelligencePhase3FreezeMeta {
  tag: string;
  version: string;
  phase: number;
  valid: boolean;
}
