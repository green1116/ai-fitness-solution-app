/**
 * E05-P8 — Intelligence sign-off report builder (read-only)
 */

import { collectIntelligencePhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildIntelligenceFreezeManifest } from "./signoff.manifest";
import type {
  IntelligenceSignoffPhase,
  IntelligenceSignoffReport,
  IntelligenceSignoffSignals,
  SignoffState,
} from "./signoff.types";
import { E05_INTELLIGENCE_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: IntelligenceSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "E05 Enterprise Intelligence Layer — Final Sign-Off",
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
  freeze: ReturnType<typeof buildIntelligenceFreezeManifest>,
): IntelligenceSignoffPhase[] {
  const readiness = collectIntelligencePhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): IntelligenceSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Intelligence Foundation",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Business Analytics Runtime",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "KPI Intelligence Engine",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Forecasting Runtime",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Optimization Engine",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Enterprise Simulation Runtime",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Autonomous Strategy Agent",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Intelligence Governance Freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildIntelligenceSignoff(input?: {
  deploymentId?: string;
  signals?: IntelligenceSignoffSignals;
}): IntelligenceSignoffReport {
  const deploymentId =
    input?.deploymentId ?? "e05-intelligence-signoff-default";
  const freeze = buildIntelligenceFreezeManifest({
    deploymentId,
    signals: input?.signals,
  });
  const readiness = collectIntelligencePhaseReadiness(deploymentId);

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
      : freeze.strategyBaseline.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: E05_INTELLIGENCE_SIGNOFF_VERSION,
    signoffId: `intelligence-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `intelligence-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertIntelligenceSignoffPass(
  report: IntelligenceSignoffReport,
): asserts report is IntelligenceSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(
      `E05 intelligence sign-off not complete: ${report.summary}`,
    );
  }
}
