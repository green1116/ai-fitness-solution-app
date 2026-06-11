import type { BIDDER_INTELLIGENCE_VERSION, ReadinessStubMode } from "../shared/types";

export const PROPOSAL_PERSONALIZATION_RUNTIME_VERSION = "v19.0-proposal-personalization-1" as const;

export interface TenderContext {
  tenderId: string;
  projectName: string;
  projectType: string;
  budgetTier: string;
  complianceRequirements: string[];
  mode: ReadinessStubMode;
}

export interface DifferentiationStrategy {
  strategyId: string;
  focusAreas: string[];
  competitiveAdvantages: string[];
  riskMitigations: string[];
}

export interface BrandStrategy {
  strategyId: string;
  recommendedBrands: string[];
  tierMix: string;
  rationale: string;
}

export interface ValueProposition {
  propositionId: string;
  headline: string;
  keyBenefits: string[];
  proofPoints: string[];
  targetOutcome: string;
}

export interface ProposalPersonalizationSnapshot {
  snapshotId: string;
  tenderContext: TenderContext;
  differentiationStrategy: DifferentiationStrategy;
  brandStrategy: BrandStrategy;
  valueProposition: ValueProposition;
  differentiationReadiness: number;
}

export interface ProposalPersonalizationRuntimePayload {
  version: typeof PROPOSAL_PERSONALIZATION_RUNTIME_VERSION;
  bidderIntelligenceVersion: typeof BIDDER_INTELLIGENCE_VERSION;
  snapshot: ProposalPersonalizationSnapshot;
  differentiationReadiness: number;
  summary: string;
}
