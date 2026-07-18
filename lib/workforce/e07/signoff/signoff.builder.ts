/**
 * E07-P8 — Digital Workforce sign-off report builder (read-only)
 */

import { collectWorkforcePhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildWorkforceFreezeManifest } from "./signoff.manifest";
import type {
  SignoffState,
  WorkforceSignoffPhase,
  WorkforceSignoffReport,
  WorkforceSignoffSignals,
} from "./signoff.types";
import { E07_WORKFORCE_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: WorkforceSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "E07 Digital Workforce Platform — Final Sign-Off",
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
  freeze: ReturnType<typeof buildWorkforceFreezeManifest>,
): WorkforceSignoffPhase[] {
  const readiness = collectWorkforcePhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): WorkforceSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Digital Workforce Foundation",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "AI Employee Runtime",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Role Agent Marketplace",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Workforce Orchestration",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Human-AI Collaboration",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Workforce Learning Loop",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Autonomous Organization",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Digital Workforce Governance Freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildWorkforceSignoff(input?: {
  deploymentId?: string;
  signals?: WorkforceSignoffSignals;
}): WorkforceSignoffReport {
  const deploymentId = input?.deploymentId ?? "e07-workforce-signoff-default";
  const freeze = buildWorkforceFreezeManifest({
    deploymentId,
    signals: input?.signals,
  });
  const readiness = collectWorkforcePhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff =
    freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff
      ? 100
      : freeze.organizationBaseline.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: E07_WORKFORCE_SIGNOFF_VERSION,
    signoffId: `workforce-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `workforce-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertWorkforceSignoffPass(
  report: WorkforceSignoffReport,
): asserts report is WorkforceSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`E07 workforce sign-off not complete: ${report.summary}`);
  }
}
