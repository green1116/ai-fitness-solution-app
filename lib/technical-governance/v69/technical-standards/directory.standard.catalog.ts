/**
 * V69 P4 — Directory standard catalog (declarative, CGOV-BND aligned)
 */
import type { DirectoryStandardEntry, DirectoryStandardManifest } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";

export const DIRECTORY_STANDARD_CATALOG: DirectoryStandardEntry[] = [
  {
    id: "TSTD-DIR-001",
    boundaryRef: "CGOV-BND-003",
    pathConvention: "lib/technical-governance/v69/{phase-module}/",
    layoutRule: "types + constants + surface + catalogs + builder + entry + barrel",
    enforceLevel: "required",
    required: true,
    description: "V69 technical governance module layout",
  },
  {
    id: "TSTD-DIR-002",
    boundaryRef: "CGOV-BND-001",
    pathConvention: "app/**",
    layoutRule: "Next.js app router pages and layouts",
    enforceLevel: "required",
    required: true,
    description: "Application presentation layout",
  },
  {
    id: "TSTD-DIR-003",
    boundaryRef: "CGOV-BND-002",
    pathConvention: "app/api/**",
    layoutRule: "route handlers per resource",
    enforceLevel: "required",
    required: true,
    description: "API route layout standard",
  },
  {
    id: "TSTD-DIR-004",
    boundaryRef: "CGOV-BND-004",
    pathConvention: "prisma/**",
    layoutRule: "schema.prisma + patches/ idempotent SQL",
    enforceLevel: "required",
    required: true,
    description: "Data layer layout standard",
  },
  {
    id: "TSTD-DIR-005",
    boundaryRef: "CGOV-BND-006",
    pathConvention: "lib/platform/v68/**",
    layoutRule: "frozen — read-only reference",
    enforceLevel: "required",
    required: true,
    description: "V68 platform frozen directory standard",
  },
  {
    id: "TSTD-DIR-006",
    boundaryRef: "CGOV-BND-007",
    pathConvention: "lib/monitoring/v67/**",
    layoutRule: "frozen — read-only reference",
    enforceLevel: "required",
    required: true,
    description: "V67 monitoring frozen directory standard",
  },
  {
    id: "TSTD-DIR-007",
    boundaryRef: "CGOV-BND-005",
    pathConvention: "lib/deployment/**",
    layoutRule: "frozen deployment modules",
    enforceLevel: "required",
    required: true,
    description: "Deployment frozen directory standard",
  },
  {
    id: "TSTD-DIR-008",
    boundaryRef: "CGOV-BND-008",
    pathConvention: "lib/auth/**",
    layoutRule: "auth + rbac modules",
    enforceLevel: "required",
    required: true,
    description: "Security RBAC directory standard",
  },
];

export function buildDirectoryStandardManifest(): DirectoryStandardManifest {
  const standards = DIRECTORY_STANDARD_CATALOG;
  const catalogComplete = standards.length >= 6;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    entryCount: standards.length,
    catalogComplete,
    standards,
    summary: [
      `directory-standards count=${standards.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDirectoryStandardByBoundaryRef(
  boundaryRef: string,
): DirectoryStandardEntry | undefined {
  return DIRECTORY_STANDARD_CATALOG.find((s) => s.boundaryRef === boundaryRef);
}
