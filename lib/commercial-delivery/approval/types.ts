import type { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";

export const APPROVAL_RUNTIME_VERSION = "v14.0-approval-runtime-1" as const;

export const APPROVAL_STATUSES = [
  "draft",
  "review",
  "approved",
  "delivered",
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface ApprovalRecord {
  recordId: string;
  projectId: string;
  deliverableType: string;
  status: ApprovalStatus;
  reviewer?: string;
  updatedAt: string;
}

export interface ApprovalRuntimePayload {
  version: typeof APPROVAL_RUNTIME_VERSION;
  deliveryVersion: typeof COMMERCIAL_DELIVERY_VERSION;
  records: ApprovalRecord[];
  currentStatus: ApprovalStatus;
  summary: string;
}
