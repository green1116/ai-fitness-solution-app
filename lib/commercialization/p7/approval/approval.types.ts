/**
 * Commercialization P7 — Approval types
 */

import type { APPROVAL_STATES } from "../governance/governance.constants";

export type ApprovalState = (typeof APPROVAL_STATES)[number];
export type ApprovalMetadata = Record<string, unknown>;

export type ApprovalRequest = {
  id: string;
  governanceId: string;
  subject: string;
  requester: string;
  amount: number;
  state: ApprovalState;
  detail: string;
  metadata: ApprovalMetadata;
  createdAt: string;
  updatedAt: string;
};

export type SubmitApprovalInput = {
  id?: string;
  governanceId: string;
  subject: string;
  requester: string;
  amount: number;
  metadata?: ApprovalMetadata;
};

export type ApprovalDecision = {
  id: string;
  requestId: string;
  state: ApprovalState;
  reviewer: string;
  rationale: string;
  decidedAt: string;
};

export type DecideApprovalInput = {
  id?: string;
  requestId: string;
  state: Exclude<ApprovalState, "PENDING">;
  reviewer: string;
  rationale?: string;
};

export type ApprovalRule = {
  id: string;
  name: string;
  maxAutoApprove: number;
  escalateAbove: number;
  detail: string;
  createdAt: string;
};

export type DefineApprovalRuleInput = {
  id?: string;
  name: string;
  maxAutoApprove: number;
  escalateAbove: number;
};
