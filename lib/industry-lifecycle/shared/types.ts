export const INDUSTRY_LIFECYCLE_VERSION = "v34-industry-lifecycle-1" as const;
export const INDUSTRY_LIFECYCLE_TAG = "v34-industry-lifecycle-foundation" as const;

export type IndustryLifecycleMode = "industry-lifecycle";

export type IndustryLifecycleStatus =
  | "discovered"
  | "qualified"
  | "designed"
  | "bidding"
  | "awarded"
  | "delivering"
  | "retained"
  | "closed";

export type IndustryLifecycleType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryLifecycleSubjectType = "organization" | "directory-entry" | "relationship";

export interface LifecycleScore {
  scoreId: string;
  lifecycleId: string;
  feasibility: number;
  readiness: number;
  impact: number;
  urgency: number;
  confidence: number;
  pipelineStrength: number;
  totalLifecycleScore: number;
  mode: IndustryLifecycleMode;
}

export interface IndustryLifecycle {
  lifecycleId: string;
  pipelineId: string;
  workflowId: string;
  executionId: string;
  activationId: string;
  opportunityId: string;
  lifecycleType: IndustryLifecycleType;
  subjectId: string;
  subjectType: IndustryLifecycleSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  lifecycleStatus: IndustryLifecycleStatus;
  score: LifecycleScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryLifecycleMode;
}

export interface LifecycleContext {
  contextId: string;
  lifecycles: IndustryLifecycle[];
  lifecycleCount: number;
  typeBreakdown: Record<IndustryLifecycleType, number>;
  statusBreakdown: Record<IndustryLifecycleStatus, number>;
  lifecycleReady: boolean;
  mode: IndustryLifecycleMode;
}

export interface LifecycleQuery {
  subjectId?: string;
  lifecycleType?: IndustryLifecycleType;
  lifecycleStatus?: IndustryLifecycleStatus;
  minLifecycleScore?: number;
  limit?: number;
}

export interface LifecycleQueryResult {
  queryId: string;
  query: LifecycleQuery;
  lifecycles: IndustryLifecycle[];
  hitCount: number;
  lifecycleReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryLifecycleValidation {
  valid: boolean;
  lifecycleRegistry: RegistryValidation;
  lifecycleContext: RegistryValidation;
  lifecycleQuery: RegistryValidation;
}

export const CANONICAL_LIFECYCLE_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_LIFECYCLE_QUERY: LifecycleQuery = {
  subjectId: CANONICAL_LIFECYCLE_SUBJECT_ID,
  lifecycleType: "tender",
  limit: 5,
} as const;

export const TOP_LIFECYCLE_SCORE_THRESHOLD = 78 as const;
