export const INDUSTRY_CRM_VERSION = "v34-industry-crm-1" as const;
export const INDUSTRY_CRM_TAG = "v34-industry-crm-foundation" as const;

export type IndustryCRMMode = "industry-crm";

export type IndustryCRMStatus =
  | "prospect"
  | "active"
  | "strategic"
  | "retained"
  | "dormant"
  | "churned";

export type IndustryCRMType = "supplier" | "brand" | "tender" | "partnership";

export type IndustryCRMSubjectType = "organization" | "directory-entry" | "relationship";

export interface CRMScore {
  scoreId: string;
  crmId: string;
  relationshipStrength: number;
  lifecycleStrength: number;
  confidence: number;
  retentionScore: number;
  expansionScore: number;
  totalCRMScore: number;
  mode: IndustryCRMMode;
}

export interface IndustryCRM {
  crmId: string;
  lifecycleId: string;
  pipelineId: string;
  workflowId: string;
  executionId: string;
  activationId: string;
  opportunityId: string;
  crmType: IndustryCRMType;
  subjectId: string;
  subjectType: IndustryCRMSubjectType;
  title: string;
  summary: string;
  insightIds: string[];
  crmStatus: IndustryCRMStatus;
  score: CRMScore;
  generatedAt: string;
  metadata: Record<string, string>;
  mode: IndustryCRMMode;
}

export interface CRMContext {
  contextId: string;
  crmRecords: IndustryCRM[];
  crmCount: number;
  typeBreakdown: Record<IndustryCRMType, number>;
  statusBreakdown: Record<IndustryCRMStatus, number>;
  crmReady: boolean;
  mode: IndustryCRMMode;
}

export interface CRMQuery {
  subjectId?: string;
  crmType?: IndustryCRMType;
  crmStatus?: IndustryCRMStatus;
  minCRMScore?: number;
  limit?: number;
}

export interface CRMQueryResult {
  queryId: string;
  query: CRMQuery;
  crmRecords: IndustryCRM[];
  hitCount: number;
  crmReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryCRMValidation {
  valid: boolean;
  crmRegistry: RegistryValidation;
  crmContext: RegistryValidation;
  crmQuery: RegistryValidation;
}

export const CANONICAL_CRM_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_CRM_QUERY: CRMQuery = {
  subjectId: CANONICAL_CRM_SUBJECT_ID,
  crmType: "tender",
  limit: 5,
} as const;

export const TOP_CRM_SCORE_THRESHOLD = 78 as const;
