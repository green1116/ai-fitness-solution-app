/**
 * V69 P6 — Quality governance object catalog (declarative)
 */
import type { QualityGovernanceObject, QualityGovernanceObjectManifest } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";

export const QUALITY_GOVERNANCE_OBJECT_CATALOG: QualityGovernanceObject[] = [
  {
    id: "QGOV-OBJ-001",
    arcDefRef: "ARC-DEF-001",
    securityObjectRef: "SEC-OBJ-002",
    codeObjectRef: "CGOV-OBJ-001",
    name: "application-quality",
    required: true,
    description: "Next.js application quality object",
  },
  {
    id: "QGOV-OBJ-002",
    arcDefRef: "ARC-DEF-002",
    securityObjectRef: "SEC-OBJ-003",
    codeObjectRef: "CGOV-OBJ-002",
    name: "api-quality",
    required: true,
    description: "API orchestration quality object",
  },
  {
    id: "QGOV-OBJ-003",
    arcDefRef: "ARC-DEF-003",
    securityObjectRef: "SEC-OBJ-005",
    codeObjectRef: "CGOV-OBJ-003",
    name: "domain-quality",
    required: true,
    description: "Domain engines quality object",
  },
  {
    id: "QGOV-OBJ-004",
    arcDefRef: "ARC-DEF-004",
    securityObjectRef: "SEC-OBJ-004",
    codeObjectRef: "CGOV-OBJ-004",
    name: "data-quality",
    required: true,
    description: "Prisma data access quality object",
  },
  {
    id: "QGOV-OBJ-005",
    arcDefRef: "ARC-DEF-008",
    securityObjectRef: "SEC-OBJ-001",
    codeObjectRef: "CGOV-OBJ-008",
    name: "security-quality",
    required: true,
    description: "Security RBAC quality object",
  },
  {
    id: "QGOV-OBJ-006",
    arcDefRef: "ARC-DEF-006",
    securityObjectRef: "SEC-OBJ-006",
    codeObjectRef: "CGOV-OBJ-006",
    name: "platform-governance-quality",
    required: true,
    description: "V68 platform governance quality object",
  },
  {
    id: "QGOV-OBJ-007",
    arcDefRef: "ARC-DEF-007",
    securityObjectRef: "SEC-OBJ-007",
    codeObjectRef: "CGOV-OBJ-007",
    name: "monitoring-quality",
    required: true,
    description: "V67 monitoring quality object",
  },
  {
    id: "QGOV-OBJ-008",
    arcDefRef: "ARC-DEF-005",
    securityObjectRef: "SEC-OBJ-008",
    codeObjectRef: "CGOV-OBJ-005",
    name: "deployment-quality",
    required: true,
    description: "Deployment pipeline quality object",
  },
];

export function buildQualityGovernanceObjectManifest(): QualityGovernanceObjectManifest {
  const objects = QUALITY_GOVERNANCE_OBJECT_CATALOG;
  const catalogComplete = objects.length >= 6;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    entryCount: objects.length,
    catalogComplete,
    objects,
    summary: [
      `quality-objects count=${objects.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getQualityObjectById(id: string): QualityGovernanceObject | undefined {
  return QUALITY_GOVERNANCE_OBJECT_CATALOG.find((o) => o.id === id);
}
