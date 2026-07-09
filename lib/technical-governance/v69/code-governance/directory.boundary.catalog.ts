/**
 * V69 P3 — Directory boundary catalog (declarative)
 */
import type { DirectoryBoundaryEntry, DirectoryBoundaryManifest } from "./governance.types";
import { V69_CODE_GOVERNANCE_VERSION } from "./governance.types";

export const DIRECTORY_BOUNDARY_CATALOG: DirectoryBoundaryEntry[] = [
  {
    id: "CGOV-BND-001",
    codeObjectRef: "CGOV-OBJ-001",
    pathPattern: "app/**",
    arcDefRef: "ARC-DEF-001",
    mutable: true,
    required: true,
    description: "Next.js application boundary",
  },
  {
    id: "CGOV-BND-002",
    codeObjectRef: "CGOV-OBJ-002",
    pathPattern: "app/api/**",
    arcDefRef: "ARC-DEF-002",
    mutable: true,
    required: true,
    description: "API routes boundary",
  },
  {
    id: "CGOV-BND-003",
    codeObjectRef: "CGOV-OBJ-003",
    pathPattern: "lib/**",
    arcDefRef: "ARC-DEF-003",
    mutable: true,
    required: true,
    description: "Shared lib domain boundary",
  },
  {
    id: "CGOV-BND-004",
    codeObjectRef: "CGOV-OBJ-004",
    pathPattern: "prisma/**",
    arcDefRef: "ARC-DEF-004",
    mutable: true,
    required: true,
    description: "Prisma schema boundary",
  },
  {
    id: "CGOV-BND-005",
    codeObjectRef: "CGOV-OBJ-005",
    pathPattern: "lib/deployment/**",
    arcDefRef: "ARC-DEF-005",
    mutable: false,
    required: true,
    description: "Deployment frozen boundary",
  },
  {
    id: "CGOV-BND-006",
    codeObjectRef: "CGOV-OBJ-006",
    pathPattern: "lib/platform/v68/**",
    arcDefRef: "ARC-DEF-006",
    mutable: false,
    required: true,
    description: "V68 platform frozen boundary",
  },
  {
    id: "CGOV-BND-007",
    codeObjectRef: "CGOV-OBJ-007",
    pathPattern: "lib/monitoring/v67/**",
    arcDefRef: "ARC-DEF-007",
    mutable: false,
    required: true,
    description: "V67 monitoring frozen boundary",
  },
  {
    id: "CGOV-BND-008",
    codeObjectRef: "CGOV-OBJ-008",
    pathPattern: "lib/auth/**",
    arcDefRef: "ARC-DEF-008",
    mutable: true,
    required: true,
    description: "Security RBAC boundary",
  },
];

export function buildDirectoryBoundaryManifest(): DirectoryBoundaryManifest {
  const boundaries = DIRECTORY_BOUNDARY_CATALOG;
  const catalogComplete = boundaries.length >= 6;

  return {
    version: V69_CODE_GOVERNANCE_VERSION,
    boundaryCount: boundaries.length,
    catalogComplete,
    boundaries,
    summary: [
      `directory-boundaries count=${boundaries.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getBoundaryById(id: string): DirectoryBoundaryEntry | undefined {
  return DIRECTORY_BOUNDARY_CATALOG.find((b) => b.id === id);
}

export function getBoundaryByCodeObjectRef(
  codeObjectRef: string,
): DirectoryBoundaryEntry | undefined {
  return DIRECTORY_BOUNDARY_CATALOG.find((b) => b.codeObjectRef === codeObjectRef);
}
