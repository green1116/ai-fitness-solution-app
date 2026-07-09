/**
 * V69 P2 — Architecture dependency rollback index (declarative)
 */
import { V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION } from "./dependency.types";

export type ArchitectureDependencyRollbackEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type ArchitectureDependencyRollbackIndex = {
  version: typeof V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: ArchitectureDependencyRollbackEntry[];
  summary: string;
};

export const ARCHITECTURE_DEPENDENCY_ROLLBACK_INDEX: ArchitectureDependencyRollbackEntry[] = [
  {
    id: "ADR-P2",
    layer: "P2",
    snapshotPath: "lib/technical-governance/v69/architecture-dependency/",
    rollbackAction: "Delete P2 architecture-dependency modules + verify:v69-p2 script",
    required: true,
  },
  {
    id: "ADR-IDX",
    layer: "index",
    snapshotPath: "lib/technical-governance/v69/index.ts",
    rollbackAction: "Revert v69 index.ts exports to P1-only state",
    required: true,
  },
  {
    id: "ADR-PKG",
    layer: "package",
    snapshotPath: "package.json",
    rollbackAction: "Remove verify:v69-p2 script from package.json",
    required: true,
  },
  {
    id: "ADR-DOCS",
    layer: "docs",
    snapshotPath: "docs/technical-governance/V69-ARCHITECTURE-DEPENDENCY.md",
    rollbackAction: "Delete V69 P2 architecture dependency doc",
    required: true,
  },
  {
    id: "ADR-UP-P1",
    layer: "upstream-p1",
    snapshotPath: "lib/technical-governance/v69/architecture-catalog/",
    rollbackAction: "DO NOT MODIFY — frozen P1 upstream",
    required: true,
  },
  {
    id: "ADR-UP",
    layer: "upstream",
    snapshotPath: "lib/platform/v68/",
    rollbackAction: "DO NOT MODIFY — frozen upstream (V48–V68)",
    required: true,
  },
];

export function buildArchitectureDependencyRollbackIndex(): ArchitectureDependencyRollbackIndex {
  const entries = ARCHITECTURE_DEPENDENCY_ROLLBACK_INDEX;
  const indexComplete = entries.length >= 4;

  return {
    version: V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION,
    entryCount: entries.length,
    indexComplete,
    entries,
    summary: [
      `rollback-index entries=${entries.length}`,
      `complete=${indexComplete}`,
    ].join(" "),
  };
}
