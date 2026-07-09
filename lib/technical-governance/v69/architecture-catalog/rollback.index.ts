/**
 * V69 P1 — Architecture catalog rollback index (declarative)
 */
import { V69_ARCHITECTURE_CATALOG_FREEZE_VERSION } from "./catalog.types";

export type ArchitectureCatalogRollbackEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type ArchitectureCatalogRollbackIndex = {
  version: typeof V69_ARCHITECTURE_CATALOG_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: ArchitectureCatalogRollbackEntry[];
  summary: string;
};

export const ARCHITECTURE_CATALOG_ROLLBACK_INDEX: ArchitectureCatalogRollbackEntry[] = [
  {
    id: "ACR-P1",
    layer: "P1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "Delete P1 architecture-catalog modules + verify:v69-p1 script",
    required: true,
  },
  {
    id: "ACR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert v69 index.ts exports to pre-P1 state",
    required: true,
  },
  {
    id: "ACR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-p1 script from package.json",
    required: true,
  },
  {
    id: "ACR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/V69-ARCHITECTURE-CATALOG.md",
    rollbackAction: "Delete V69 P1 architecture catalog doc",
    required: true,
  },
  {
    id: "ACR-UP",
    layer: "upstream",
    snapshotPath: "lib/platform/v68/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V68)",
    required: true,
  },
];

export function buildArchitectureCatalogRollbackIndex(): ArchitectureCatalogRollbackIndex {
  const entries = ARCHITECTURE_CATALOG_ROLLBACK_INDEX;
  const indexComplete = entries.length >= 4;

  return {
    version: V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-index entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}
