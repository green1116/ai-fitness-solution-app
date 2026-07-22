/**
 * Evolution P7 — Cross-Layer Decision Engine
 */

import { EVO_DECISION_VERDICTS } from "./control.constants";
import { listIntelligenceCommandCenters } from "./control.command";
import { listAutonomousImprovementLoops } from "./control.loop";
import { getEvolutionOrchestration } from "./control.orchestration";
import type {
  DecideEvolutionInput,
  EvolutionDecision,
  EvoDecisionVerdict,
} from "./control.types";

const decisions = new Map<string, EvolutionDecision>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDecision(decision: EvolutionDecision): EvolutionDecision {
  return {
    ...decision,
    reasons: [...decision.reasons],
    recommendedActions: [...decision.recommendedActions],
  };
}

export function decideEvolution(
  input: DecideEvolutionInput,
): EvolutionDecision {
  const orchestration = getEvolutionOrchestration(
    input.orchestrationId.trim(),
  );
  if (!orchestration) {
    throw new Error(
      `evolution orchestration not found: ${input.orchestrationId}`,
    );
  }

  const present = orchestration.domains.filter((d) => d.present);
  const avgScore =
    present.length === 0
      ? 0
      : Math.round(
          present.reduce((sum, d) => sum + d.score, 0) / present.length,
        );
  const weakCount = present.filter((d) => d.score < 50).length;
  const missingCount = orchestration.domains.filter((d) => !d.present).length;

  const command = listIntelligenceCommandCenters({
    orchestrationId: orchestration.id,
  })[0];
  const loop = listAutonomousImprovementLoops({
    orchestrationId: orchestration.id,
  })[0];

  const reasons: string[] = [];
  const recommendedActions: string[] = [];
  let verdict: EvoDecisionVerdict = "ADVANCE";
  let confidence = 70;

  if (
    avgScore >= 70 &&
    weakCount === 0 &&
    orchestration.status === "ACTIVE" &&
    (loop?.status === "CONVERGED" || loop?.status === "RUNNING")
  ) {
    verdict = "ADVANCE";
    confidence = 88;
    reasons.push(`cross-layer score=${avgScore}`);
    reasons.push(`coverage=${present.length}/6`);
    recommendedActions.push("advance evolution roadmap");
    recommendedActions.push("continue autonomous improvement cadence");
  } else if (avgScore >= 50 && weakCount <= 1) {
    verdict = "HOLD";
    confidence = 72;
    reasons.push(`cross-layer score=${avgScore} needs stabilization`);
    if (command) reasons.push(`command-mode=${command.mode}`);
    recommendedActions.push("hold high-risk evolution changes");
    recommendedActions.push("focus command center on weak domains");
  } else if (weakCount >= 2 || avgScore < 35 || loop?.status === "BLOCKED") {
    verdict = "ESCALATE";
    confidence = 82;
    reasons.push(
      weakCount >= 2
        ? `weak-domains=${weakCount}`
        : `critical-score=${avgScore}`,
    );
    recommendedActions.push("escalate to evolution operators");
    recommendedActions.push("pause marketplace and global expansion");
  } else {
    verdict = "ROLLBACK";
    confidence = 75;
    reasons.push(`unstable evolution posture score=${avgScore}`);
    if (missingCount > 0) reasons.push(`unbound-domains=${missingCount}`);
    recommendedActions.push("rollback recent evolution experiments");
    recommendedActions.push("restore steady-state bindings");
  }

  if (!(EVO_DECISION_VERDICTS as readonly string[]).includes(verdict)) {
    throw new Error(`invalid evolution decision verdict: ${verdict}`);
  }

  const id = input.id?.trim() || createId("evodec");
  if (decisions.has(id)) {
    throw new Error(`evolution decision already exists: ${id}`);
  }

  const decision: EvolutionDecision = {
    id,
    orchestrationId: orchestration.id,
    verdict,
    confidence,
    reasons,
    recommendedActions,
    detail: `verdict=${verdict} confidence=${confidence}`,
    decidedAt: nowIso(),
  };
  decisions.set(id, decision);
  return cloneDecision(decision);
}

export function getEvolutionDecision(
  id: string,
): EvolutionDecision | undefined {
  const decision = decisions.get(id.trim());
  return decision ? cloneDecision(decision) : undefined;
}

export function listEvolutionDecisions(filter?: {
  orchestrationId?: string;
  verdict?: EvoDecisionVerdict;
}): EvolutionDecision[] {
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

export function clearEvolutionDecisions(): void {
  decisions.clear();
}
