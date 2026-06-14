export const INDUSTRY_WORKFLOW_VERSION = "v34-industry-workflow-1" as const;
export const INDUSTRY_WORKFLOW_TAG = "v34-industry-workflow-foundation" as const;

export type IndustryWorkflowMode = "industry-workflow";

export type IndustryWorkflowStatus =
  | "draft"
  | "planned"
  | "running"
  | "paused"
  | "completed"
  | "blocked";

export type IndustryWorkflowType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryWorkflowSubjectType = "organization" | "directory-entry" | "relationship";

export interface WorkflowScore {
  scoreId: string;
  workflowId: string;
  feasibility: number;
  readiness: number;
  impact: number;
  urgency: number;
  confidence: number;
  executionStrength: number;
  totalWorkflowScore: number;
  mode: IndustryWorkflowMode;
}

export interface IndustryWorkflow {
  workflowId: string;
  executionId: string;
  activationId: string;
  opportunityId: string;
  workflowType: IndustryWorkflowType;
  subjectId: string;
  subjectType: IndustryWorkflowSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  workflowStatus: IndustryWorkflowStatus;
  score: WorkflowScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryWorkflowMode;
}

export interface WorkflowContext {
  contextId: string;
  workflows: IndustryWorkflow[];
  workflowCount: number;
  typeBreakdown: Record<IndustryWorkflowType, number>;
  statusBreakdown: Record<IndustryWorkflowStatus, number>;
  workflowReady: boolean;
  mode: IndustryWorkflowMode;
}

export interface WorkflowQuery {
  subjectId?: string;
  workflowType?: IndustryWorkflowType;
  workflowStatus?: IndustryWorkflowStatus;
  minWorkflowScore?: number;
  limit?: number;
}

export interface WorkflowQueryResult {
  queryId: string;
  query: WorkflowQuery;
  workflows: IndustryWorkflow[];
  hitCount: number;
  workflowReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryWorkflowValidation {
  valid: boolean;
  workflowRegistry: RegistryValidation;
  workflowContext: RegistryValidation;
  workflowQuery: RegistryValidation;
}

export const CANONICAL_WORKFLOW_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_WORKFLOW_QUERY: WorkflowQuery = {
  subjectId: CANONICAL_WORKFLOW_SUBJECT_ID,
  workflowType: "tender",
  limit: 5,
} as const;

export const TOP_WORKFLOW_SCORE_THRESHOLD = 78 as const;
