/**
 * V69 P5 — Security boundary catalog (declarative, CGOV-BND aligned)
 */
import type { SecurityBoundaryEntry, SecurityBoundaryManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const SECURITY_BOUNDARY_CATALOG: SecurityBoundaryEntry[] = [
  {
    id: "SEC-BND-001",
    kind: "privileged",
    codeBoundaryRef: "CGOV-BND-008",
    arcDefRef: "ARC-DEF-008",
    trustZone: "security-core",
    required: true,
    description: "Security RBAC privileged trust zone",
  },
  {
    id: "SEC-BND-002",
    kind: "authenticated",
    codeBoundaryRef: "CGOV-BND-001",
    arcDefRef: "ARC-DEF-001",
    trustZone: "app-authenticated",
    required: true,
    description: "Application authenticated zone",
  },
  {
    id: "SEC-BND-003",
    kind: "authenticated",
    codeBoundaryRef: "CGOV-BND-002",
    arcDefRef: "ARC-DEF-002",
    trustZone: "api-authenticated",
    required: true,
    description: "API authenticated zone",
  },
  {
    id: "SEC-BND-004",
    kind: "internal",
    codeBoundaryRef: "CGOV-BND-004",
    arcDefRef: "ARC-DEF-004",
    trustZone: "data-internal",
    required: true,
    description: "Data layer internal zone",
  },
  {
    id: "SEC-BND-005",
    kind: "internal",
    codeBoundaryRef: "CGOV-BND-003",
    arcDefRef: "ARC-DEF-003",
    trustZone: "domain-internal",
    required: true,
    description: "Domain logic internal zone",
  },
  {
    id: "SEC-BND-006",
    kind: "frozen",
    codeBoundaryRef: "CGOV-BND-006",
    arcDefRef: "ARC-DEF-006",
    trustZone: "platform-frozen",
    required: true,
    description: "V68 platform frozen zone",
  },
  {
    id: "SEC-BND-007",
    kind: "frozen",
    codeBoundaryRef: "CGOV-BND-007",
    arcDefRef: "ARC-DEF-007",
    trustZone: "monitoring-frozen",
    required: true,
    description: "V67 monitoring frozen zone",
  },
  {
    id: "SEC-BND-008",
    kind: "privileged",
    codeBoundaryRef: "CGOV-BND-005",
    arcDefRef: "ARC-DEF-005",
    trustZone: "deploy-privileged",
    required: true,
    description: "Deployment pipeline privileged zone",
  },
];

export function buildSecurityBoundaryManifest(): SecurityBoundaryManifest {
  const boundaries = SECURITY_BOUNDARY_CATALOG;
  const kinds = new Set(boundaries.map((b) => b.kind));
  const catalogComplete = boundaries.length >= 6 && kinds.size >= 4;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    boundaryCount: boundaries.length,
    kindCount: kinds.size,
    catalogComplete,
    boundaries,
    summary: [
      `security-boundaries count=${boundaries.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getSecurityBoundaryById(id: string): SecurityBoundaryEntry | undefined {
  return SECURITY_BOUNDARY_CATALOG.find((b) => b.id === id);
}
