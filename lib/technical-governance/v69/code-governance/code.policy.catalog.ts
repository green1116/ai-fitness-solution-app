/**
 * V69 P3 — Code policy / standard catalog (declarative)
 */
import type { CodePolicyManifest, CodePolicyStandard } from "./governance.types";
import { V69_CODE_GOVERNANCE_VERSION } from "./governance.types";

export const CODE_POLICY_CATALOG: CodePolicyStandard[] = [
  {
    id: "CGOV-POL-001",
    kind: "frozen-layer",
    label: "frozen_layer_readonly",
    rule: "V48–V68 modules must not be modified by governance layers",
    enforceLevel: "required",
    required: true,
    description: "Frozen upstream layers are read-only references only",
  },
  {
    id: "CGOV-POL-002",
    kind: "structure",
    label: "declarative_governance_only",
    rule: "Technical governance modules contain no runtime business logic",
    enforceLevel: "required",
    required: true,
    description: "Governance code is declarative catalogs and builders",
  },
  {
    id: "CGOV-POL-003",
    kind: "structure",
    label: "barrel_export_required",
    rule: "Each governance phase exports via index/barrel file",
    enforceLevel: "required",
    required: true,
    description: "Unified entry via barrel re-exports",
  },
  {
    id: "CGOV-POL-004",
    kind: "verification",
    label: "verify_script_required",
    rule: "Each phase must have npm run verify:v69-p* script",
    enforceLevel: "required",
    required: true,
    description: "Automated verification for every governance phase",
  },
  {
    id: "CGOV-POL-005",
    kind: "boundary",
    label: "no_db_mutation_in_governance",
    rule: "Governance modules must not alter database schema or runtime DB behavior",
    enforceLevel: "required",
    required: true,
    description: "Code governance does not touch prisma migrations at runtime",
  },
  {
    id: "CGOV-POL-006",
    kind: "naming",
    label: "kebab_case_files",
    rule: "Governance catalog files use kebab-case or dotted segments",
    enforceLevel: "required",
    required: true,
    description: "Consistent file naming across v69 modules",
  },
  {
    id: "CGOV-POL-007",
    kind: "documentation",
    label: "phase_doc_required",
    rule: "Each phase documents freeze and rollback points",
    enforceLevel: "required",
    required: true,
    description: "docs/technical-governance/V69-*.md per phase",
  },
  {
    id: "CGOV-POL-008",
    kind: "boundary",
    label: "import_allowance_declared",
    rule: "Cross-boundary imports must be declared in import allowance catalog",
    enforceLevel: "required",
    required: true,
    description: "Allowed references are explicitly modeled not inferred",
  },
];

export function buildCodePolicyManifest(): CodePolicyManifest {
  const policies = CODE_POLICY_CATALOG;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete = policies.length >= 6 && kinds.size >= 4;

  return {
    version: V69_CODE_GOVERNANCE_VERSION,
    policyCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `code-policies count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCodePolicyById(id: string): CodePolicyStandard | undefined {
  return CODE_POLICY_CATALOG.find((p) => p.id === id);
}
