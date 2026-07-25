/**
 * Product Identity — Access registry
 */

import { ACCESS_DECISIONS } from "../authentication/authentication.constants";
import { getPrincipal } from "../principal/principal.registry";
import type {
  AccessDecision,
  AccessEvaluation,
  EvaluateAccessInput,
} from "./access.types";

const evaluations = new Map<string, AccessEvaluation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvaluation(
  evaluation: AccessEvaluation,
): AccessEvaluation {
  return { ...evaluation, metadata: { ...evaluation.metadata } };
}

export function evaluateAccess(
  input: EvaluateAccessInput,
): AccessEvaluation {
  const principalId = input.principalId.trim();
  const resource = input.resource.trim();
  const action = input.action.trim();
  if (!principalId) throw new Error("access.principalId is required");
  if (!resource) throw new Error("access.resource is required");
  if (!action) throw new Error("access.action is required");
  if (!getPrincipal(principalId)) {
    throw new Error(`principal not found: ${principalId}`);
  }

  const decision = input.decision ?? ACCESS_DECISIONS[0];
  if (!(ACCESS_DECISIONS as readonly string[]).includes(decision)) {
    throw new Error(`invalid access decision: ${decision}`);
  }

  const id = input.id?.trim() || createId("idacc");
  if (evaluations.has(id)) {
    throw new Error(`access evaluation already exists: ${id}`);
  }

  const evaluation: AccessEvaluation = {
    id,
    principalId,
    resource,
    action,
    decision,
    detail: `decision=${decision} action=${action}`,
    metadata: { ...(input.metadata ?? {}) },
    evaluatedAt: nowIso(),
  };
  evaluations.set(id, evaluation);
  return cloneEvaluation(evaluation);
}

export function getAccess(id: string): AccessEvaluation | undefined {
  const evaluation = evaluations.get(id.trim());
  return evaluation ? cloneEvaluation(evaluation) : undefined;
}

export function listAccess(filter?: {
  principalId?: string;
  decision?: AccessDecision;
}): AccessEvaluation[] {
  let result = [...evaluations.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((e) => e.principalId === pid);
  }
  if (filter?.decision) {
    result = result.filter((e) => e.decision === filter.decision);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvaluation);
}

export function clearAccess(): void {
  evaluations.clear();
}
