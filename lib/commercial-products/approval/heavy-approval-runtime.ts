import type {
  ApprovalActionInput,
  ApprovalCreateInput,
  ApprovalLookup,
  ApprovalResponse,
} from "./approval-types";

export async function createApprovalHeavy(input: ApprovalCreateInput): Promise<ApprovalResponse> {
  const { createApproval } = await import("./approval-runtime");
  return createApproval(input);
}

export async function runApprovalActionHeavy(
  action: "submit" | "approve" | "reject" | "deliver",
  input: ApprovalActionInput,
): Promise<ApprovalResponse> {
  const runtime = await import("./approval-runtime");
  if (action === "submit") return runtime.submitForReview(input);
  if (action === "approve") return runtime.approveDelivery(input);
  if (action === "reject") return runtime.rejectDelivery(input);
  return runtime.markDelivered(input);
}

export async function getApprovalHeavy(input: ApprovalLookup): Promise<ApprovalResponse> {
  const { getApprovalRecord } = await import("./approval-runtime");
  return getApprovalRecord(input);
}
