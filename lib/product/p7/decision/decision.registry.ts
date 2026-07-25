/**
 * Product P7 — Decision registry
 */

import { DECISION_VERDICTS } from "../collaboration/collaboration.constants";
import { getCollaboration } from "../collaboration/collaboration.registry";
import type {
  CollaborationDecision,
  CreateDecisionInput,
  DecisionVerdict,
} from "./decision.types";

const decisions = new Map<string, CollaborationDecision>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDecision(
  decision: CollaborationDecision,
): CollaborationDecision {
  return {
    ...decision,
    conditions: [...decision.conditions],
    metadata: { ...decision.metadata },
  };
}

export function createDecision(
  input: CreateDecisionInput,
): CollaborationDecision {
  const collaborationId = input.collaborationId.trim();
  const decidedBy = input.decidedBy.trim();
  const rationale = input.rationale.trim();
  if (!collaborationId) {
    throw new Error("decision.collaborationId is required");
  }
  if (!decidedBy) throw new Error("decision.decidedBy is required");
  if (!rationale) throw new Error("decision.rationale is required");
  if (!(DECISION_VERDICTS as readonly string[]).includes(input.verdict)) {
    throw new Error(`invalid decision verdict: ${input.verdict}`);
  }
  if (!getCollaboration(collaborationId)) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const id = input.id?.trim() || createId("p7dec");
  if (decisions.has(id)) {
    throw new Error(`decision already exists: ${id}`);
  }

  const conditions = (input.conditions ?? [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const decision: CollaborationDecision = {
    id,
    collaborationId,
    verdict: input.verdict,
    decidedBy,
    rationale,
    conditions,
    detail: `verdict=${input.verdict} by=${decidedBy}`,
    metadata: { ...(input.metadata ?? {}) },
    decidedAt: nowIso(),
  };
  decisions.set(id, decision);
  return cloneDecision(decision);
}

export function getDecision(id: string): CollaborationDecision | undefined {
  const decision = decisions.get(id.trim());
  return decision ? cloneDecision(decision) : undefined;
}

export function listDecisions(filter?: {
  collaborationId?: string;
  verdict?: DecisionVerdict;
}): CollaborationDecision[] {
  let result = [...decisions.values()];
  if (filter?.collaborationId) {
    const cid = filter.collaborationId.trim();
    result = result.filter((d) => d.collaborationId === cid);
  }
  if (filter?.verdict) {
    result = result.filter((d) => d.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDecision);
}

export function clearDecisions(): void {
  decisions.clear();
}
