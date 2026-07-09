/**
 * V69 P7 — Compliance rule catalog (declarative)
 */
import type { ComplianceRuleEntry, ComplianceRuleManifest } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";

export const COMPLIANCE_RULE_CATALOG: ComplianceRuleEntry[] = [
  {
    id: "ACMP-RUL-001",
    kind: "structural",
    complianceObjectRef: "ACMP-OBJ-001",
    criterion: "arc_def_present",
    enforceLevel: "required",
    required: true,
    description: "Architecture definition must exist for application layer",
  },
  {
    id: "ACMP-RUL-002",
    kind: "standard",
    complianceObjectRef: "ACMP-OBJ-002",
    criterion: "interface_standard_met",
    enforceLevel: "required",
    required: true,
    description: "API layer must meet interface standard policy",
  },
  {
    id: "ACMP-RUL-003",
    kind: "alignment",
    complianceObjectRef: "ACMP-OBJ-003",
    criterion: "cross_layer_refs_aligned",
    enforceLevel: "required",
    required: true,
    description: "Domain layer cross-layer references must align",
  },
  {
    id: "ACMP-RUL-004",
    kind: "standard",
    complianceObjectRef: "ACMP-OBJ-004",
    criterion: "frozen_layer_unchanged",
    enforceLevel: "required",
    required: true,
    description: "Data layer frozen change policy compliance",
  },
  {
    id: "ACMP-RUL-005",
    kind: "gate",
    complianceObjectRef: "ACMP-OBJ-005",
    criterion: "security_gate_pass",
    enforceLevel: "required",
    required: true,
    description: "Security governance gate must pass",
  },
  {
    id: "ACMP-RUL-006",
    kind: "structural",
    complianceObjectRef: "ACMP-OBJ-006",
    criterion: "governance_module_root",
    enforceLevel: "required",
    required: true,
    description: "Platform governance module root layout compliance",
  },
  {
    id: "ACMP-RUL-007",
    kind: "gate",
    complianceObjectRef: "ACMP-OBJ-007",
    criterion: "verify_script_contract",
    enforceLevel: "required",
    required: true,
    description: "Monitoring verify script contract compliance",
  },
  {
    id: "ACMP-RUL-008",
    kind: "deviation",
    complianceObjectRef: "ACMP-OBJ-008",
    criterion: "zero_unapproved_deviations",
    enforceLevel: "required",
    required: true,
    description: "Deployment layer must have zero unapproved deviations",
  },
];

export function buildComplianceRuleManifest(): ComplianceRuleManifest {
  const rules = COMPLIANCE_RULE_CATALOG;
  const kinds = new Set(rules.map((r) => r.kind));
  const catalogComplete = rules.length >= 6 && kinds.size >= 4;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    entryCount: rules.length,
    kindCount: kinds.size,
    catalogComplete,
    rules,
    summary: [
      `compliance-rules count=${rules.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceRulesByObjectRef(
  complianceObjectRef: string,
): ComplianceRuleEntry[] {
  return COMPLIANCE_RULE_CATALOG.filter((r) => r.complianceObjectRef === complianceObjectRef);
}

export function getComplianceRuleById(id: string): ComplianceRuleEntry | undefined {
  return COMPLIANCE_RULE_CATALOG.find((r) => r.id === id);
}
