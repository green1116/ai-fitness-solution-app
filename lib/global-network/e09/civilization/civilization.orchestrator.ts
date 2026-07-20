/**
 * E09-P7 — Civilization Orchestrator
 * Orchestrate, synchronize, and evaluate civilizations across e09 layers
 */

import { getAgent } from "../agent/agent.registry";
import { getEconomicNode } from "../economy/economy.registry";
import { getFederation } from "../federation/federation.registry";
import { getMarket } from "../market/market.registry";
import { getRegion } from "../regional/regional.registry";
import {
  CIVILIZATION_STAGES,
  ORCHESTRATION_MODES,
} from "./civilization.constants";
import {
  getCivilization,
  updateCivilization,
} from "./civilization.registry";
import type {
  Civilization,
  CivilizationEvaluation,
  CivilizationStage,
  OrchestrationMode,
  OrchestrationPlan,
  SynchronizationReport,
} from "./civilization.types";

const plans = new Map<string, OrchestrationPlan>();
const syncReports = new Map<string, SynchronizationReport>();
const evaluations = new Map<string, CivilizationEvaluation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: OrchestrationPlan): OrchestrationPlan {
  return {
    ...plan,
    layerCounts: { ...plan.layerCounts },
    steps: [...plan.steps],
  };
}

function cloneSync(report: SynchronizationReport): SynchronizationReport {
  return {
    ...report,
    missing: {
      regions: [...report.missing.regions],
      markets: [...report.missing.markets],
      federations: [...report.missing.federations],
      economicNodes: [...report.missing.economicNodes],
      agents: [...report.missing.agents],
    },
  };
}

function cloneEvaluation(
  evaluation: CivilizationEvaluation,
): CivilizationEvaluation {
  return {
    ...evaluation,
    findings: [...evaluation.findings],
    recommendations: [...evaluation.recommendations],
  };
}

