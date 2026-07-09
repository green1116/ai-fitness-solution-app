/**
 * V75 P8 — Collect per-phase readiness (read-only)
 */
import { buildAgentComplianceCatalog } from "../agent.compliance.builder";
import { buildAgentConstraintCatalog } from "../agent.constraint.builder";
import { buildAgentContextCatalog } from "../agent.context.builder";
import { buildAgentEvaluationCatalog } from "../agent.evaluation.builder";
import { buildAgentInventory } from "../agent.inventory";
import { buildAgentPolicyCatalog } from "../agent.policy.builder";
import { buildAgentSimulationCatalog } from "../agent.simulation.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectAgentPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildAgentInventory({ deploymentId }).inventoryReady;
  const p2 = buildAgentPolicyCatalog({ deploymentId }).catalogReady;
  const p3 = buildAgentContextCatalog({ deploymentId }).catalogReady;
  const p4 = buildAgentConstraintCatalog({ deploymentId }).catalogReady;
  const p5 = buildAgentEvaluationCatalog({ deploymentId }).catalogReady;
  const p6 = buildAgentSimulationCatalog({ deploymentId }).catalogReady;
  const p7 = buildAgentComplianceCatalog({ deploymentId }).catalogReady;

  const ready = p1 && p2 && p3 && p4 && p5 && p6 && p7;
  const blocked = !ready;

  return {
    p1,
    p2,
    p3,
    p4,
    p5,
    p6,
    p7,
    ready,
    blocked,
    summary: [
      `readiness ready=${ready}`,
      `phases=${[p1, p2, p3, p4, p5, p6, p7].filter(Boolean).length}/7`,
      `blocked=${blocked}`,
    ].join(" "),
  };
}
