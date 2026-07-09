/**
 * V76 P8 — Collect per-phase readiness (read-only)
 */
import { buildCollaborationComplianceCatalog } from "../collaboration.compliance.builder";
import { buildCollaborationConstraintCatalog } from "../collaboration.constraint.builder";
import { buildCollaborationContextCatalog } from "../collaboration.context.builder";
import { buildCollaborationEvaluationCatalog } from "../collaboration.evaluation.builder";
import { buildCollaborationInventory } from "../collaboration.inventory";
import { buildCollaborationPolicyCatalog } from "../collaboration.policy.builder";
import { buildCollaborationSimulationCatalog } from "../collaboration.simulation.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectCollaborationPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildCollaborationInventory({ deploymentId }).inventoryReady;
  const p2 = buildCollaborationPolicyCatalog({ deploymentId }).catalogReady;
  const p3 = buildCollaborationContextCatalog({ deploymentId }).catalogReady;
  const p4 = buildCollaborationConstraintCatalog({ deploymentId }).catalogReady;
  const p5 = buildCollaborationEvaluationCatalog({ deploymentId }).catalogReady;
  const p6 = buildCollaborationSimulationCatalog({ deploymentId }).catalogReady;
  const p7 = buildCollaborationComplianceCatalog({ deploymentId }).catalogReady;

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
