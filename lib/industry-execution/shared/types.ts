export const INDUSTRY_EXECUTION_VERSION = "v33-industry-execution-1" as const;
export const INDUSTRY_EXECUTION_TAG = "v33-industry-execution-foundation" as const;

export type IndustryExecutionMode = "industry-execution";

export type IndustryExecutionStatus =
  | "planned"
  | "ready"
  | "executing"
  | "completed"
  | "blocked";

export type IndustryExecutionType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryExecutionSubjectType = "organization" | "directory-entry" | "relationship";

export interface ExecutionScore {
  scoreId: string;
  executionId: string;
  feasibility: number;
  readiness: number;
  impact: number;
  urgency: number;
  confidence: number;
  activationStrength: number;
  totalExecutionScore: number;
  mode: IndustryExecutionMode;
}

export interface IndustryExecution {
  executionId: string;
  activationId: string;
  opportunityId: string;
  executionType: IndustryExecutionType;
  subjectId: string;
  subjectType: IndustryExecutionSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  executionStatus: IndustryExecutionStatus;
  score: ExecutionScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryExecutionMode;
}

export interface ExecutionContext {
  contextId: string;
  executions: IndustryExecution[];
  executionCount: number;
  typeBreakdown: Record<IndustryExecutionType, number>;
  statusBreakdown: Record<IndustryExecutionStatus, number>;
  executionReady: boolean;
  mode: IndustryExecutionMode;
}

export interface ExecutionQuery {
  subjectId?: string;
  executionType?: IndustryExecutionType;
  executionStatus?: IndustryExecutionStatus;
  minExecutionScore?: number;
  limit?: number;
}

export interface ExecutionQueryResult {
  queryId: string;
  query: ExecutionQuery;
  executions: IndustryExecution[];
  hitCount: number;
  executionReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryExecutionValidation {
  valid: boolean;
  executionRegistry: RegistryValidation;
  executionContext: RegistryValidation;
  executionQuery: RegistryValidation;
}

export const CANONICAL_EXECUTION_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_EXECUTION_QUERY: ExecutionQuery = {
  subjectId: CANONICAL_EXECUTION_SUBJECT_ID,
  executionType: "tender",
  limit: 5,
} as const;

export const TOP_EXECUTION_SCORE_THRESHOLD = 78 as const;
