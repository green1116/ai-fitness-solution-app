/**
 * V68 P3 — Configuration governance constants (read-only, P1–P2 upstream)
 */
import { V68_DEPENDENCY_GRAPH_VERSION } from "../dependency-graph/graph.types";
import { V68_SERVICE_CATALOG_VERSION } from "../service-catalog/catalog.types";

export const V68_CONFIGURATION_GOVERNANCE_DOMAIN = "configuration-governance" as const;

export const V68_CONFIGURATION_GOVERNANCE_ARTIFACT_ROOT = "lib/platform/v68/configuration" as const;

export type UpstreamPlatformGovernanceLock = {
  serviceCatalog: typeof V68_SERVICE_CATALOG_VERSION;
  dependencyGraph: typeof V68_DEPENDENCY_GRAPH_VERSION;
};

export const V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK: UpstreamPlatformGovernanceLock = {
  serviceCatalog: V68_SERVICE_CATALOG_VERSION,
  dependencyGraph: V68_DEPENDENCY_GRAPH_VERSION,
};

export function isUpstreamPlatformGovernanceLockIntact(): boolean {
  const lock = V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}
