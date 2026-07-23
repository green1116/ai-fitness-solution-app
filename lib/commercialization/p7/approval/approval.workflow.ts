/**
 * Commercialization P7 — Approval workflow
 */

import { getGovernance } from "../governance/governance.registry";
import type {
  ApprovalDecision,
  ApprovalRequest,
  ApprovalState,
  DecideApprovalInput,
  SubmitApprovalInput,
} from "./approval.types";

const requests = new Map<string, ApprovalRequest>();
const decisions = new Map<string, ApprovalDecision>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRequest(request: ApprovalRequest): ApprovalRequest {
  return { ...request, metadata: { ...request.metadata } };
}

function cloneDecision(decision: ApprovalDecision): ApprovalDecision {
  return { ...decision };
}

export function submitApprovalRequest(
  input: SubmitApprovalInput,
): ApprovalRequest {
  const subject = input.subject.trim();
  const requester = input.requester.trim();
  const governanceId = input.governanceId.trim();
  if (!subject) throw new Error("approval.subject is required");
  if (!requester) throw new Error("approval.requester is required");
  if (!governanceId) throw new Error("approval.governanceId is required");
  if (!getGovernance(governanceId)) {
    throw new Error(`governance not found: ${governanceId}`);
  }
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("approval.amount must be a non-negative number");
  }

  const id = input.id?.trim() || createId("apr");
  if (requests.has(id)) {
    throw new Error(`approval request already exists: ${id}`);
  }

  const now = nowIso();
  const request: ApprovalRequest = {
    id,
    governanceId,
    subject,
    requester,
    amount: Math.round(input.amount),
    state: "PENDING",
    detail: `subject=${subject} amount=${Math.round(input.amount)} state=PENDING`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  requests.set(id, request);
  return cloneRequest(request);
}

export function decideApproval(
  input: DecideApprovalInput,
): ApprovalDecision {
  const requestId = input.requestId.trim();
  const reviewer = input.reviewer.trim();
  if (!requestId) throw new Error("decision.requestId is required");
  if (!reviewer) throw new Error("decision.reviewer is required");
  const allowed: ReadonlyArray<Exclude<ApprovalState, "PENDING">> = [
    "APPROVED",
    "REJECTED",
    "ESCALATED",
  ];
  if (!allowed.includes(input.state)) {
    throw new Error(`invalid approval decision state: ${input.state}`);
  }

  const request = requests.get(requestId);
  if (!request) throw new Error(`approval request not found: ${requestId}`);
  if (request.state !== "PENDING") {
    throw new Error(`approval request already decided: ${requestId}`);
  }

  const id = input.id?.trim() || createId("apd");
  if (decisions.has(id)) {
    throw new Error(`approval decision already exists: ${id}`);
  }

  const now = nowIso();
  request.state = input.state;
  request.updatedAt = now;
  request.detail = `subject=${request.subject} amount=${request.amount} state=${input.state}`;
  requests.set(requestId, request);

  const decision: ApprovalDecision = {
    id,
    requestId,
    state: input.state,
    reviewer,
    rationale: (input.rationale ?? "").trim() || `state=${input.state}`,
    decidedAt: now,
  };
  decisions.set(id, decision);
  return cloneDecision(decision);
}

export function getApprovalRequest(
  id: string,
): ApprovalRequest | undefined {
  const request = requests.get(id.trim());
  return request ? cloneRequest(request) : undefined;
}

export function listApprovalRequests(filter?: {
  governanceId?: string;
  state?: ApprovalState;
}): ApprovalRequest[] {
  let result = [...requests.values()];
  if (filter?.governanceId) {
    const gid = filter.governanceId.trim();
    result = result.filter((r) => r.governanceId === gid);
  }
  if (filter?.state) result = result.filter((r) => r.state === filter.state);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRequest);
}

export function listApprovalDecisions(): ApprovalDecision[] {
  return [...decisions.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDecision);
}

export function clearApprovalWorkflow(): void {
  decisions.clear();
  requests.clear();
}
