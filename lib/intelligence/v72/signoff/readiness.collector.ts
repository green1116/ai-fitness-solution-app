/**
 * V72 P8 — Collect per-phase readiness (read-only)
 */
import { buildIntelligenceCatalog } from "../intelligence.builder";
import { buildSignalDependency } from "../dependency.builder";
import { buildIntelligencePolicy } from "../policy.builder";
import { buildIntelligenceCompatibility } from "../compatibility.builder";
import { buildIntelligenceGovernance } from "../governance.builder";
import { buildIntelligenceLifecycle } from "../lifecycle.builder";
import { buildIntelligenceCompliance } from "../compliance.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectIntelligencePhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildIntelligenceCatalog({ deploymentId }).catalogReady;
  const p2 = buildSignalDependency({ deploymentId }).dependencyReady;
  const p3 = buildIntelligencePolicy({ deploymentId }).policyReady;
  const p4 = buildIntelligenceCompatibility({ deploymentId }).compatibilityReady;
  const p5 = buildIntelligenceGovernance({ deploymentId }).governanceReady;
  const p6 = buildIntelligenceLifecycle({ deploymentId }).lifecycleReady;
  const p7 = buildIntelligenceCompliance({ deploymentId }).complianceReady;

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
