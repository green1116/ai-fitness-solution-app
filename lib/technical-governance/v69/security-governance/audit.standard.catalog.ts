/**
 * V69 P5 — Audit standard catalog (declarative)
 */
import type { AuditStandardEntry, AuditStandardManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const AUDIT_STANDARD_CATALOG: AuditStandardEntry[] = [
  {
    id: "SEC-AUD-001",
    securityPolicyRef: "SEC-POL-004",
    auditEvent: "auth.login.success",
    retentionDays: 90,
    required: true,
    description: "Successful login audit trail",
  },
  {
    id: "SEC-AUD-002",
    securityPolicyRef: "SEC-POL-004",
    auditEvent: "auth.login.failure",
    retentionDays: 180,
    required: true,
    description: "Failed login audit trail",
  },
  {
    id: "SEC-AUD-003",
    securityPolicyRef: "SEC-POL-002",
    auditEvent: "rbac.permission.denied",
    retentionDays: 365,
    required: true,
    description: "Permission denial audit event",
  },
  {
    id: "SEC-AUD-004",
    securityPolicyRef: "SEC-POL-008",
    auditEvent: "governance.phase.change",
    retentionDays: 365,
    required: true,
    description: "Governance phase change audit",
  },
  {
    id: "SEC-AUD-005",
    securityPolicyRef: "SEC-POL-005",
    auditEvent: "risk.control.triggered",
    retentionDays: 180,
    required: true,
    description: "Risk control activation audit",
  },
  {
    id: "SEC-AUD-006",
    securityPolicyRef: "SEC-POL-006",
    auditEvent: "credential.surface.access",
    retentionDays: 365,
    required: true,
    description: "Credential surface access audit",
  },
  {
    id: "SEC-AUD-007",
    securityPolicyRef: "SEC-POL-007",
    auditEvent: "frozen.import.attempt",
    retentionDays: 90,
    required: true,
    description: "Frozen zone import attempt audit",
  },
  {
    id: "SEC-AUD-008",
    securityPolicyRef: "SEC-POL-001",
    auditEvent: "session.expired",
    retentionDays: 30,
    required: true,
    description: "Session expiry audit event",
  },
];

export function buildAuditStandardManifest(): AuditStandardManifest {
  const standards = AUDIT_STANDARD_CATALOG;
  const catalogComplete = standards.length >= 6;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    entryCount: standards.length,
    catalogComplete,
    standards,
    summary: [
      `audit-standards count=${standards.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAuditStandardsByPolicyRef(
  securityPolicyRef: string,
): AuditStandardEntry[] {
  return AUDIT_STANDARD_CATALOG.filter((a) => a.securityPolicyRef === securityPolicyRef);
}
