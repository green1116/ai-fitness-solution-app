/**
 * V68 P2 — Dependency graph reference alignment (read-only)
 */
import { SERVICE_DEFINITION_CATALOG } from "../service-catalog/service.definition.catalog";

import { DEPENDENCY_EDGE_CATALOG } from "./dependency.edge.catalog";
import { DEPENDENCY_TYPE_CATALOG } from "./dependency.type.catalog";

export function isDependencyGraphRefsAligned(): boolean {
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));
  const typeIds = new Set(DEPENDENCY_TYPE_CATALOG.map((t) => t.id));

  const edgesAligned = DEPENDENCY_EDGE_CATALOG.every(
    (e) =>
      serviceIds.has(e.fromServiceRef) &&
      serviceIds.has(e.toServiceRef) &&
      typeIds.has(e.typeRef) &&
      e.fromServiceRef !== e.toServiceRef,
  );

  return edgesAligned;
}

export function getOrphanServiceRefs(): string[] {
  const referenced = new Set<string>();
  for (const edge of DEPENDENCY_EDGE_CATALOG) {
    referenced.add(edge.fromServiceRef);
    referenced.add(edge.toServiceRef);
  }
  return SERVICE_DEFINITION_CATALOG.map((s) => s.id).filter((id) => !referenced.has(id));
}
