/**
 * V74 P8 — Collect per-phase readiness (read-only)
 */
import { buildDecisionComplianceCatalog } from "../decision.compliance.builder";
import { buildDecisionConstraintCatalog } from "../decision.constraint.builder";
import { buildDecisionContextCatalog } from "../decision.context.builder";
import { buildDecisionEvaluationCatalog } from "../decision.evaluation.builder";
import { buildDecisionInventory } from "../decision.inventory";
import { buildDecisionPolicyCatalog } from "../decision.policy.builder";
import { buildDecisionSimulationCatalog } from "../decision.simulation.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectDecisionPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildDecisionInventory({ deploymentId }).inventoryReady;
  const p2 = buildDecisionPolicyCatalog({ deploymentId }).catalogReady;
  const p3 = buildDecisionContextCatalog({ deploymentId }).catalogReady;
  const p4 = buildDecisionConstraintCatalog({ deploymentId }).catalogReady;
  const p5 = buildDecisionEvaluationCatalog({ deploymentId }).catalogReady;
  const p6 = buildDecisionSimulationCatalog({ deploymentId }).catalogReady;
  const p7 = buildDecisionComplianceCatalog({ deploymentId }).catalogReady;

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
