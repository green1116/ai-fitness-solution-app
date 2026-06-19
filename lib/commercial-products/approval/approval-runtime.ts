import { APPROVAL_VERSION } from "./approval-types";
import type { ApprovalActionInput, ApprovalCreateInput, ApprovalLookup, ApprovalResponse } from "./approval-types";
import { ApprovalService } from "./approval-service";

export function createApproval(input: ApprovalCreateInput): ApprovalResponse {
  return ApprovalService.create(input);
}

export function submitForReview(input: ApprovalActionInput): ApprovalResponse {
  return ApprovalService.submit(input);
}

export function approveDelivery(input: ApprovalActionInput): ApprovalResponse {
  return ApprovalService.approve(input);
}

export function rejectDelivery(input: ApprovalActionInput): ApprovalResponse {
  return ApprovalService.reject(input);
}

export function markDelivered(input: ApprovalActionInput): ApprovalResponse {
  return ApprovalService.deliver(input);
}

export function getApprovalRecord(input: ApprovalLookup): ApprovalResponse {
  return ApprovalService.getApproval(input);
}

export function getApprovalRuntimeMeta() {
  return {
    runtimeId: "cp-approval-runtime-v47-p2-s8",
    version: APPROVAL_VERSION,
    mode: "commercial-products-approval" as const,
  };
}
