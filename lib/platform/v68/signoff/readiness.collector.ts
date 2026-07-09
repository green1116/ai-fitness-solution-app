/**
 * V68 P8 — Collect per-phase readiness (read-only)
 */
import { buildCapacityPlanningReport } from "../capacity-planning/governance.builder";
import { buildConfigurationGovernanceReport } from "../configuration/governance.builder";
import { buildDependencyGraphReport } from "../dependency-graph/graph.builder";
import { buildFeatureFlagGovernanceReport } from "../feature-flag/governance.builder";
import { buildObservabilityPolicyReport } from "../observability-policy/governance.builder";
import { buildReliabilityPolicyReport } from "../reliability-policy/governance.builder";
import { buildServiceCatalogReport } from "../service-catalog/catalog.builder";

import type { PlatformPhaseReadiness } from "./signoff.types";

export function collectPlatformPhaseReadiness(deploymentId: string): PlatformPhaseReadiness {
  return {
    p1: buildServiceCatalogReport({ deploymentId }).catalogReady,
    p2: buildDependencyGraphReport({ deploymentId }).graphReady,
    p3: buildConfigurationGovernanceReport({ deploymentId }).governanceReady,
    p4: buildFeatureFlagGovernanceReport({ deploymentId }).governanceReady,
    p5: buildCapacityPlanningReport({ deploymentId }).planningReady,
    p6: buildReliabilityPolicyReport({ deploymentId }).policyReady,
    p7: buildObservabilityPolicyReport({ deploymentId }).policyReady,
  };
}
