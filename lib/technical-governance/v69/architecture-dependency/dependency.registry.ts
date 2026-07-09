/**
 * V69 P2 — Architecture dependency registry / index (read-only)
 */
import { ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG } from "./dependency.boundary.catalog";
import { ARCHITECTURE_DEPENDENCY_EDGE_CATALOG } from "./dependency.edge.catalog";
import { ARCHITECTURE_DEPENDENCY_KIND_CATALOG } from "./dependency.kind.catalog";
import { ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG } from "./dependency.strength.catalog";
import type { ArchitectureDependencyRegistry } from "./dependency.types";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "./dependency.types";

export const ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX = {
  kinds: ARCHITECTURE_DEPENDENCY_KIND_CATALOG.map((k) => k.id),
  strengths: ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG.map((s) => s.id),
  boundaries: ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG.map((b) => b.id),
  edges: ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.map((e) => e.id),
} as const;

export function buildArchitectureDependencyRegistry(): ArchitectureDependencyRegistry {
  const kindIds = ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX.kinds;
  const strengthIds = ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX.strengths;
  const boundaryIds = ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX.boundaries;
  const edgeIds = ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX.edges;
  const totalEntries =
    kindIds.length + strengthIds.length + boundaryIds.length + edgeIds.length;

  const registryComplete =
    kindIds.length >= 4 &&
    strengthIds.length >= 4 &&
    boundaryIds.length >= 5 &&
    edgeIds.length >= 6;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_VERSION,
    kindIds: [...kindIds],
    strengthIds: [...strengthIds],
    boundaryIds: [...boundaryIds],
    edgeIds: [...edgeIds],
    totalEntries,
    registryComplete,
    summary: [
      `dependency-registry total=${totalEntries}`,
      `kinds=${kindIds.length}`,
      `strengths=${strengthIds.length}`,
      `boundaries=${boundaryIds.length}`,
      `edges=${edgeIds.length}`,
      `complete=${registryComplete}`,
    ].join(" "),
  };
}

export function isDependencyRegistryIdKnown(
  kind: keyof typeof ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX,
  id: string,
): boolean {
  return (ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX[kind] as readonly string[]).includes(id);
}
