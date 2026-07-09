/**
 * V69 P5 — Security governance object catalog (declarative)
 */
import type { SecurityGovernanceObject, SecurityGovernanceObjectManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const SECURITY_GOVERNANCE_OBJECT_CATALOG: SecurityGovernanceObject[] = [
  {
    id: "SEC-OBJ-001",
    arcDefRef: "ARC-DEF-008",
    codeObjectRef: "CGOV-OBJ-008",
    boundaryRef: "SEC-BND-001",
    name: "security-rbac",
    required: true,
    description: "Primary security RBAC governance object",
  },
  {
    id: "SEC-OBJ-002",
    arcDefRef: "ARC-DEF-001",
    codeObjectRef: "CGOV-OBJ-001",
    boundaryRef: "SEC-BND-002",
    name: "application-surface",
    required: true,
    description: "Next.js application security envelope",
  },
  {
    id: "SEC-OBJ-003",
    arcDefRef: "ARC-DEF-002",
    codeObjectRef: "CGOV-OBJ-002",
    boundaryRef: "SEC-BND-003",
    name: "api-surface",
    required: true,
    description: "API route security surface",
  },
  {
    id: "SEC-OBJ-004",
    arcDefRef: "ARC-DEF-004",
    codeObjectRef: "CGOV-OBJ-004",
    boundaryRef: "SEC-BND-004",
    name: "data-access",
    required: true,
    description: "Prisma data access security object",
  },
  {
    id: "SEC-OBJ-005",
    arcDefRef: "ARC-DEF-003",
    codeObjectRef: "CGOV-OBJ-003",
    boundaryRef: "SEC-BND-005",
    name: "domain-logic",
    required: true,
    description: "Domain engine security boundary",
  },
  {
    id: "SEC-OBJ-006",
    arcDefRef: "ARC-DEF-006",
    codeObjectRef: "CGOV-OBJ-006",
    boundaryRef: "SEC-BND-006",
    name: "platform-governance",
    required: true,
    description: "Frozen platform governance read-only zone",
  },
  {
    id: "SEC-OBJ-007",
    arcDefRef: "ARC-DEF-007",
    codeObjectRef: "CGOV-OBJ-007",
    boundaryRef: "SEC-BND-007",
    name: "monitoring-integration",
    required: true,
    description: "Monitoring integration security zone",
  },
  {
    id: "SEC-OBJ-008",
    arcDefRef: "ARC-DEF-005",
    codeObjectRef: "CGOV-OBJ-005",
    boundaryRef: "SEC-BND-008",
    name: "deployment-pipeline",
    required: true,
    description: "Deployment pipeline privileged zone",
  },
];

export function buildSecurityGovernanceObjectManifest(): SecurityGovernanceObjectManifest {
  const objects = SECURITY_GOVERNANCE_OBJECT_CATALOG;
  const catalogComplete = objects.length >= 6;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    entryCount: objects.length,
    catalogComplete,
    objects,
    summary: [
      `security-objects count=${objects.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getSecurityObjectById(id: string): SecurityGovernanceObject | undefined {
  return SECURITY_GOVERNANCE_OBJECT_CATALOG.find((o) => o.id === id);
}
