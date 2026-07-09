/**
 * V69 P7 — Compliance gate catalog (declarative, V69 phase verify scripts)
 */
import type { ComplianceGateEntry, ComplianceGateManifest } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";

export const COMPLIANCE_GATE_CATALOG: ComplianceGateEntry[] = [
  {
    id: "ACMP-GATE-001",
    kind: "verify",
    phaseRef: "P1",
    label: "architecture_catalog_gate",
    verifyScript: "npm run verify:v69-p1-architecture-catalog",
    required: true,
    description: "P1 architecture catalog compliance gate",
  },
  {
    id: "ACMP-GATE-002",
    kind: "verify",
    phaseRef: "P2",
    label: "architecture_dependency_gate",
    verifyScript: "npm run verify:v69-p2-architecture-dependency",
    required: true,
    description: "P2 architecture dependency compliance gate",
  },
  {
    id: "ACMP-GATE-003",
    kind: "verify",
    phaseRef: "P3",
    label: "code_governance_gate",
    verifyScript: "npm run verify:v69-p3-code-governance",
    required: true,
    description: "P3 code governance compliance gate",
  },
  {
    id: "ACMP-GATE-004",
    kind: "verify",
    phaseRef: "P4",
    label: "technical_standards_gate",
    verifyScript: "npm run verify:v69-p4-technical-standards",
    required: true,
    description: "P4 technical standards compliance gate",
  },
  {
    id: "ACMP-GATE-005",
    kind: "verify",
    phaseRef: "P5",
    label: "security_governance_gate",
    verifyScript: "npm run verify:v69-p5-security-governance",
    required: true,
    description: "P5 security governance compliance gate",
  },
  {
    id: "ACMP-GATE-006",
    kind: "verify",
    phaseRef: "P6",
    label: "quality_governance_gate",
    verifyScript: "npm run verify:v69-p6-quality-governance",
    required: true,
    description: "P6 quality governance compliance gate",
  },
  {
    id: "ACMP-GATE-007",
    kind: "alignment",
    phaseRef: "P7",
    label: "cross_ref_alignment_gate",
    verifyScript: "alignment.catalog",
    required: true,
    description: "Cross-reference alignment compliance gate",
  },
  {
    id: "ACMP-GATE-008",
    kind: "readiness",
    phaseRef: "P7",
    label: "architecture_compliance_gate",
    verifyScript: "npm run verify:v69-p7-architecture-compliance",
    required: true,
    description: "P7 architecture compliance verify gate",
  },
];

export function buildComplianceGateManifest(): ComplianceGateManifest {
  const gates = COMPLIANCE_GATE_CATALOG;
  const kinds = new Set(gates.map((g) => g.kind));
  const catalogComplete = gates.length >= 6 && kinds.size >= 3;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    gateCount: gates.length,
    kindCount: kinds.size,
    catalogComplete,
    gates,
    summary: [
      `compliance-gates count=${gates.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceGateByPhaseRef(phaseRef: string): ComplianceGateEntry[] {
  return COMPLIANCE_GATE_CATALOG.filter((g) => g.phaseRef === phaseRef);
}

export function getComplianceGateById(id: string): ComplianceGateEntry | undefined {
  return COMPLIANCE_GATE_CATALOG.find((g) => g.id === id);
}
