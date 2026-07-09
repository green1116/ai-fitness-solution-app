/**
 * V73 P8 — Collect per-phase readiness (read-only)
 */
import { buildKnowledgeCompatibility } from "../compatibility.builder";
import { buildKnowledgeCompliance } from "../compliance.builder";
import { buildKnowledgeDependency } from "../dependency.builder";
import { buildKnowledgeGovernance } from "../governance.builder";
import { buildKnowledgeCatalog } from "../knowledge.builder";
import { buildKnowledgePolicy } from "../policy.builder";
import { buildKnowledgeLifecycle } from "../lifecycle.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectKnowledgePhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildKnowledgeCatalog({ deploymentId }).catalogReady;
  const p2 = buildKnowledgeDependency({ deploymentId }).dependencyReady;
  const p3 = buildKnowledgePolicy({ deploymentId }).policyReady;
  const p4 = buildKnowledgeCompatibility({ deploymentId }).compatibilityReady;
  const p5 = buildKnowledgeGovernance({ deploymentId }).governanceReady;
  const p6 = buildKnowledgeLifecycle({ deploymentId }).lifecycleReady;
  const p7 = buildKnowledgeCompliance({ deploymentId }).complianceReady;

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
