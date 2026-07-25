/**
 * Product P7 — Approval types
 */

import type { APPROVAL_STATUSES } from "../collaboration/collaboration.constants";

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type ApprovalMetadata = Record<string, unknown>;

export type ApprovalRequest = {
  id: string;
  collaborationId: string;
  approver: string;
  status: ApprovalStatus;
  rationale: string;
  detail: string;
  metadata: ApprovalMetadata;
  requestedAt: string;
  decidedAt?: string;
};

export type RequestApprovalInput = {
  id?: string;
  collaborationId: string;
  approver: string;
  rationale?: string;
  metadata?: ApprovalMetadata;
};

export type DecideApprovalInput = {
  approvalId: string;
  status: "APPROVED" | "REJECTED" | "WITHDRAWN";
  rationale?: string;
};
