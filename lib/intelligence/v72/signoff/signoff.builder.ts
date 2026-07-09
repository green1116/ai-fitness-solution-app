/**
 * V72 P8 — Intelligence sign-off report builder (read-only)
 */
import { buildIntelligenceFreezeManifest } from "./signoff.manifest";
import { collectIntelligencePhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import type {
  IntelligenceSignoffPhase,
  IntelligenceSignoffReport,
  IntelligenceSignoffSignals,
  SignoffState,
} from "./signoff.types";
import { V72_INTELLIGENCE_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: IntelligenceSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "V72 Operational Intelligence — Final Sign-Off",
    `  signedOff: ${input.signedOff}`,
    `  phases: ${passed}/${input.phases.length}`,
    `  readinessScore: ${input.readinessScore}`,
    ...input.phases.map((p) => `  ${p.id} ${p.label}: ${p.ok ? "PASS" : "FAIL"}`),
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
      label: "Intelligence catalog",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Signal dependency",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "Intelligence policy",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Intelligence compatibility",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Intelligence governance",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Intelligence lifecycle",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Intelligence compliance",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Sign-off & freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildIntelligenceSignoff(input?: {
  deploymentId?: string;
  signals?: IntelligenceSignoffSignals;
}): IntelligenceSignoffReport {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-signoff-default";
  const freeze = buildIntelligenceFreezeManifest({ deploymentId, signals: input?.signals });
  const readiness = collectIntelligencePhaseReadiness(deploymentId);

  const phases = collectPhases(deploymentId, freeze);
  const gateSummary = buildGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.freezeState.frozen && allPhasesPass && gateSummary.allGatesPass;

  const signoffState: SignoffState = {
    signedOff,
    allPhasesPass,
    finalReadinessScore: signedOff ? 100 : freeze.intelligenceCompliance.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: V72_INTELLIGENCE_SIGNOFF_VERSION,
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
    throw new Error(`V72 intelligence sign-off not complete: ${report.summary}`);
  }
}
