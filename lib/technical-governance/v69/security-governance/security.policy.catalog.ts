/**
 * V69 P5 — Security policy catalog (declarative)
 */
import type { SecurityPolicyEntry, SecurityPolicyManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const SECURITY_POLICY_CATALOG: SecurityPolicyEntry[] = [
  {
    id: "SEC-POL-001",
    kind: "authentication",
    label: "session_auth_required",
    standardRef: "SEC-ACC-001",
    enforceLevel: "required",
    required: true,
    description: "Authenticated sessions required for privileged routes",
  },
  {
    id: "SEC-POL-002",
    kind: "authorization",
    label: "rbac_enforced",
    standardRef: "SEC-PERM-001",
    enforceLevel: "required",
    required: true,
    description: "RBAC permission model enforced at API boundary",
  },
  {
    id: "SEC-POL-003",
    kind: "access-control",
    label: "least_privilege",
    standardRef: "SEC-ACC-002",
    enforceLevel: "required",
    required: true,
    description: "Least-privilege access for all governance modules",
  },
  {
    id: "SEC-POL-004",
    kind: "audit",
    label: "security_audit_trail",
    standardRef: "SEC-AUD-001",
    enforceLevel: "required",
    required: true,
    description: "Security-relevant actions must be auditable",
  },
  {
    id: "SEC-POL-005",
    kind: "risk",
    label: "risk_tiered_controls",
    standardRef: "SEC-RISK-001",
    enforceLevel: "required",
    required: true,
    description: "Risk controls mapped to sensitive surfaces",
  },
  {
    id: "SEC-POL-006",
    kind: "data-protection",
    label: "credential_surface_protected",
    standardRef: "SEC-SUR-002",
    enforceLevel: "required",
    required: true,
    description: "Credential surfaces require elevated controls",
  },
  {
    id: "SEC-POL-007",
    kind: "access-control",
    label: "frozen_zone_readonly",
    standardRef: "SEC-ACC-006",
    enforceLevel: "required",
    required: true,
    description: "Frozen governance zones are read-only imports",
  },
  {
    id: "SEC-POL-008",
    kind: "audit",
    label: "governance_change_audit",
    standardRef: "SEC-AUD-004",
    enforceLevel: "required",
    required: true,
    description: "Governance phase changes require audit record",
  },
];

export function buildSecurityPolicyManifest(): SecurityPolicyManifest {
  const policies = SECURITY_POLICY_CATALOG;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete = policies.length >= 6 && kinds.size >= 4;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    policyCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `security-policies count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getSecurityPolicyById(id: string): SecurityPolicyEntry | undefined {
  return SECURITY_POLICY_CATALOG.find((p) => p.id === id);
}
