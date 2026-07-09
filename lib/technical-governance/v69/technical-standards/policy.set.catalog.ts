/**
 * V69 P4 — Standard policy set catalog (declarative umbrella)
 */
import type { StandardPolicySetEntry, StandardPolicySetManifest } from "./standards.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "./standards.types";

export const STANDARD_POLICY_SET_CATALOG: StandardPolicySetEntry[] = [
  {
    id: "TSTD-SET-001",
    domain: "naming",
    label: "governance_id_prefix",
    standardRef: "TSTD-NAM-001",
    codePolicyRef: "CGOV-POL-006",
    enforceLevel: "required",
    required: true,
    description: "Governance artifact ID prefix standard",
  },
  {
    id: "TSTD-SET-002",
    domain: "version",
    label: "phase_version_token",
    standardRef: "TSTD-VER-001",
    codePolicyRef: "CGOV-POL-004",
    enforceLevel: "required",
    required: true,
    description: "Per-phase version token standard",
  },
  {
    id: "TSTD-SET-003",
    domain: "interface",
    label: "barrel_export_contract",
    standardRef: "TSTD-IFC-001",
    codePolicyRef: "CGOV-POL-003",
    enforceLevel: "required",
    required: true,
    description: "Barrel export interface standard",
  },
  {
    id: "TSTD-SET-004",
    domain: "directory",
    label: "governance_module_root",
    standardRef: "TSTD-DIR-001",
    enforceLevel: "required",
    required: true,
    description: "Technical governance module root layout",
  },
  {
    id: "TSTD-SET-005",
    domain: "change",
    label: "frozen_layer_change",
    standardRef: "TSTD-CHG-001",
    codePolicyRef: "CGOV-POL-001",
    enforceLevel: "required",
    required: true,
    description: "Frozen layer change prohibition",
  },
  {
    id: "TSTD-SET-006",
    domain: "governance",
    label: "declarative_only",
    standardRef: "TSTD-CHG-002",
    codePolicyRef: "CGOV-POL-002",
    enforceLevel: "required",
    required: true,
    description: "Declarative governance-only modules",
  },
  {
    id: "TSTD-SET-007",
    domain: "interface",
    label: "verify_script_contract",
    standardRef: "TSTD-IFC-003",
    codePolicyRef: "CGOV-POL-004",
    enforceLevel: "required",
    required: true,
    description: "Verify script interface standard",
  },
  {
    id: "TSTD-SET-008",
    domain: "change",
    label: "rollback_index_required",
    standardRef: "TSTD-CHG-004",
    codePolicyRef: "CGOV-POL-007",
    enforceLevel: "required",
    required: true,
    description: "Rollback index per phase standard",
  },
];

export function buildStandardPolicySetManifest(): StandardPolicySetManifest {
  const policies = STANDARD_POLICY_SET_CATALOG;
  const domains = new Set(policies.map((p) => p.domain));
  const catalogComplete = policies.length >= 6 && domains.size >= 5;

  return {
    version: V69_TECHNICAL_STANDARDS_VERSION,
    entryCount: policies.length,
    domainCount: domains.size,
    catalogComplete,
    policies,
    summary: [
      `policy-set count=${policies.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPolicySetByDomain(
  domain: StandardPolicySetEntry["domain"],
): StandardPolicySetEntry[] {
  return STANDARD_POLICY_SET_CATALOG.filter((p) => p.domain === domain);
}
