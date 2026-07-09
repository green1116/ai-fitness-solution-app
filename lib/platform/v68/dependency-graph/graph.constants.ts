/**
 * V68 P2 — Dependency graph constants (read-only, P1 upstream)
 */
import { V68_SERVICE_CATALOG_VERSION } from "../service-catalog/catalog.types";

export const V68_DEPENDENCY_GRAPH_DOMAIN = "dependency-graph" as const;

export const V68_DEPENDENCY_GRAPH_ARTIFACT_ROOT = "lib/platform/v68/dependency-graph" as const;

export type UpstreamServiceCatalogLock = {
  serviceCatalog: typeof V68_SERVICE_CATALOG_VERSION;
};

export const V68_UPSTREAM_SERVICE_CATALOG_LOCK: UpstreamServiceCatalogLock = {
  serviceCatalog: V68_SERVICE_CATALOG_VERSION,
};

export function isUpstreamServiceCatalogLockIntact(): boolean {
  const lock = V68_UPSTREAM_SERVICE_CATALOG_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}
