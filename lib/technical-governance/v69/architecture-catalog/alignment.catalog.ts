/**
 * V69 P1 — Architecture catalog cross-reference alignment (read-only)
 */
import { SERVICE_DEFINITION_CATALOG } from "@/lib/platform/v68/service-catalog/service.definition.catalog";

import { ARCHITECTURE_DEFINITION_CATALOG } from "./architecture.definition.catalog";
import { ARCHITECTURE_LAYER_CATALOG } from "./architecture.layer.catalog";
import { ARCHITECTURE_OWNER_CATALOG } from "./architecture.owner.catalog";
import { DEPENDENCY_ENTRY_CATALOG } from "./dependency.entry.catalog";

export function isPlatformServiceRefsAligned(): boolean {
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));
  return ARCHITECTURE_DEFINITION_CATALOG.every((d) =>
    serviceIds.has(d.platformServiceRef),
  );
}

export function isArchitectureCatalogCrossRefsAligned(): boolean {
  const defIds = new Set(ARCHITECTURE_DEFINITION_CATALOG.map((d) => d.id));
  const layerIds = new Set(ARCHITECTURE_LAYER_CATALOG.map((l) => l.id));
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));

  const layerAligned = ARCHITECTURE_DEFINITION_CATALOG.every((d) =>
    layerIds.has(d.layerRef),
  );
  const ownerAligned = ARCHITECTURE_OWNER_CATALOG.every((o) =>
    defIds.has(o.architectureDefRef),
  );
  const dependencyAligned = DEPENDENCY_ENTRY_CATALOG.every(
    (e) => defIds.has(e.architectureDefRef) && serviceIds.has(e.serviceDefRef),
  );

  const coverageComplete =
    ARCHITECTURE_DEFINITION_CATALOG.every((d) =>
      ARCHITECTURE_OWNER_CATALOG.some((o) => o.architectureDefRef === d.id),
    ) &&
    ARCHITECTURE_DEFINITION_CATALOG.every((d) =>
      DEPENDENCY_ENTRY_CATALOG.some((e) => e.architectureDefRef === d.id),
    ) &&
    ARCHITECTURE_LAYER_CATALOG.filter((l) => l.required).every((l) =>
      ARCHITECTURE_DEFINITION_CATALOG.some((d) => d.layerRef === l.id),
    );

  return (
    layerAligned &&
    ownerAligned &&
    dependencyAligned &&
    coverageComplete &&
    isPlatformServiceRefsAligned()
  );
}
