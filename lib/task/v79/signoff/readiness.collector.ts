/**
 * V79 P8 — Collect per-phase readiness (read-only)
 */
import { buildTaskComplianceCatalog } from "../task.compliance.builder";
import { buildTaskConstraintCatalog } from "../task.constraint.builder";
import { buildTaskContextCatalog } from "../task.context.builder";
import { buildTaskEvaluationCatalog } from "../task.evaluation.builder";
import { buildTaskInventory } from "../task.inventory";
import { buildTaskPolicyCatalog } from "../task.policy.builder";
import { buildTaskSimulationCatalog } from "../task.simulation.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectTaskPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildTaskInventory({ deploymentId }).inventoryReady;
  const p2 = buildTaskPolicyCatalog({ deploymentId }).catalogReady;
  const p3 = buildTaskContextCatalog({ deploymentId }).catalogReady;
  const p4 = buildTaskConstraintCatalog({ deploymentId }).catalogReady;
  const p5 = buildTaskEvaluationCatalog({ deploymentId }).catalogReady;
  const p6 = buildTaskSimulationCatalog({ deploymentId }).catalogReady;
  const p7 = buildTaskComplianceCatalog({ deploymentId }).catalogReady;

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
