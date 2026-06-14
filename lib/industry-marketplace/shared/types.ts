export const INDUSTRY_MARKETPLACE_VERSION = "v35-industry-marketplace-1" as const;
export const INDUSTRY_MARKETPLACE_TAG = "v35-industry-marketplace-foundation" as const;

export type IndustryMarketplaceMode = "industry-marketplace";

export type IndustryMarketplaceStatus =
  | "listed"
  | "visible"
  | "matched"
  | "engaged"
  | "transacting"
  | "fulfilled"
  | "retained"
  | "archived";

export type IndustryMarketplaceType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryMarketplaceSubjectType = "organization" | "directory-entry" | "relationship";

export interface MarketplaceScore {
  scoreId: string;
  marketplaceId: string;
  visibilityScore: number;
  matchingScore: number;
  transactionScore: number;
  retentionScore: number;
  confidenceScore: number;
  totalMarketplaceScore: number;
  mode: IndustryMarketplaceMode;
}

export interface IndustryMarketplace {
  marketplaceId: string;
  crmId: string;
  lifecycleId: string;
  pipelineId: string;
  workflowId: string;
  executionId: string;
  activationId: string;
  opportunityId: string;
  marketplaceType: IndustryMarketplaceType;
  subjectId: string;
  subjectType: IndustryMarketplaceSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  marketplaceStatus: IndustryMarketplaceStatus;
  score: MarketplaceScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryMarketplaceMode;
}

export interface MarketplaceContext {
  contextId: string;
  marketplaceRecords: IndustryMarketplace[];
  marketplaceCount: number;
  typeBreakdown: Record<IndustryMarketplaceType, number>;
  statusBreakdown: Record<IndustryMarketplaceStatus, number>;
  marketplaceReady: boolean;
  mode: IndustryMarketplaceMode;
}

export interface MarketplaceQuery {
  subjectId?: string;
  marketplaceType?: IndustryMarketplaceType;
  marketplaceStatus?: IndustryMarketplaceStatus;
  minMarketplaceScore?: number;
  limit?: number;
}

export interface MarketplaceQueryResult {
  queryId: string;
  query: MarketplaceQuery;
  marketplaceRecords: IndustryMarketplace[];
  hitCount: number;
  marketplaceReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryMarketplaceValidation {
  valid: boolean;
  marketplaceRegistry: RegistryValidation;
  marketplaceContext: RegistryValidation;
  marketplaceQuery: RegistryValidation;
}

export const CANONICAL_MARKETPLACE_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_MARKETPLACE_QUERY: MarketplaceQuery = {
  subjectId: CANONICAL_MARKETPLACE_SUBJECT_ID,
  marketplaceType: "tender",
  limit: 5,
} as const;

export const TOP_MARKETPLACE_SCORE_THRESHOLD = 78 as const;
