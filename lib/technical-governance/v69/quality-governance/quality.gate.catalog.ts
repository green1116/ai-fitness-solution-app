/**
 * V69 P6 — Quality gate catalog (declarative, V69 phase verify scripts)
 */
import type { QualityGateEntry, QualityGateManifest } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";

export const QUALITY_GATE_CATALOG: QualityGateEntry[] = [
  {
    id: "QGOV-GATE-001",
    kind: "verify",
    phaseRef: "P1",
    label: "architecture_catalog_gate",
    verifyScript: "npm run verify:v69-p1-architecture-catalog",
    required: true,
    description: "P1 architecture catalog verify gate",
  },
  {
    id: "QGOV-GATE-002",
    kind: "verify",
    phaseRef: "P2",
    label: "architecture_dependency_gate",
    verifyScript: "npm run verify:v69-p2-architecture-dependency",
    required: true,
    description: "P2 architecture dependency verify gate",
  },
  {
    id: "QGOV-GATE-003",
    kind: "verify",
    phaseRef: "P3",
    label: "code_governance_gate",
    verifyScript: "npm run verify:v69-p3-code-governance",
    required: true,
    description: "P3 code governance verify gate",
  },
  {
    id: "QGOV-GATE-004",
    kind: "verify",
    phaseRef: "P4",
    label: "technical_standards_gate",
    verifyScript: "npm run verify:v69-p4-technical-standards",
    required: true,
    description: "P4 technical standards verify gate",
  },
  {
    id: "QGOV-GATE-005",
    kind: "verify",
    phaseRef: "P5",
    label: "security_governance_gate",
    verifyScript: "npm run verify:v69-p5-security-governance",
    required: true,
    description: "P5 security governance verify gate",
  },
  {
    id: "QGOV-GATE-006",
    kind: "compile",
    phaseRef: "P6",
    label: "typescript_compile_gate",
    verifyScript: "npx tsc --noEmit",
    required: true,
    description: "TypeScript compile quality gate",
  },
  {
    id: "QGOV-GATE-007",
    kind: "alignment",
    phaseRef: "P6",
    label: "cross_ref_alignment_gate",
    verifyScript: "alignment.catalog",
    required: true,
    description: "Cross-reference alignment gate",
  },
  {
    id: "QGOV-GATE-008",
    kind: "readiness",
    phaseRef: "P6",
    label: "quality_governance_gate",
    verifyScript: "npm run verify:v69-p6-quality-governance",
    required: true,
    description: "P6 quality governance verify gate",
  },
];

export function buildQualityGateManifest(): QualityGateManifest {
  const gates = QUALITY_GATE_CATALOG;
  const kinds = new Set(gates.map((g) => g.kind));
  const catalogComplete = gates.length >= 6 && kinds.size >= 4;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    gateCount: gates.length,
    kindCount: kinds.size,
    catalogComplete,
    gates,
    summary: [
      `quality-gates count=${gates.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getQualityGateByPhaseRef(phaseRef: string): QualityGateEntry[] {
  return QUALITY_GATE_CATALOG.filter((g) => g.phaseRef === phaseRef);
}
