/**
 * V68 P4 — Feature flag governance constants (read-only, P1–P3 upstream)
 */
import { V68_CONFIGURATION_GOVERNANCE_VERSION } from "../configuration/governance.types";
import { V68_DEPENDENCY_GRAPH_VERSION } from "../dependency-graph/graph.types";
import { V68_SERVICE_CATALOG_VERSION } from "../service-catalog/catalog.types";

export const V68_FEATURE_FLAG_GOVERNANCE_DOMAIN = "feature-flag-governance" as const;

export const V68_FEATURE_FLAG_ARTIFACT_ROOT = "lib/platform/v68/feature-flag" as const;

export type UpstreamPlatformGovernanceLockP4 = {
  serviceCatalog: typeof V68_SERVICE_CATALOG_VERSION;
  dependencyGraph: typeof V68_DEPENDENCY_GRAPH_VERSION;
  configurationGovernance: typeof V68_CONFIGURATION_GOVERNANCE_VERSION;
};

export const V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P4: UpstreamPlatformGovernanceLockP4 = {
  serviceCatalog: V68_SERVICE_CATALOG_VERSION,
  dependencyGraph: V68_DEPENDENCY_GRAPH_VERSION,
  configurationGovernance: V68_CONFIGURATION_GOVERNANCE_VERSION,
};

export function isUpstreamPlatformGovernanceLockP4Intact(): boolean {
  const lock = V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P4;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}
