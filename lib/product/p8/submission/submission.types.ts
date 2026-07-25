/**
 * Product P8 — Submission types
 */

import type { SUBMISSION_STATUSES } from "../tender/tender.constants";

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export type SubmissionMetadata = Record<string, unknown>;

export type TenderSubmission = {
  id: string;
  tenderId: string;
  packageId: string;
  deliveryId: string;
  status: SubmissionStatus;
  referenceCode: string;
  detail: string;
  metadata: SubmissionMetadata;
  submittedAt: string;
  acknowledgedAt?: string;
};

export type CreateSubmissionInput = {
  id?: string;
  tenderId: string;
  packageId: string;
  deliveryId: string;
  referenceCode?: string;
  metadata?: SubmissionMetadata;
};

export type AcknowledgeSubmissionInput = {
  submissionId: string;
  referenceCode?: string;
};
