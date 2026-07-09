/**
 * V69 P1 — Dependency entry catalog (declarative, V68 service catalog read-only refs)
 */
import type { DependencyEntry, DependencyEntryManifest } from "./catalog.types";
import { V69_ARCHITECTURE_CATALOG_VERSION } from "./catalog.types";

export const DEPENDENCY_ENTRY_CATALOG: DependencyEntry[] = [
  {
    id: "ARC-DEP-001",
    architectureDefRef: "ARC-DEF-001",
    serviceDefRef: "SVC-DEF-001",
    dependencyKind: "runtime",
    entryPath: "app/",
    required: true,
    description: "Next.js app entry — production API service",
  },
  {
    id: "ARC-DEP-002",
    architectureDefRef: "ARC-DEF-002",
    serviceDefRef: "SVC-DEF-001",
    dependencyKind: "runtime",
    entryPath: "app/api/",
    required: true,
    description: "API route dependency entry",
  },
  {
    id: "ARC-DEP-003",
    architectureDefRef: "ARC-DEF-003",
    serviceDefRef: "SVC-DEF-003",
    dependencyKind: "declarative",
    entryPath: "lib/",
    required: true,
    description: "Domain engines declarative entry",
  },
  {
    id: "ARC-DEP-004",
    architectureDefRef: "ARC-DEF-004",
    serviceDefRef: "SVC-DEF-001",
    dependencyKind: "runtime",
    entryPath: "prisma/",
    required: true,
    description: "Prisma schema data entry",
  },
  {
    id: "ARC-DEP-005",
    architectureDefRef: "ARC-DEF-005",
    serviceDefRef: "SVC-DEF-006",
    dependencyKind: "read-only",
    entryPath: "lib/deployment/",
    required: true,
    description: "Deployment pipeline read-only entry",
  },
  {
    id: "ARC-DEP-006",
    architectureDefRef: "ARC-DEF-006",
    serviceDefRef: "SVC-DEF-008",
    dependencyKind: "read-only",
    entryPath: "lib/platform/v68/",
    required: true,
    description: "V68 platform governance read-only entry",
  },
  {
    id: "ARC-DEP-007",
    architectureDefRef: "ARC-DEF-007",
    serviceDefRef: "SVC-DEF-008",
    dependencyKind: "read-only",
    entryPath: "lib/monitoring/v67/",
    required: true,
    description: "V67 monitoring read-only entry",
  },
  {
    id: "ARC-DEP-008",
    architectureDefRef: "ARC-DEF-008",
    serviceDefRef: "SVC-DEF-002",
    dependencyKind: "runtime",
    entryPath: "lib/auth/",
    required: true,
    description: "Security RBAC runtime entry",
  },
];

export function buildDependencyEntryManifest(): DependencyEntryManifest {
  const entries = DEPENDENCY_ENTRY_CATALOG;
  const kinds = new Set(entries.map((e) => e.dependencyKind));
  const catalogComplete = entries.length >= 6 && kinds.size >= 3;

  return {
    version: V69_ARCHITECTURE_CATALOG_VERSION,
    entryCount: entries.length,
    kindCount: kinds.size,
    catalogComplete,
    entries,
    summary: [
      `dependency-entries count=${entries.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDependencyEntriesByArchitectureRef(
  architectureDefRef: string,
): DependencyEntry[] {
  return DEPENDENCY_ENTRY_CATALOG.filter((e) => e.architectureDefRef === architectureDefRef);
}