function assertMode(mode: string): asserts mode is OrchestrationMode {
  if (!(ORCHESTRATION_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid orchestration mode: ${mode}`);
  }
}

function resolveCivilization(civilizationId: string): Civilization {
  const id = civilizationId.trim();
  if (!id) throw new Error("civilizationId is required");
  const civilization = getCivilization(id);
  if (!civilization) throw new Error(`civilization not found: ${id}`);
  if (civilization.status === "ARCHIVED") {
    throw new Error(`civilization is ARCHIVED: ${id}`);
  }
  return civilization;
}

function stageFromScore(score: number): CivilizationStage {
  if (score >= 85) return "MATURE";
  if (score >= 70) return "EXPANDING";
  if (score >= 50) return "OPERATING";
  if (score >= 25) return "FORMING";
  return "NASCENT";
}

function buildSteps(
  civilization: Civilization,
  mode: OrchestrationMode,
): string[] {
  const steps: string[] = [`mode=${mode}`];

  if (mode === "REGIONAL" || mode === "UNIFIED") {
    steps.push(`align regions (${civilization.regionIds.length})`);
  }
  if (mode === "MARKET" || mode === "UNIFIED") {
    steps.push(`align markets (${civilization.marketIds.length})`);
  }
  if (mode === "FEDERATED" || mode === "UNIFIED") {
    steps.push(`align federations (${civilization.federationIds.length})`);
  }
  if (mode === "ECONOMIC" || mode === "UNIFIED") {
    steps.push(
      `align economic nodes (${civilization.economicNodeIds.length})`,
    );
  }
  if (mode === "AGENTIC" || mode === "UNIFIED") {
    steps.push(`align agents (${civilization.agentIds.length})`);
  }

  steps.push("publish orchestration plan");
  return steps;
}

/** Build an orchestration plan for a civilization. */
export function orchestrate(
  civilizationId: string,
  options?: { mode?: OrchestrationMode },
): OrchestrationPlan {
  const civilization = resolveCivilization(civilizationId);
  const mode = options?.mode ?? "UNIFIED";
  assertMode(mode);

  updateCivilization(civilization.id, { status: "SYNCING" });

  const plan: OrchestrationPlan = {
    id: createId("civ-orch"),
    civilizationId: civilization.id,
    mode,
    layerCounts: {
      regions: civilization.regionIds.length,
      markets: civilization.marketIds.length,
      federations: civilization.federationIds.length,
      economicNodes: civilization.economicNodeIds.length,
      agents: civilization.agentIds.length,
    },
    steps: buildSteps(civilization, mode),
    createdAt: nowIso(),
  };

  plans.set(plan.id, plan);
  updateCivilization(civilization.id, { status: "ACTIVE" });
  return clonePlan(plan);
}

/** Synchronize civilization bindings against live e09 registries. */
export function synchronize(civilizationId: string): SynchronizationReport {
  const civilization = resolveCivilization(civilizationId);
  updateCivilization(civilization.id, { status: "SYNCING" });

  const missing = {
    regions: civilization.regionIds.filter((id) => !getRegion(id)),
    markets: civilization.marketIds.filter((id) => !getMarket(id)),
    federations: civilization.federationIds.filter((id) => !getFederation(id)),
    economicNodes: civilization.economicNodeIds.filter(
      (id) => !getEconomicNode(id),
    ),
    agents: civilization.agentIds.filter((id) => !getAgent(id)),
  };

  const missingCount =
    missing.regions.length +
    missing.markets.length +
    missing.federations.length +
    missing.economicNodes.length +
    missing.agents.length;

  const aligned = missingCount === 0;
  const report: SynchronizationReport = {
    id: createId("civ-sync"),
    civilizationId: civilization.id,
    aligned,
    missing,
    syncedAt: nowIso(),
    summary: aligned
      ? `civilization ${civilization.code} fully aligned`
      : `civilization ${civilization.code} missing ${missingCount} binding(s)`,
  };

  syncReports.set(report.id, report);
  updateCivilization(civilization.id, {
    status: aligned ? "ACTIVE" : "SUSPENDED",
  });
  return cloneSync(report);
}

/** Evaluate civilization health and advance stage from score. */
export function evaluate(civilizationId: string): CivilizationEvaluation {
  const civilization = resolveCivilization(civilizationId);
  const sync = synchronize(civilization.id);

  const layerPresence =
    (civilization.regionIds.length > 0 ? 15 : 0) +
    (civilization.marketIds.length > 0 ? 15 : 0) +
    (civilization.federationIds.length > 0 ? 20 : 0) +
    (civilization.economicNodeIds.length > 0 ? 20 : 0) +
    (civilization.agentIds.length > 0 ? 20 : 0);

  const breadth =
    Math.min(10, civilization.regionIds.length) +
    Math.min(10, civilization.marketIds.length) +
    Math.min(10, civilization.federationIds.length) +
    Math.min(10, civilization.economicNodeIds.length) +
    Math.min(10, civilization.agentIds.length);

  let score = Math.min(100, layerPresence + Math.round(breadth / 2));
  if (!sync.aligned) score = Math.max(0, score - 25);

  const findings: string[] = [];
  const recommendations: string[] = [];

  if (!sync.aligned) {
    findings.push(sync.summary);
    recommendations.push("repair missing e09 bindings then re-sync");
  }
  if (civilization.regionIds.length === 0) {
    findings.push("no regions bound");
    recommendations.push("bind at least one region");
  }
  if (civilization.agentIds.length === 0) {
    findings.push("no agents bound");
    recommendations.push("bind agent federation members");
  }
  if (civilization.economicNodeIds.length === 0) {
    findings.push("no economic nodes bound");
    recommendations.push("attach economy nodes for value flow");
  }
  if (findings.length === 0) {
    findings.push("civilization layers present and aligned");
    recommendations.push("maintain UNIFIED orchestration cadence");
  }

  const stage = stageFromScore(score);
  updateCivilization(civilization.id, {
    score,
    stage,
    status: sync.aligned ? "ACTIVE" : "SUSPENDED",
  });

  const evaluation: CivilizationEvaluation = {
    id: createId("civ-eval"),
    civilizationId: civilization.id,
    score,
    stage,
    status: sync.aligned ? "ACTIVE" : "SUSPENDED",
    findings,
    recommendations,
    evaluatedAt: nowIso(),
  };

  evaluations.set(evaluation.id, evaluation);
  return cloneEvaluation(evaluation);
}

export function getOrchestrationPlan(
  id: string,
): OrchestrationPlan | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listOrchestrationPlans(
  civilizationId?: string,
): OrchestrationPlan[] {
  let result = [...plans.values()];
  if (civilizationId) {
    const id = civilizationId.trim();
    result = result.filter((p) => p.civilizationId === id);
  }
  return result
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(clonePlan);
}

export function listSynchronizationReports(
  civilizationId?: string,
): SynchronizationReport[] {
  let result = [...syncReports.values()];
  if (civilizationId) {
    const id = civilizationId.trim();
    result = result.filter((r) => r.civilizationId === id);
  }
  return result
    .slice()
    .sort((a, b) => a.syncedAt.localeCompare(b.syncedAt))
    .map(cloneSync);
}

export function listEvaluations(
  civilizationId?: string,
): CivilizationEvaluation[] {
  let result = [...evaluations.values()];
  if (civilizationId) {
    const id = civilizationId.trim();
    result = result.filter((e) => e.civilizationId === id);
  }
  return result
    .slice()
    .sort((a, b) => a.evaluatedAt.localeCompare(b.evaluatedAt))
    .map(cloneEvaluation);
}

export function clearOrchestratorState(): void {
  plans.clear();
  syncReports.clear();
  evaluations.clear();
}

export function suggestedStage(score: number): CivilizationStage {
  return stageFromScore(score);
}

export { CIVILIZATION_STAGES };
