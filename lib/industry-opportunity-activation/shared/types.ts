export const INDUSTRY_OPPORTUNITY_ACTIVATION_VERSION = "v33-industry-opportunity-activation-1" as const;
export const INDUSTRY_OPPORTUNITY_ACTIVATION_TAG =
  "v33-industry-opportunity-activation-foundation" as const;

export type IndustryOpportunityActivationMode = "industry-opportunity-activation";

export type IndustryOpportunityActivationStatus = "ready" | "pending" | "blocked" | "archived";

export type IndustryActivationOpportunityType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryActivationSubjectType = "organization" | "directory-entry" | "relationship";

export interface OpportunityActivationScore {
  scoreId: string;
  activationId: string;
  feasibility: number;
  readiness: number;
  impact: number;
  urgency: number;
  confidence: number;
  totalActivationScore: number;
  mode: IndustryOpportunityActivationMode;
}

export interface IndustryOpportunityActivation {
  activationId: string;
  opportunityId: string;
  opportunityType: IndustryActivationOpportunityType;
  subjectId: string;
  subjectType: IndustryActivationSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  activationStatus: IndustryOpportunityActivationStatus;
  score: OpportunityActivationScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryOpportunityActivationMode;
}

export interface OpportunityActivationContext {
  contextId: string;
  activations: IndustryOpportunityActivation[];
  activationCount: number;
  typeBreakdown: Record<IndustryActivationOpportunityType, number>;
  activationReady: boolean;
  mode: IndustryOpportunityActivationMode;
}

export interface OpportunityActivationQuery {
  subjectId?: string;
  opportunityType?: IndustryActivationOpportunityType;
  activationStatus?: IndustryOpportunityActivationStatus;
  minActivationScore?: number;
  limit?: number;
}

export interface OpportunityActivationQueryResult {
  queryId: string;
  query: OpportunityActivationQuery;
  activations: IndustryOpportunityActivation[];
  hitCount: number;
  activationReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryOpportunityActivationValidation {
  valid: boolean;
  activationRegistry: RegistryValidation;
  activationContext: RegistryValidation;
  activationQuery: RegistryValidation;
}

export const CANONICAL_ACTIVATION_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_ACTIVATION_QUERY: OpportunityActivationQuery = {
  subjectId: CANONICAL_ACTIVATION_SUBJECT_ID,
  opportunityType: "tender",
  activationStatus: "ready",
  limit: 5,
} as const;

export const TOP_ACTIVATION_SCORE_THRESHOLD = 75 as const;
