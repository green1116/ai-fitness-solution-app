export const INDUSTRY_OPPORTUNITY_VERSION = "v33-industry-opportunity-1" as const;
export const INDUSTRY_OPPORTUNITY_TAG = "v33-industry-opportunity-foundation" as const;

export type IndustryOpportunityMode = "industry-opportunity";

export type IndustryOpportunityType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryOpportunityStatus = "active" | "inactive" | "draft" | "archived";

export type IndustryOpportunitySubjectType = "organization" | "directory-entry" | "relationship";

export interface OpportunityScore {
  scoreId: string;
  opportunityId: string;
  impact: number;
  confidence: number;
  urgency: number;
  networkEffect: number;
  totalScore: number;
  mode: IndustryOpportunityMode;
}

export interface IndustryOpportunity {
  opportunityId: string;
  opportunityType: IndustryOpportunityType;
  subjectId: string;
  subjectType: IndustryOpportunitySubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  score: OpportunityScore;
  generatedAt: string;
  status: IndustryOpportunityStatus;
  metadata: Record<string, string>;
  mode: IndustryOpportunityMode;
}

export interface OpportunityContext {
  contextId: string;
  opportunities: IndustryOpportunity[];
  opportunityCount: number;
  typeBreakdown: Record<IndustryOpportunityType, number>;
  opportunityReady: boolean;
  mode: IndustryOpportunityMode;
}

export interface OpportunityQuery {
  subjectId?: string;
  opportunityType?: IndustryOpportunityType;
  minTotalScore?: number;
  limit?: number;
}

export interface OpportunityQueryResult {
  queryId: string;
  query: OpportunityQuery;
  opportunities: IndustryOpportunity[];
  hitCount: number;
  opportunityReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryOpportunityValidation {
  valid: boolean;
  opportunityRegistry: RegistryValidation;
  opportunityContext: RegistryValidation;
  opportunityQuery: RegistryValidation;
}

export const CANONICAL_OPPORTUNITY_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_OPPORTUNITY_QUERY: OpportunityQuery = {
  subjectId: CANONICAL_OPPORTUNITY_SUBJECT_ID,
  opportunityType: "tender",
  limit: 5,
} as const;

export const HIGH_PRIORITY_SCORE_THRESHOLD = 70 as const;
