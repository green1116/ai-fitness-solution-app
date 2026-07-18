/**
 * E07-P5 — Human Collaboration Request helpers
 */

import type {
  CollaborationDefinition,
  HumanCollaborationRequest,
  HumanDecision,
} from "./collaboration.types";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function createHumanCollaborationRequest(
  collaboration: CollaborationDefinition,
  options?: {
    requestId?: string;
    prompt?: string;
  },
): HumanCollaborationRequest {
  return {
    requestId: options?.requestId?.trim() || createId("hum-req"),
    collaborationId: collaboration.id,
    orchestrationId: collaboration.orchestrationId,
    humanRole: collaboration.humanRole,
    mode: collaboration.mode,
    prompt:
      options?.prompt?.trim() ||
      `Please ${collaboration.mode} orchestration ${collaboration.orchestrationId} as ${collaboration.humanRole}`,
    status: "pending",
    readOnly: true,
  };
}

export function decideHumanCollaborationRequest(
  request: HumanCollaborationRequest,
  decision: HumanDecision,
  note?: string,
): HumanCollaborationRequest {
  if (request.status !== "pending") {
    throw new Error(
      `request ${request.requestId} is not pending (status=${request.status})`,
    );
  }

  return {
    ...request,
    status: "decided",
    decision,
    decidedAt: nowIso(),
    note: note?.trim() || undefined,
    readOnly: true,
  };
}

export function isHumanDecisionAllowingRun(decision?: HumanDecision): boolean {
  return decision === "approve";
}
