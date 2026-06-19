export const APPROVAL_VERSION = "v47-commercial-products-p2-step8" as const;
export const CP_APPROVAL_API_PATH = "/api/commercial-products/approval" as const;

export const APPROVAL_STATUS = ["draft", "review", "approved", "rejected", "delivered"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUS)[number];

export const APPROVAL_ACTION = ["submit", "approve", "reject", "deliver"] as const;
export type ApprovalAction = (typeof APPROVAL_ACTION)[number];

export interface ApprovalRecord {
  approvalId: string;
  quoteId: string;
  projectId: string;
  status: ApprovalStatus;
  submittedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  deliveredAt?: number;
}

export interface ApprovalHistoryItem {
  id: string;
  approvalId: string;
  action: ApprovalAction;
  createdAt: number;
  summary: string;
}

export interface ApprovalCreateInput {
  quoteId: string;
  projectId: string;
}

export interface ApprovalActionInput {
  approvalId: string;
}

export interface ApprovalLookup {
  approvalId?: string;
  quoteId?: string;
  projectId?: string;
}

export interface ApprovalPolicyCheck {
  allowed: boolean;
  reasons: string[];
}

export interface ApprovalResponse {
  ok: true;
  approval: ApprovalRecord;
  history: ApprovalHistoryItem[];
}

export interface ApprovalValidation {
  valid: boolean;
  runtimeOk: boolean;
  policyOk: boolean;
  historyOk: boolean;
  apiPathRegistered: boolean;
  workspaceIntegrationOk: boolean;
  summary: string;
}
