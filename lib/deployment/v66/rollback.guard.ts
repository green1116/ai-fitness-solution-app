/**
 * V66 P4 — Rollback guard rules (declarative, read-only)
 */
import type {
  ReleaseOrchestrationSignals,
  RollbackGuardManifest,
  RollbackGuardRule,
  RollbackGuardStatus,
} from "./release.types";
import { V66_RELEASE_ORCHESTRATION_VERSION } from "./release.types";

type RollbackGuardDefinition = {
  id: string;
  label: string;
  severity: RollbackGuardRule["severity"];
  required: boolean;
  rollbackAction: string;
  evaluate: (signals: ReleaseOrchestrationSignals) => RollbackGuardStatus;
  notes?: string;
};

const ROLLBACK_GUARD_DEFINITIONS: RollbackGuardDefinition[] = [
  {
    id: "RG-001",
    label: "V48–V65 frozen layers untouched",
    severity: "critical",
    required: true,
    rollbackAction: "Revert any mutation to lib/production/v65 or lib/commercial/v64",
    evaluate: (s) => (s.rollbackGuardIntact !== false ? "armed" : "tripped"),
  },
  {
    id: "RG-002",
    label: "V66 verify chain must pass before rollout",
    severity: "critical",
    required: true,
    rollbackAction: "npm run verify:v66-deployment — block rollout on fail",
    evaluate: (s) => (s.rolloutStagesComplete ? "armed" : "tripped"),
  },
  {
    id: "RG-003",
    label: "P1–P3 modules rollback-safe (delete-only)",
    severity: "high",
    required: true,
    rollbackAction: "Delete lib/deployment/v66 P-layer modules + verify scripts",
    evaluate: (s) => (s.manifestComplete ? "armed" : "tripped"),
  },
  {
    id: "RG-004",
    label: "No Prisma schema mutation in V66 layer",
    severity: "critical",
    required: true,
    rollbackAction: "V66 is declarative only — no prisma/schema changes",
    evaluate: () => "armed",
  },
  {
    id: "RG-005",
    label: "No API/UI runtime mutation in V66 layer",
    severity: "critical",
    required: true,
    rollbackAction: "Revert app/ changes if any V66 layer touched routes",
    evaluate: () => "armed",
  },
  {
    id: "RG-006",
    label: "Observability baseline intact before release",
    severity: "high",
    required: true,
    rollbackAction: "Re-run verify:v66-p3-deployment-observability",
    evaluate: (s) => (s.observabilityReady ? "armed" : "tripped"),
  },
  {
    id: "RG-007",
    label: "Release manifest documents all layers",
    severity: "medium",
    required: true,
    rollbackAction: "Restore release.manifest.ts catalog",
    evaluate: (s) => (s.manifestComplete ? "armed" : "tripped"),
  },
  {
    id: "RG-008",
    label: "P4 rollback path documented",
    severity: "medium",
    required: true,
    rollbackAction: "See docs/deployment/V66-RELEASE-ORCHESTRATION.md rollback section",
    evaluate: (s) => (s.rollbackGuardIntact ? "armed" : "tripped"),
  },
];

export const ROLLBACK_GUARD_RULE_COUNT = ROLLBACK_GUARD_DEFINITIONS.length;

export function evaluateRollbackGuard(
  signals: ReleaseOrchestrationSignals,
): RollbackGuardRule[] {
  return ROLLBACK_GUARD_DEFINITIONS.map((def) => ({
    id: def.id,
    label: def.label,
    severity: def.severity,
    required: def.required,
    status: def.evaluate(signals),
    rollbackAction: def.rollbackAction,
    notes: def.notes,
  }));
}

export function buildRollbackGuardManifest(
  signals: ReleaseOrchestrationSignals,
): RollbackGuardManifest {
  const rules = evaluateRollbackGuard(signals);
  const armedCount = rules.filter((r) => r.status === "armed").length;
  const guardIntact = rules
    .filter((r) => r.required)
    .every((r) => r.status === "armed");

  return {
    version: V66_RELEASE_ORCHESTRATION_VERSION,
    ruleCount: rules.length,
    armedCount,
    guardIntact,
    rules,
    summary: [
      `rollback-guard armed=${armedCount}/${rules.length}`,
      `intact=${guardIntact}`,
    ].join(" "),
  };
}
