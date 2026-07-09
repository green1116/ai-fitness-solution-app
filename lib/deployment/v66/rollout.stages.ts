/**
 * V66 P4 — Rollout stages (declarative, ordered)
 */
import type {
  ReleaseOrchestrationSignals,
  RolloutStage,
  RolloutStageManifest,
  RolloutStageStatus,
} from "./release.types";
import { V66_RELEASE_ORCHESTRATION_VERSION } from "./release.types";

type RolloutStageDefinition = {
  id: string;
  order: number;
  label: string;
  kind: RolloutStage["kind"];
  target: string;
  required: boolean;
  evaluate: (signals: ReleaseOrchestrationSignals) => RolloutStageStatus;
  notes?: string;
};

const ROLLOUT_STAGE_DEFINITIONS: RolloutStageDefinition[] = [
  {
    id: "RS-001",
    order: 1,
    label: "P1 deployment baseline verify",
    kind: "verify",
    target: "npm run verify:v66-p1-deployment-baseline",
    required: true,
    evaluate: (s) => (s.manifestComplete ? "pass" : "fail"),
  },
  {
    id: "RS-002",
    order: 2,
    label: "P2 execution health verify",
    kind: "verify",
    target: "npm run verify:v66-p2-deployment-execution",
    required: true,
    evaluate: (s) => (s.observabilityReady !== false ? "pass" : "fail"),
    notes: "Requires P2 execution layer upstream of P3",
  },
  {
    id: "RS-003",
    order: 3,
    label: "P3 observability baseline verify",
    kind: "observability",
    target: "npm run verify:v66-p3-deployment-observability",
    required: true,
    evaluate: (s) => (s.observabilityReady ? "pass" : "fail"),
  },
  {
    id: "RS-004",
    order: 4,
    label: "Rollback guard armed",
    kind: "gate",
    target: "lib/deployment/v66/rollback.guard.ts",
    required: true,
    evaluate: (s) => (s.rollbackGuardIntact ? "pass" : "fail"),
  },
  {
    id: "RS-005",
    order: 5,
    label: "Release manifest complete",
    kind: "orchestration",
    target: "lib/deployment/v66/release.manifest.ts",
    required: true,
    evaluate: (s) => (s.manifestComplete ? "pass" : "fail"),
  },
  {
    id: "RS-006",
    order: 6,
    label: "P4 release orchestration verify",
    kind: "orchestration",
    target: "npm run verify:v66-p4-release-orchestration",
    required: true,
    evaluate: (s) => (s.rolloutStagesComplete ? "pass" : "fail"),
  },
  {
    id: "RS-007",
    order: 7,
    label: "Upstream V65 production gate",
    kind: "gate",
    target: "npm run verify:v65-production",
    required: true,
    evaluate: (s) => (s.rollbackGuardIntact ? "pass" : "fail"),
    notes: "Frozen upstream; declarative reference only",
  },
  {
    id: "RS-008",
    order: 8,
    label: "Production cutover (declarative)",
    kind: "cutover",
    target: "docs/deployment/V66-RELEASE-ORCHESTRATION.md",
    required: false,
    evaluate: (s) => (s.rolloutStagesComplete ? "skipped" : "pending"),
    notes: "No live cutover in P4 — documentation gate only",
  },
];

export const ROLLOUT_STAGE_COUNT = ROLLOUT_STAGE_DEFINITIONS.length;

export function buildRolloutStageManifest(
  signals: ReleaseOrchestrationSignals,
): RolloutStageManifest {
  const stages: RolloutStage[] = ROLLOUT_STAGE_DEFINITIONS.map((def) => ({
    id: def.id,
    order: def.order,
    label: def.label,
    kind: def.kind,
    target: def.target,
    required: def.required,
    status: def.evaluate(signals),
    notes: def.notes,
  }));

  const passCount = stages.filter((s) => s.status === "pass").length;
  const sequenceComplete = stages
    .filter((s) => s.required)
    .every((s) => s.status === "pass" || s.status === "skipped");

  return {
    version: V66_RELEASE_ORCHESTRATION_VERSION,
    stageCount: stages.length,
    passCount,
    sequenceComplete,
    stages,
    summary: [
      `rollout-stages pass=${passCount}/${stages.length}`,
      `complete=${sequenceComplete}`,
    ].join(" "),
  };
}
