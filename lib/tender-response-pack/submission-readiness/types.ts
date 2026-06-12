import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";

export const SUBMISSION_READINESS_RUNTIME_VERSION = "v19.6-submission-readiness-1" as const;

export interface SubmissionReadinessAssessment {
  assessmentId: string;
  packLabel: string;
  bidderBrand: string;
  completeness: number;
  complianceReadiness: number;
  attachmentReadiness: number;
  budgetReadiness: number;
  responseReadiness: number;
  submissionReadinessScore: number;
}

export interface SubmissionReadinessRuntimePayload {
  version: typeof SUBMISSION_READINESS_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  assessments: SubmissionReadinessAssessment[];
  averageSubmissionReadinessScore: number;
  summary: string;
}
