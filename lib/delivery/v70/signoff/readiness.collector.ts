/**
 * V70 P8 — Collect per-phase readiness (read-only)
 */
import { buildDeliveryCompliance } from "../compliance.builder";
import { buildLifecycleManagement } from "../lifecycle.builder";
import { buildReleaseCatalog } from "../release.builder";
import { buildReleaseDependency } from "../dependency.builder";
import { buildReleasePolicy } from "../policy.builder";
import { buildUpgradeGovernance } from "../upgrade.builder";
import { buildVersionCompatibility } from "../compatibility.builder";

import type { ReadinessReport } from "./signoff.types";

export function collectDeliveryPhaseReadiness(deploymentId: string): ReadinessReport {
  const p1 = buildReleaseCatalog({ deploymentId }).catalogReady;
  const p2 = buildReleaseDependency({ deploymentId }).dependencyReady;
  const p3 = buildReleasePolicy({ deploymentId }).policyReady;
  const p4 = buildVersionCompatibility({ deploymentId }).compatibilityReady;
  const p5 = buildUpgradeGovernance({ deploymentId }).governanceReady;
  const p6 = buildLifecycleManagement({ deploymentId }).managementReady;
  const p7 = buildDeliveryCompliance({ deploymentId }).complianceReady;

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
