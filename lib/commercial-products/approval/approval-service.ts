import { assertPolicy } from "./approval-policy";
import { appendApprovalHistory, getApprovalHistory } from "./approval-history";
import type {
  ApprovalActionInput,
  ApprovalCreateInput,
  ApprovalLookup,
  ApprovalRecord,
  ApprovalResponse,
} from "./approval-types";

const approvals = new Map<string, ApprovalRecord>();
const approvalByQuote = new Map<string, string>();
const approvalByProject = new Map<string, string>();

function findApproval(input: ApprovalLookup): ApprovalRecord | undefined {
  if (input.approvalId) {
    return approvals.get(input.approvalId);
  }
  if (input.quoteId) {
    const approvalId = approvalByQuote.get(input.quoteId);
    return approvalId ? approvals.get(approvalId) : undefined;
  }
  if (input.projectId) {
    const approvalId = approvalByProject.get(input.projectId);
    return approvalId ? approvals.get(approvalId) : undefined;
  }
  return undefined;
}

function toResponse(record: ApprovalRecord): ApprovalResponse {
  return {
    ok: true,
    approval: record,
    history: getApprovalHistory(record.approvalId),
  };
}

export class ApprovalService {
  static create(input: ApprovalCreateInput): ApprovalResponse {
    const approvalId = `ap-${input.quoteId}`;
    const record: ApprovalRecord = {
      approvalId,
      quoteId: input.quoteId,
      projectId: input.projectId,
      status: "draft",
    };

    approvals.set(approvalId, record);
    approvalByQuote.set(input.quoteId, approvalId);
    approvalByProject.set(input.projectId, approvalId);

    return toResponse(record);
  }

  static submit(input: ApprovalActionInput): ApprovalResponse {
    const record = approvals.get(input.approvalId);
    if (!record) throw new Error(`Approval not found: ${input.approvalId}`);

    assertPolicy(record.status, "submit");
    record.status = "review";
    record.submittedAt = Date.now();
    appendApprovalHistory({
      approvalId: record.approvalId,
      action: "submit",
      summary: "submitted for review",
    });

    return toResponse(record);
  }

  static approve(input: ApprovalActionInput): ApprovalResponse {
    const record = approvals.get(input.approvalId);
    if (!record) throw new Error(`Approval not found: ${input.approvalId}`);

    assertPolicy(record.status, "approve");
    record.status = "approved";
    record.approvedAt = Date.now();
    appendApprovalHistory({
      approvalId: record.approvalId,
      action: "approve",
      summary: "approved for delivery",
    });

    return toResponse(record);
  }

  static reject(input: ApprovalActionInput): ApprovalResponse {
    const record = approvals.get(input.approvalId);
    if (!record) throw new Error(`Approval not found: ${input.approvalId}`);

    assertPolicy(record.status, "reject");
    record.status = "rejected";
    record.rejectedAt = Date.now();
    appendApprovalHistory({
      approvalId: record.approvalId,
      action: "reject",
      summary: "rejected in review",
    });

    return toResponse(record);
  }

  static deliver(input: ApprovalActionInput): ApprovalResponse {
    const record = approvals.get(input.approvalId);
    if (!record) throw new Error(`Approval not found: ${input.approvalId}`);

    assertPolicy(record.status, "deliver");
    record.status = "delivered";
    record.deliveredAt = Date.now();
    appendApprovalHistory({
      approvalId: record.approvalId,
      action: "deliver",
      summary: "marked delivered",
    });

    return toResponse(record);
  }

  static getApproval(input: ApprovalLookup): ApprovalResponse {
    const record = findApproval(input);
    if (!record) throw new Error("Approval not found");
    return toResponse(record);
  }

  static getHistory(input: ApprovalActionInput): ApprovalResponse {
    return ApprovalService.getApproval({ approvalId: input.approvalId });
  }

  static clearAll(): void {
    approvals.clear();
    approvalByQuote.clear();
    approvalByProject.clear();
  }
}

export function isApprovalDeliverable(approvalId: string): boolean {
  const record = approvals.get(approvalId);
  return record?.status === "approved" || record?.status === "delivered";
}
