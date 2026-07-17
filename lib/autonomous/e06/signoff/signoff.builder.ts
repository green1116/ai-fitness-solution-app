/**
 * E06-P8 — Autonomous Enterprise OS sign-off report builder (read-only)
 */

import { collectAutonomousPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildAutonomousFreezeManifest } from "./signoff.manifest";
import type {
  AutonomousSignoffPhase,
  AutonomousSignoffReport,
  AutonomousSignoffSignals,
  SignoffState,
} from "./signoff.types";
import { E06_AUTONOMOUS_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: AutonomousSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "E06 Autonomous Enterprise OS — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map(
      (p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`,
    ),
  ];
  return lines.join("\n");
}

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildAutonomousFreezeManifest>,
): AutonomousSignoffPhase[] {
  const readiness = collectAutonomousPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): AutonomousSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Autonomous Operation Foundation",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Business Action Runtime",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Autonomous Workflow Agent",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Enterprise Control Plane",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Self Optimization Loop",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Enterprise Digital Twin",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Autonomous Enterprise Agent",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Autonomous Enterprise OS Governance Freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildAutonomousSignoff(input?: {
  deploymentId?: string;
  signals?: AutonomousSignoffSignals;
}): AutonomousSignoffReport {
  const deploymentId = input?.deploymentId ?? "e06-autonomous-signoff-default";
  const freeze = buildAutonomousFreezeManifest({
    deploymentId,
    signals: input?.signals,
  });
  const readiness = collectAutonomousPhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff =
    freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff ? 100 : freeze.agentBaseline.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: E06_AUTONOMOUS_SIGNOFF_VERSION,
    signoffId: `autonomous-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `autonomous-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertAutonomousSignoffPass(
  report: AutonomousSignoffReport,
): asserts report is AutonomousSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`E06 autonomous sign-off not complete: ${report.summary}`);
  }
}
