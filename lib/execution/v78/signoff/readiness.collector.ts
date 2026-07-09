/**
 * V78 P8 — Collect per-phase readiness (read-only)
 */
import { buildExecutionComplianceCatalog } from "../execution.compliance.builder";
import { buildExecutionConstraintCatalog } from "../execution.constraint.builder";
import { buildExecutionContextCatalog } from "../execution.context.builder";
import { buildExecutionEvaluationCatalog } from "../execution.evaluation.builder";
import { buildExecutionInventory } from "../execution.inventory";
import { buildExecutionPolicyCatalog } from "../execution.policy.builder";
import { buildExecutionSimulationCatalog } from "../execution.simulation.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectExecutionPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildExecutionInventory({ deploymentId }).inventoryReady;
  const p2 = buildExecutionPolicyCatalog({ deploymentId }).catalogReady;
  const p3 = buildExecutionContextCatalog({ deploymentId }).catalogReady;
  const p4 = buildExecutionConstraintCatalog({ deploymentId }).catalogReady;
  const p5 = buildExecutionEvaluationCatalog({ deploymentId }).catalogReady;
  const p6 = buildExecutionSimulationCatalog({ deploymentId }).catalogReady;
  const p7 = buildExecutionComplianceCatalog({ deploymentId }).catalogReady;

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
