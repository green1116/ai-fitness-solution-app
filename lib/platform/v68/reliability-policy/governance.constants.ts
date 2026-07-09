/**
 * V68 P6 — Reliability policy constants (read-only, P1–P5 upstream)
 */
import { V68_CAPACITY_PLANNING_VERSION } from "../capacity-planning/governance.types";
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "../configuration/governance.types";
import { V68_DEPENDENCY_GRAPH_VERSION } from "../dependency-graph/graph.types";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "../feature-flag/governance.types";
import { V68_SERVICE_CATALOG_VERSION } from "../service-catalog/catalog.types";

export const V68_RELIABILITY_POLICY_DOMAIN = "reliability-policy" as const;

export const V68_RELIABILITY_POLICY_ARTIFACT_ROOT = "lib/platform/v68/reliability-policy" as const;

export type UpstreamPlatformGovernanceLockP6 = {
  serviceCatalog: typeof V68_SERVICE_CATALOG_VERSION;
  dependencyGraph: typeof V68_DEPENDENCY_GRAPH_VERSION;
  configurationGovernance: typeof V68_CONFIGURATION_GOVERNANCE_VERSION;
  featureFlagGovernance: typeof V68_FEATURE_FLAG_GOVERNANCE_VERSION;
  capacityPlanning: typeof V68_CAPACITY_PLANNING_VERSION;
};

export const V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P6: UpstreamPlatformGovernanceLockP6 = {
  serviceCatalog: V68_SERVICE_CATALOG_VERSION,
  dependencyGraph: V68_DEPENDENCY_GRAPH_VERSION,
  configurationGovernance: V68_CONFIGURATION_GOVERNANCE_VERSION,
  featureFlagGovernance: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
  capacityPlanning: V68_CAPACITY_PLANNING_VERSION,
};

export function isUpstreamPlatformGovernanceLockP6Intact(): boolean {
  const lock = V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P6;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}
