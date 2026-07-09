/**
 * V69 P7 — Compliance check catalog (declarative)
 */
import type { ComplianceCheckEntry, ComplianceCheckManifest } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";

export const COMPLIANCE_CHECK_CATALOG: ComplianceCheckEntry[] = [
  {
    id: "ACMP-CHK-001",
    complianceRuleRef: "ACMP-RUL-001",
    checkKind: "manifest",
    passCondition: "objects.catalogComplete === true",
    required: true,
    description: "Application compliance manifest check",
  },
  {
    id: "ACMP-CHK-002",
    complianceRuleRef: "ACMP-RUL-002",
    checkKind: "alignment",
    passCondition: "refsAligned === true",
    required: true,
    description: "API interface alignment check",
  },
  {
    id: "ACMP-CHK-003",
    complianceRuleRef: "ACMP-RUL-003",
    checkKind: "alignment",
    passCondition: "isArchitectureComplianceRefsAligned()",
    required: true,
    description: "Domain cross-layer alignment check",
  },
  {
    id: "ACMP-CHK-004",
    complianceRuleRef: "ACMP-RUL-004",
    checkKind: "freeze",
    passCondition: "freezeLockIntact === true",
    required: true,
    description: "Data layer freeze lock check",
  },
  {
    id: "ACMP-CHK-005",
    complianceRuleRef: "ACMP-RUL-005",
    checkKind: "verify",
    passCondition: "verify:v69-p5 exit code 0",
    required: true,
    description: "Security governance verify check",
  },
  {
    id: "ACMP-CHK-006",
    complianceRuleRef: "ACMP-RUL-006",
    checkKind: "manifest",
    passCondition: "registry.registryComplete === true",
    required: true,
    description: "Platform governance registry check",
  },
  {
    id: "ACMP-CHK-007",
    complianceRuleRef: "ACMP-RUL-007",
    checkKind: "verify",
    passCondition: "npx tsc --noEmit exit code 0",
    required: true,
    description: "TypeScript compile compliance check",
  },
  {
    id: "ACMP-CHK-008",
    complianceRuleRef: "ACMP-RUL-008",
    checkKind: "registry",
    passCondition: "deviations with gateBlock and no approved exception === 0",
    required: true,
    description: "Deployment deviation registry check",
  },
];

export function buildComplianceCheckManifest(): ComplianceCheckManifest {
  const checks = COMPLIANCE_CHECK_CATALOG;
  const kinds = new Set(checks.map((c) => c.checkKind));
  const catalogComplete = checks.length >= 6 && kinds.size >= 4;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    entryCount: checks.length,
    kindCount: kinds.size,
    catalogComplete,
    checks,
    summary: [
      `compliance-checks count=${checks.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceChecksByRuleRef(
  complianceRuleRef: string,
): ComplianceCheckEntry[] {
  return COMPLIANCE_CHECK_CATALOG.filter((c) => c.complianceRuleRef === complianceRuleRef);
}
