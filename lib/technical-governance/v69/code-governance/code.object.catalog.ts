/**
 * V69 P3 — Code governance object catalog (declarative, ARC-DEF aligned)
 */
import type { CodeGovernanceObject, CodeGovernanceObjectManifest } from "./governance.types";
import { V69_CODE_GOVERNANCE_VERSION } from "./governance.types";

export const CODE_GOVERNANCE_OBJECT_CATALOG: CodeGovernanceObject[] = [
  {
    id: "CGOV-OBJ-001",
    arcDefRef: "ARC-DEF-001",
    name: "nextjs-application",
    rootPath: "app/",
    dependencyEntryRef: "ARC-DEP-001",
    required: true,
    description: "Next.js presentation code object",
  },
  {
    id: "CGOV-OBJ-002",
    arcDefRef: "ARC-DEF-002",
    name: "api-orchestration",
    rootPath: "app/api/",
    dependencyEntryRef: "ARC-DEP-002",
    required: true,
    description: "API route orchestration code object",
  },
  {
    id: "CGOV-OBJ-003",
    arcDefRef: "ARC-DEF-003",
    name: "domain-engines",
    rootPath: "lib/",
    dependencyEntryRef: "ARC-DEP-003",
    required: true,
    description: "Domain engines code object",
  },
  {
    id: "CGOV-OBJ-004",
    arcDefRef: "ARC-DEF-004",
    name: "prisma-data-access",
    rootPath: "prisma/",
    dependencyEntryRef: "ARC-DEP-004",
    required: true,
    description: "Prisma schema and data access object",
  },
  {
    id: "CGOV-OBJ-005",
    arcDefRef: "ARC-DEF-005",
    name: "deployment-pipeline",
    rootPath: "lib/deployment/",
    dependencyEntryRef: "ARC-DEP-005",
    required: true,
    description: "Deployment pipeline code object (read-only governance)",
  },
  {
    id: "CGOV-OBJ-006",
    arcDefRef: "ARC-DEF-006",
    name: "platform-governance",
    rootPath: "lib/platform/v68/",
    dependencyEntryRef: "ARC-DEP-006",
    required: true,
    description: "V68 platform governance code object (frozen)",
  },
  {
    id: "CGOV-OBJ-007",
    arcDefRef: "ARC-DEF-007",
    name: "monitoring-observability",
    rootPath: "lib/monitoring/v67/",
    dependencyEntryRef: "ARC-DEP-007",
    required: true,
    description: "V67 monitoring code object (frozen)",
  },
  {
    id: "CGOV-OBJ-008",
    arcDefRef: "ARC-DEF-008",
    name: "security-rbac",
    rootPath: "lib/auth/",
    dependencyEntryRef: "ARC-DEP-008",
    required: true,
    description: "Security RBAC code object",
  },
];

export function buildCodeGovernanceObjectManifest(): CodeGovernanceObjectManifest {
  const objects = CODE_GOVERNANCE_OBJECT_CATALOG;
  const catalogComplete = objects.length >= 6;

  return {
    version: V69_CODE_GOVERNANCE_VERSION,
    entryCount: objects.length,
    catalogComplete,
    objects,
    summary: [
      `code-objects count=${objects.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCodeObjectById(id: string): CodeGovernanceObject | undefined {
  return CODE_GOVERNANCE_OBJECT_CATALOG.find((o) => o.id === id);
}

export function getCodeObjectByArcDefRef(arcDefRef: string): CodeGovernanceObject | undefined {
  return CODE_GOVERNANCE_OBJECT_CATALOG.find((o) => o.arcDefRef === arcDefRef);
}
