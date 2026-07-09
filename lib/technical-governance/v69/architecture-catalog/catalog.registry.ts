/**
 * V69 P1 — Architecture catalog registry / index (read-only)
 */
import { ARCHITECTURE_DEFINITION_CATALOG } from "./architecture.definition.catalog";
import { ARCHITECTURE_LAYER_CATALOG } from "./architecture.layer.catalog";
import { ARCHITECTURE_OWNER_CATALOG } from "./architecture.owner.catalog";
import type { ArchitectureCatalogRegistry } from "./catalog.types";
import { V69_ARCHITECTURE_CATALOG_VERSION } from "./catalog.types";
import { DEPENDENCY_ENTRY_CATALOG } from "./dependency.entry.catalog";

export const ARCHITECTURE_CATALOG_REGISTRY_INDEX = {
  definitions: ARCHITECTURE_DEFINITION_CATALOG.map((d) => d.id),
  layers: ARCHITECTURE_LAYER_CATALOG.map((l) => l.id),
  owners: ARCHITECTURE_OWNER_CATALOG.map((o) => o.id),
  dependencyEntries: DEPENDENCY_ENTRY_CATALOG.map((e) => e.id),
} as const;

export function buildArchitectureCatalogRegistry(): ArchitectureCatalogRegistry {
  const definitionIds = ARCHITECTURE_CATALOG_REGISTRY_INDEX.definitions;
  const layerIds = ARCHITECTURE_CATALOG_REGISTRY_INDEX.layers;
  const ownerIds = ARCHITECTURE_CATALOG_REGISTRY_INDEX.owners;
  const dependencyEntryIds = ARCHITECTURE_CATALOG_REGISTRY_INDEX.dependencyEntries;
  const totalEntries =
    definitionIds.length + layerIds.length + ownerIds.length + dependencyEntryIds.length;

  const registryComplete =
    definitionIds.length >= 6 &&
    layerIds.length >= 6 &&
    ownerIds.length >= 6 &&
    dependencyEntryIds.length >= 6;

  return {
    version: V69_ARCHITECTURE_CATALOG_VERSION,
    definitionIds: [...definitionIds],
    layerIds: [...layerIds],
    ownerIds: [...ownerIds],
    dependencyEntryIds: [...dependencyEntryIds],
    totalEntries,
    registryComplete,
    summary: [
      `registry total=${totalEntries}`,
      `defs=${definitionIds.length}`,
      `layers=${layerIds.length}`,
      `owners=${ownerIds.length}`,
      `deps=${dependencyEntryIds.length}`,
      `complete=${registryComplete}`,
    ].join(" "),
  };
}

export function isRegistryIdKnown(
  kind: keyof typeof ARCHITECTURE_CATALOG_REGISTRY_INDEX,
  id: string,
): boolean {
  return ARCHITECTURE_CATALOG_REGISTRY_INDEX[kind].includes(id);
}
