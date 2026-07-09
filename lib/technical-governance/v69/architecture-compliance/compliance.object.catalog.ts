/**
 * V69 P7 — Compliance object catalog (declarative)
 */
import type { ComplianceObject, ComplianceObjectManifest } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";

export const COMPLIANCE_OBJECT_CATALOG: ComplianceObject[] = [
  {
    id: "ACMP-OBJ-001",
    arcDefRef: "ARC-DEF-001",
    qualityObjectRef: "QGOV-OBJ-001",
    standardPolicyRef: "TSTD-SET-001",
    name: "application-compliance",
    required: true,
    description: "Next.js application architecture compliance object",
  },
  {
    id: "ACMP-OBJ-002",
    arcDefRef: "ARC-DEF-002",
    qualityObjectRef: "QGOV-OBJ-002",
    standardPolicyRef: "TSTD-SET-003",
    name: "api-compliance",
    required: true,
    description: "API orchestration architecture compliance object",
  },
  {
    id: "ACMP-OBJ-003",
    arcDefRef: "ARC-DEF-003",
    qualityObjectRef: "QGOV-OBJ-003",
    standardPolicyRef: "TSTD-SET-006",
    name: "domain-compliance",
    required: true,
    description: "Domain engines architecture compliance object",
  },
  {
    id: "ACMP-OBJ-004",
    arcDefRef: "ARC-DEF-004",
    qualityObjectRef: "QGOV-OBJ-004",
    standardPolicyRef: "TSTD-SET-005",
    name: "data-compliance",
    required: true,
    description: "Prisma data access architecture compliance object",
  },
  {
    id: "ACMP-OBJ-005",
    arcDefRef: "ARC-DEF-008",
    qualityObjectRef: "QGOV-OBJ-005",
    standardPolicyRef: "TSTD-SET-005",
    name: "security-compliance",
    required: true,
    description: "Security RBAC architecture compliance object",
  },
  {
    id: "ACMP-OBJ-006",
    arcDefRef: "ARC-DEF-006",
    qualityObjectRef: "QGOV-OBJ-006",
    standardPolicyRef: "TSTD-SET-004",
    name: "platform-governance-compliance",
    required: true,
    description: "V68 platform governance compliance object",
  },
  {
    id: "ACMP-OBJ-007",
    arcDefRef: "ARC-DEF-007",
    qualityObjectRef: "QGOV-OBJ-007",
    standardPolicyRef: "TSTD-SET-007",
    name: "monitoring-compliance",
    required: true,
    description: "V67 monitoring architecture compliance object",
  },
  {
    id: "ACMP-OBJ-008",
    arcDefRef: "ARC-DEF-005",
    qualityObjectRef: "QGOV-OBJ-008",
    standardPolicyRef: "TSTD-SET-008",
    name: "deployment-compliance",
    required: true,
    description: "Deployment pipeline architecture compliance object",
  },
];

export function buildComplianceObjectManifest(): ComplianceObjectManifest {
  const objects = COMPLIANCE_OBJECT_CATALOG;
  const catalogComplete = objects.length >= 6;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    entryCount: objects.length,
    catalogComplete,
    objects,
    summary: [
      `compliance-objects count=${objects.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceObjectById(id: string): ComplianceObject | undefined {
  return COMPLIANCE_OBJECT_CATALOG.find((o) => o.id === id);
}
