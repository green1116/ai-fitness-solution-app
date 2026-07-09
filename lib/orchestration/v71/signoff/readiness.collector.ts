/**
 * V71 P8 — Collect per-phase readiness (read-only)
 */
import { buildOrchestrationCatalog } from "../orchestration.builder";
import { buildWorkflowDependency } from "../dependency.builder";
import { buildWorkflowPolicy } from "../policy.builder";
import { buildWorkflowCompatibility } from "../compatibility.builder";
import { buildWorkflowGovernance } from "../governance.builder";
import { buildWorkflowLifecycle } from "../lifecycle.builder";
import { buildWorkflowCompliance } from "../compliance.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectWorkflowPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildOrchestrationCatalog({ deploymentId }).catalogReady;
  const p2 = buildWorkflowDependency({ deploymentId }).dependencyReady;
  const p3 = buildWorkflowPolicy({ deploymentId }).policyReady;
  const p4 = buildWorkflowCompatibility({ deploymentId }).compatibilityReady;
  const p5 = buildWorkflowGovernance({ deploymentId }).governanceReady;
  const p6 = buildWorkflowLifecycle({ deploymentId }).lifecycleReady;
  const p7 = buildWorkflowCompliance({ deploymentId }).complianceReady;

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
