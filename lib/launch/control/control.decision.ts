/**
 * Launch P7 — Release Decision Model
 */

import { RELEASE_DECISION_VERDICTS } from "./control.constants";
import {
  getLaunchOrchestration,
  setOrchestrationStatus,
} from "./control.orchestration";
import type {
  CreateReleaseDecisionInput,
  ReleaseDecision,
  ReleaseDecisionVerdict,
} from "./control.types";

const decisions = new Map<string, ReleaseDecision>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDecision(decision: ReleaseDecision): ReleaseDecision {
  return { ...decision, conditions: [...decision.conditions] };
}

export function createReleaseDecision(
  input: CreateReleaseDecisionInput,
): ReleaseDecision {
  const orchestrationId = input.orchestrationId.trim();
  const rationale = input.rationale.trim();
  const decidedBy = input.decidedBy.trim();
  const verdict = input.verdict;

  if (!rationale) throw new Error("releaseDecision.rationale is required");
  if (!decidedBy) throw new Error("releaseDecision.decidedBy is required");
  if (!(RELEASE_DECISION_VERDICTS as readonly string[]).includes(verdict)) {
    throw new Error(`invalid release decision verdict: ${verdict}`);
  }

  const orchestration = getLaunchOrchestration(orchestrationId);
  if (!orchestration) {
    throw new Error(`orchestration not found: ${orchestrationId}`);
  }

  const id = input.id?.trim() || createId("reldec");
  if (decisions.has(id)) {
    throw new Error(`release decision already exists: ${id}`);
  }

  const decision: ReleaseDecision = {
    id,
    orchestrationId,
    verdict,
    rationale,
    decidedBy,
    conditions: input.conditions?.map((c) => c.trim()).filter(Boolean) ?? [],
    decidedAt: nowIso(),
  };
  decisions.set(id, decision);

  if (verdict === "APPROVE") {
    setOrchestrationStatus(orchestrationId, "COMPLETED");
  } else if (verdict === "REJECT") {
    setOrchestrationStatus(orchestrationId, "ABORTED");
  } else if (verdict === "CONDITIONAL" || verdict === "DEFER") {
    setOrchestrationStatus(orchestrationId, "IN_PROGRESS");
  }

  return cloneDecision(decision);
}

export function getReleaseDecision(id: string): ReleaseDecision | undefined {
  const decision = decisions.get(id.trim());
  return decision ? cloneDecision(decision) : undefined;
}

export function listReleaseDecisions(filter?: {
  orchestrationId?: string;
  verdict?: ReleaseDecisionVerdict;
}): ReleaseDecision[] {
  let result = [...decisions.values()];
  if (filter?.orchestrationId) {
    const oid = filter.orchestrationId.trim();
    result = result.filter((d) => d.orchestrationId === oid);
  }
  if (filter?.verdict) {
    result = result.filter((d) => d.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDecision);
}

export function getLatestReleaseDecision(
  orchestrationId: string,
): ReleaseDecision | undefined {
  const list = listReleaseDecisions({ orchestrationId });
  if (list.length === 0) return undefined;
  return list.sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0];
}

export function clearReleaseDecisions(): void {
  decisions.clear();
}
