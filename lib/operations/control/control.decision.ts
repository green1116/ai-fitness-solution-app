/**
 * Post-Launch P7 — Operational Decision Engine
 */

import { listOperationsIncidents } from "../incident/incident.model";
import { OPS_DECISION_VERDICTS } from "./control.constants";
import { aggregateOperationsHealth } from "./control.health";
import { getOperationsOrchestration } from "./control.orchestration";
import type {
  DecideOperationsInput,
  OperationalDecision,
  OpsDecisionVerdict,
} from "./control.types";

const decisions = new Map<string, OperationalDecision>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDecision(decision: OperationalDecision): OperationalDecision {
  return {
    ...decision,
    reasons: [...decision.reasons],
    recommendedActions: [...decision.recommendedActions],
  };
}

export function decideOperations(
  input: DecideOperationsInput,
): OperationalDecision {
  const orchestration = getOperationsOrchestration(
    input.orchestrationId.trim(),
  );
  if (!orchestration) {
    throw new Error(
      `operations orchestration not found: ${input.orchestrationId}`,
    );
  }

  const health = aggregateOperationsHealth(orchestration.id);
  const openIncidents = listOperationsIncidents({
    productionOperationId: orchestration.productionOperationId,
  }).filter(
    (i) => i.status !== "RESOLVED" && i.status !== "CLOSED",
  ).length;

  const reasons: string[] = [];
  const recommendedActions: string[] = [];
  let verdict: OpsDecisionVerdict = "GO";
  let confidence = 70;

  if (health.overallScore >= 75 && openIncidents === 0) {
    verdict = "GO";
    confidence = 85;
    reasons.push(`overall health ${health.overallScore} healthy`);
    recommendedActions.push("continue steady-state operations");
  } else if (health.overallScore >= 55 && openIncidents <= 1) {
    verdict = "HOLD";
    confidence = 70;
    reasons.push(`overall health ${health.overallScore} needs watch`);
    recommendedActions.push("hold non-critical releases");
    recommendedActions.push("review degraded domains");
  } else if (openIncidents > 0 || health.overallScore < 40) {
    verdict = "ESCALATE";
    confidence = 80;
    reasons.push(
      openIncidents > 0
        ? `open incidents=${openIncidents}`
        : `critical health=${health.overallScore}`,
    );
    recommendedActions.push("escalate to incident response");
    recommendedActions.push("pause risky deployments");
  } else {
    verdict = "NO_GO";
    confidence = 75;
    reasons.push(`operations not safe: score=${health.overallScore}`);
    recommendedActions.push("freeze changes until recovery");
  }

  if (health.degradedDomains.length > 0) {
    reasons.push(`degraded=${health.degradedDomains.join(",")}`);
  }

  if (!(OPS_DECISION_VERDICTS as readonly string[]).includes(verdict)) {
    throw new Error(`invalid ops decision verdict: ${verdict}`);
  }

  const id = input.id?.trim() || createId("opsdec");
  if (decisions.has(id)) {
    throw new Error(`operational decision already exists: ${id}`);
  }

  const decision: OperationalDecision = {
    id,
    orchestrationId: orchestration.id,
    verdict,
    confidence,
    reasons,
    recommendedActions,
    decidedAt: nowIso(),
  };
  decisions.set(id, decision);
  return cloneDecision(decision);
}

export function getOperationalDecision(
  id: string,
): OperationalDecision | undefined {
  const decision = decisions.get(id.trim());
  return decision ? cloneDecision(decision) : undefined;
}

export function listOperationalDecisions(filter?: {
  orchestrationId?: string;
  verdict?: OpsDecisionVerdict;
}): OperationalDecision[] {
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

export function clearOperationalDecisions(): void {
  decisions.clear();
}
