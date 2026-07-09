/**
 * V77 P8 — Collect per-phase readiness (read-only)
 */
import { buildPlanningComplianceCatalog } from "../planning.compliance.builder";
import { buildPlanningConstraintCatalog } from "../planning.constraint.builder";
import { buildPlanningContextCatalog } from "../planning.context.builder";
import { buildPlanningEvaluationCatalog } from "../planning.evaluation.builder";
import { buildPlanningInventory } from "../planning.inventory";
import { buildPlanningPolicyCatalog } from "../planning.policy.builder";
import { buildPlanningSimulationCatalog } from "../planning.simulation.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectPlanningPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildPlanningInventory({ deploymentId }).inventoryReady;
  const p2 = buildPlanningPolicyCatalog({ deploymentId }).catalogReady;
  const p3 = buildPlanningContextCatalog({ deploymentId }).catalogReady;
  const p4 = buildPlanningConstraintCatalog({ deploymentId }).catalogReady;
  const p5 = buildPlanningEvaluationCatalog({ deploymentId }).catalogReady;
  const p6 = buildPlanningSimulationCatalog({ deploymentId }).catalogReady;
  const p7 = buildPlanningComplianceCatalog({ deploymentId }).catalogReady;

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
