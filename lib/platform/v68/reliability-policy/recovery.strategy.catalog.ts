/**
 * V68 P6 — Recovery strategy catalog (declarative)
 */
import type { RecoveryStrategyEntry, RecoveryStrategyManifest } from "./governance.types";
import { V68_RELIABILITY_POLICY_VERSION } from "./governance.types";

export const RECOVERY_STRATEGY_CATALOG: RecoveryStrategyEntry[] = [
  {
    id: "REL-REC-001",
    serviceDefRef: "SVC-DEF-001",
    failureRef: "REL-FAIL-001",
    kind: "rollback",
    rtoMinutes: 30,
    runbookRef: "lib/deployment/v66/rollback.guard.ts",
    required: true,
    description: "Rollback production API on total outage",
  },
  {
    id: "REL-REC-002",
    serviceDefRef: "SVC-DEF-001",
    failureRef: "REL-FAIL-002",
    kind: "auto-retry",
    rtoMinutes: 15,
    required: true,
    description: "Auto-retry transient API failures",
  },
  {
    id: "REL-REC-003",
    serviceDefRef: "SVC-DEF-002",
    failureRef: "REL-FAIL-003",
    kind: "auto-retry",
    rtoMinutes: 5,
    required: true,
    description: "Retry health probe on partial impact",
  },
  {
    id: "REL-REC-004",
    serviceDefRef: "SVC-DEF-003",
    failureRef: "REL-FAIL-001",
    kind: "manual-runbook",
    rtoMinutes: 60,
    runbookRef: "docs/monitoring/V67-INCIDENT-LIFECYCLE.md",
    required: true,
    description: "Manual incident commander runbook for outage",
  },
  {
    id: "REL-REC-005",
    serviceDefRef: "SVC-DEF-004",
    failureRef: "REL-FAIL-006",
    kind: "postmortem",
    rtoMinutes: 1440,
    runbookRef: "docs/monitoring/V67-POSTMORTEM-FOUNDATION.md",
    required: true,
    description: "Postmortem required after SLO breach",
  },
  {
    id: "REL-REC-006",
    serviceDefRef: "SVC-DEF-006",
    failureRef: "REL-FAIL-007",
    kind: "rollback",
    rtoMinutes: 20,
    runbookRef: "lib/deployment/v66/release.ts",
    required: true,
    description: "Rollback failed deployment",
  },
  {
    id: "REL-REC-007",
    serviceDefRef: "SVC-DEF-007",
    failureRef: "REL-FAIL-008",
    kind: "failover",
    rtoMinutes: 10,
    required: true,
    description: "Failover readiness probe to secondary",
  },
  {
    id: "REL-REC-008",
    serviceDefRef: "SVC-DEF-008",
    failureRef: "REL-FAIL-006",
    kind: "manual-runbook",
    rtoMinutes: 120,
    runbookRef: "docs/monitoring/V67-SLO-GOVERNANCE.md",
    required: true,
    description: "Manual SLO recovery runbook",
  },
];

export function buildRecoveryStrategyManifest(): RecoveryStrategyManifest {
  const strategies = RECOVERY_STRATEGY_CATALOG;
  const kinds = new Set(strategies.map((s) => s.kind));
  const catalogComplete = strategies.length >= 6 && kinds.size >= 4;

  return {
    version: V68_RELIABILITY_POLICY_VERSION,
    entryCount: strategies.length,
    kindCount: kinds.size,
    catalogComplete,
    strategies,
    summary: [
      `recovery-strategies count=${strategies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getRecoveryByServiceRef(serviceDefRef: string): RecoveryStrategyEntry[] {
  return RECOVERY_STRATEGY_CATALOG.filter((s) => s.serviceDefRef === serviceDefRef);
}
