/**
 * V69 P2 — Architecture dependency cross-reference alignment (read-only)
 */
import { ARCHITECTURE_DEFINITION_CATALOG } from "../architecture-catalog/architecture.definition.catalog";
import {
  ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG,
  isBoundaryAllowedForEdge,
} from "./dependency.boundary.catalog";
import { ARCHITECTURE_DEPENDENCY_EDGE_CATALOG } from "./dependency.edge.catalog";
import { ARCHITECTURE_DEPENDENCY_KIND_CATALOG } from "./dependency.kind.catalog";
import { ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG } from "./dependency.strength.catalog";

export function isArchitectureDependencyRefsAligned(): boolean {
  const arcDefIds = new Set(ARCHITECTURE_DEFINITION_CATALOG.map((d) => d.id));
  const kindIds = new Set(ARCHITECTURE_DEPENDENCY_KIND_CATALOG.map((k) => k.id));
  const strengthIds = new Set(ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG.map((s) => s.id));
  const boundaryIds = new Set(ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG.map((b) => b.id));

  const edgesAligned = ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.every(
    (e) =>
      arcDefIds.has(e.fromArcDefRef) &&
      arcDefIds.has(e.toArcDefRef) &&
      kindIds.has(e.kindRef) &&
      strengthIds.has(e.strengthRef) &&
      boundaryIds.has(e.boundaryRef) &&
      isBoundaryAllowedForEdge(e.boundaryRef),
  );

  const coverageComplete =
    ARCHITECTURE_DEFINITION_CATALOG.filter((d) => d.criticality === "tier-1").every(
      (d) =>
        ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.some(
          (e) => e.fromArcDefRef === d.id || e.toArcDefRef === d.id,
        ),
    ) && ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.length >= 6;

  return edgesAligned && coverageComplete;
}
