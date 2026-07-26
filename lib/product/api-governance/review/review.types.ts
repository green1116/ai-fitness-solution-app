/**
 * Product API Governance — review types (record only, no runtime workflow)
 */

import type { GOVERNANCE_REVIEW_VERDICTS } from "../management/management.constants";

export type GovernanceReviewVerdict =
  (typeof GOVERNANCE_REVIEW_VERDICTS)[number];
export type GovernanceReviewMetadata = Record<string, unknown>;

export type GovernanceReview = {
  id: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: GovernanceReviewVerdict;
  detail: string;
  metadata: GovernanceReviewMetadata;
  createdAt: string;
};

export type RecordGovernanceReviewInput = {
  id?: string;
  policyId: string;
  standardId: string;
  reviewKey: string;
  subjectRef: string;
  verdict: GovernanceReviewVerdict;
  metadata?: GovernanceReviewMetadata;
};
