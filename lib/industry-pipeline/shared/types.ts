export const INDUSTRY_PIPELINE_VERSION = "v34-industry-pipeline-1" as const;
export const INDUSTRY_PIPELINE_TAG = "v34-industry-pipeline-foundation" as const;

export type IndustryPipelineMode = "industry-pipeline";

export type IndustryPipelineStatus =
  | "lead"
  | "qualified"
  | "engaged"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type IndustryPipelineType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryPipelineSubjectType = "organization" | "directory-entry" | "relationship";

export interface PipelineScore {
  scoreId: string;
  pipelineId: string;
  feasibility: number;
  readiness: number;
  impact: number;
  urgency: number;
  confidence: number;
  workflowStrength: number;
  totalPipelineScore: number;
  mode: IndustryPipelineMode;
}

export interface IndustryPipeline {
  pipelineId: string;
  workflowId: string;
  executionId: string;
  activationId: string;
  opportunityId: string;
  pipelineType: IndustryPipelineType;
  subjectId: string;
  subjectType: IndustryPipelineSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  pipelineStatus: IndustryPipelineStatus;
  score: PipelineScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryPipelineMode;
}

export interface PipelineContext {
  contextId: string;
  pipelines: IndustryPipeline[];
  pipelineCount: number;
  typeBreakdown: Record<IndustryPipelineType, number>;
  statusBreakdown: Record<IndustryPipelineStatus, number>;
  pipelineReady: boolean;
  mode: IndustryPipelineMode;
}

export interface PipelineQuery {
  subjectId?: string;
  pipelineType?: IndustryPipelineType;
  pipelineStatus?: IndustryPipelineStatus;
  minPipelineScore?: number;
  limit?: number;
}

export interface PipelineQueryResult {
  queryId: string;
  query: PipelineQuery;
  pipelines: IndustryPipeline[];
  hitCount: number;
  pipelineReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryPipelineValidation {
  valid: boolean;
  pipelineRegistry: RegistryValidation;
  pipelineContext: RegistryValidation;
  pipelineQuery: RegistryValidation;
}

export const CANONICAL_PIPELINE_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_PIPELINE_QUERY: PipelineQuery = {
  subjectId: CANONICAL_PIPELINE_SUBJECT_ID,
  pipelineType: "tender",
  limit: 5,
} as const;

export const TOP_PIPELINE_SCORE_THRESHOLD = 78 as const;
