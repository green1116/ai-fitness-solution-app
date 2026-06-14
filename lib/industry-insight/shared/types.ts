export const INDUSTRY_INSIGHT_VERSION = "v33-industry-insight-1" as const;
export const INDUSTRY_INSIGHT_TAG = "v33-industry-insight-foundation" as const;

export type IndustryInsightMode = "industry-insight";

export type IndustryInsightType =
  | "trend"
  | "opportunity"
  | "risk"
  | "growth"
  | "network-change";

export type IndustryInsightStatus = "active" | "inactive" | "draft" | "archived";

export type IndustryInsightSubjectType = "organization" | "directory-entry" | "relationship";

export interface IndustryInsight {
  insightId: string;
  insightType: IndustryInsightType;
  subjectId: string;
  subjectType: IndustryInsightSubjectType;
  title: string;
  summary: string;
  explanation: string;
  signalIds: string[];
  eventIds: string[];
  observationIds: string[];
  confidence: number;
  priority: "low" | "medium" | "high";
  generatedAt: string;
  status: IndustryInsightStatus;
  metadata: Record<string, string>;
  mode: IndustryInsightMode;
}

export interface InsightContext {
  contextId: string;
  insights: IndustryInsight[];
  insightCount: number;
  typeBreakdown: Record<IndustryInsightType, number>;
  insightReady: boolean;
  mode: IndustryInsightMode;
}

export interface InsightQuery {
  subjectId?: string;
  insightType?: IndustryInsightType;
  priority?: IndustryInsight["priority"];
  keyword?: string;
  limit?: number;
}

export interface InsightQueryResult {
  queryId: string;
  query: InsightQuery;
  insights: IndustryInsight[];
  hitCount: number;
  insightReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryInsightValidation {
  valid: boolean;
  insightRegistry: RegistryValidation;
  insightContext: RegistryValidation;
  insightQuery: RegistryValidation;
}

export const CANONICAL_INSIGHT_SUBJECT_ID = "ind-org-supplier-life-fitness-cn" as const;

export const CANONICAL_INSIGHT_QUERY: InsightQuery = {
  subjectId: CANONICAL_INSIGHT_SUBJECT_ID,
  insightType: "growth",
  limit: 5,
} as const;
