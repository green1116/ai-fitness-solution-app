/**
 * Product Compliance — Assessment types
 */

import type { COMPLIANCE_ASSESSMENT_RESULTS } from "../governance/governance.constants";

export type ComplianceAssessmentResult =
  (typeof COMPLIANCE_ASSESSMENT_RESULTS)[number];
export type AssessmentMetadata = Record<string, unknown>;

export type ComplianceAssessment = {
  id: string;
  frameworkId: string;
  controlIds: string[];
  evidenceIds: string[];
  result: ComplianceAssessmentResult;
  detail: string;
  metadata: AssessmentMetadata;
  assessedAt: string;
};

export type RunComplianceAssessmentInput = {
  id?: string;
  frameworkId: string;
  controlIds: string[];
  evidenceIds: string[];
  metadata?: AssessmentMetadata;
};
