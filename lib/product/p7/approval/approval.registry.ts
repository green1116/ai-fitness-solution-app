/**
 * Product P7 — Approval registry
 */

import { APPROVAL_STATUSES } from "../collaboration/collaboration.constants";
import { getCollaboration } from "../collaboration/collaboration.registry";
import type {
  ApprovalRequest,
  DecideApprovalInput,
  RequestApprovalInput,
} from "./approval.types";

const approvals = new Map<string, ApprovalRequest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneApproval(approval: ApprovalRequest): ApprovalRequest {
  return { ...approval, metadata: { ...approval.metadata } };
}

export function requestApproval(
  input: RequestApprovalInput,
): ApprovalRequest {
  const collaborationId = input.collaborationId.trim();
  const approver = input.approver.trim();
  if (!collaborationId) {
    throw new Error("approval.collaborationId is required");
  }
  if (!approver) throw new Error("approval.approver is required");
  if (!getCollaboration(collaborationId)) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const id = input.id?.trim() || createId("p7apr");
  if (approvals.has(id)) {
    throw new Error(`approval already exists: ${id}`);
  }

  const status = APPROVAL_STATUSES[0];
  const rationale = (input.rationale ?? "").trim();
  const approval: ApprovalRequest = {
    id,
    collaborationId,
    approver,
    status,
    rationale,
    detail: `status=${status} approver=${approver}`,
    metadata: { ...(input.metadata ?? {}) },
    requestedAt: nowIso(),
  };
  approvals.set(id, approval);
  return cloneApproval(approval);
}

export function decideApproval(input: DecideApprovalInput): ApprovalRequest {
  const approvalId = input.approvalId.trim();
  if (!approvalId) throw new Error("approval.approvalId is required");
  if (!(APPROVAL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid approval status: ${input.status}`);
  }
  const existing = approvals.get(approvalId);
  if (!existing) throw new Error(`approval not found: ${approvalId}`);
  if (existing.status !== "REQUESTED") {
    throw new Error(`approval already decided: ${approvalId}`);
  }

  const rationale = (input.rationale ?? existing.rationale).trim();
  const updated: ApprovalRequest = {
    ...existing,
    status: input.status,
    rationale,
    detail: `status=${input.status} approver=${existing.approver}`,
    metadata: { ...existing.metadata },
    decidedAt: nowIso(),
  };
  approvals.set(approvalId, updated);
  return cloneApproval(updated);
}

export function getApproval(id: string): ApprovalRequest | undefined {
  const approval = approvals.get(id.trim());
  return approval ? cloneApproval(approval) : undefined;
}

export function listApprovals(filter?: {
  collaborationId?: string;
}): ApprovalRequest[] {
  let result = [...approvals.values()];
  if (filter?.collaborationId) {
    const cid = filter.collaborationId.trim();
    result = result.filter((a) => a.collaborationId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneApproval);
}

export function clearApprovals(): void {
  approvals.clear();
}
