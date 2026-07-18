/**
 * E08-P8 — Ecosystem sign-off report builder (read-only)
 */

import { collectEcosystemPhaseReadiness } from "./readiness.collector";
import { buildGateSummary } from "./release.gate.summary";
import { buildEcosystemFreezeManifest } from "./signoff.manifest";
import type {
  EcosystemSignoffPhase,
  EcosystemSignoffReport,
  EcosystemSignoffSignals,
  SignoffState,
} from "./signoff.types";
import { E08_ECOSYSTEM_SIGNOFF_VERSION } from "./signoff.types";

function formatClosingSummary(input: {
  phases: EcosystemSignoffPhase[];
  signedOff: boolean;
  readinessScore: number;
}): string {
  const passed = input.phases.filter((p) => p.ok).length;
  const lines = [
    "E08 Autonomous Enterprise Ecosystem Platform — Final Sign-Off",
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
  freeze: ReturnType<typeof buildEcosystemFreezeManifest>,
): EcosystemSignoffPhase[] {
  const readiness = collectEcosystemPhaseReadiness(deploymentId);

  const phaseState = (ok: boolean): EcosystemSignoffPhase["state"] =>
    ok ? "pass" : readiness.blocked ? "blocked" : "fail";

  return [
    {
      id: "P1",
      label: "Enterprise Ecosystem Foundation",
      state: phaseState(readiness.p1),
      ok: readiness.p1,
    },
    {
      id: "P2",
      label: "Multi Organization Network",
      state: phaseState(readiness.p2),
      ok: readiness.p2,
    },
    {
      id: "P3",
      label: "AI Partner Exchange",
      state: phaseState(readiness.p3),
      ok: readiness.p3,
    },
    {
      id: "P4",
      label: "Cross Enterprise Workflow",
      state: phaseState(readiness.p4),
      ok: readiness.p4,
    },
    {
      id: "P5",
      label: "Ecosystem Intelligence",
      state: phaseState(readiness.p5),
      ok: readiness.p5,
    },
    {
      id: "P6",
      label: "Autonomous Market Agent",
      state: phaseState(readiness.p6),
      ok: readiness.p6,
    },
    {
      id: "P7",
      label: "Enterprise Network OS",
      state: phaseState(readiness.p7),
      ok: readiness.p7,
    },
    {
      id: "P8",
      label: "Autonomous Enterprise Ecosystem Governance Freeze",
      state: freeze.freezeState.frozen ? "ready" : "fail",
      ok: freeze.freezeState.frozen,
    },
  ];
}

export function buildEcosystemSignoff(input?: {
  deploymentId?: string;
  signals?: EcosystemSignoffSignals;
}): EcosystemSignoffReport {
  const deploymentId = input?.deploymentId ?? "e08-ecosystem-signoff-default";
  const freeze = buildEcosystemFreezeManifest({
    deploymentId,
    signals: input?.signals,
  });
  const readiness = collectEcosystemPhaseReadiness(deploymentId);

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
      : freeze.networkOsBaseline.readinessScore,
    state: signedOff ? "ready" : readiness.blocked ? "blocked" : "fail",
  };

  const closingSummary = formatClosingSummary({
    phases,
    signedOff,
    readinessScore: signoffState.finalReadinessScore,
  });

  return {
    version: E08_ECOSYSTEM_SIGNOFF_VERSION,
    signoffId: `ecosystem-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    gateSummary,
    readiness,
    freeze,
    signoffState,
    closingSummary,
    summary: [
      `ecosystem-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.freezeState.frozen}`,
      `state=${signoffState.state}`,
    ].join(" "),
  };
}

export function assertEcosystemSignoffPass(
  report: EcosystemSignoffReport,
): asserts report is EcosystemSignoffReport & {
  signoffState: SignoffState & { signedOff: true };
} {
  if (!report.signoffState.signedOff) {
    throw new Error(`E08 ecosystem sign-off not complete: ${report.summary}`);
  }
}
