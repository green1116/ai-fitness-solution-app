/**
 * V69 P8 — Technical governance sign-off report builder (read-only)
 */
import { buildTechnicalFreezeManifest } from "./freeze.manifest";
import { collectTechnicalPhaseReadiness } from "./readiness.collector";
import { buildReleaseGateSummary } from "./release.gate.summary";
import { formatTechnicalClosingSummary } from "./signoff.summary";
import type { TechnicalSignoffPhase, TechnicalSignoffReport, TechnicalSignoffSignals } from "./signoff.types";
import { V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION } from "./signoff.types";

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildTechnicalFreezeManifest>,
): TechnicalSignoffPhase[] {
  const readiness = collectTechnicalPhaseReadiness(deploymentId);

  return [
    { id: "P1", label: "Architecture catalog", ok: readiness.p1 },
    { id: "P2", label: "Architecture dependency", ok: readiness.p2 },
    { id: "P3", label: "Code governance", ok: readiness.p3 },
    { id: "P4", label: "Technical standards", ok: readiness.p4 },
    { id: "P5", label: "Security governance", ok: readiness.p5 },
    { id: "P6", label: "Quality governance", ok: readiness.p6 },
    { id: "P7", label: "Architecture compliance", ok: readiness.p7 },
    { id: "P8", label: "Sign-off & freeze", ok: freeze.frozen },
  ];
}

export function buildTechnicalSignoffReport(input?: {
  deploymentId?: string;
  signals?: TechnicalSignoffSignals;
}): TechnicalSignoffReport {
  const deploymentId = input?.deploymentId ?? "v69-technical-governance-signoff-default";
  const freeze = buildTechnicalFreezeManifest({ deploymentId, signals: input?.signals });

  const phases = collectPhases(deploymentId, freeze);
  const releaseGates = buildReleaseGateSummary(collectTechnicalPhaseReadiness(deploymentId));
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.frozen && allPhasesPass && releaseGates.allGatesPass;

  const closingSummary = formatTechnicalClosingSummary({
    phases,
    signedOff,
    readinessScore: freeze.architectureCompliance.readinessScore,
  });

  return {
    version: V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION,
    signoffId: `technical-governance-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    releaseGates,
    freeze,
    finalReadinessScore: signedOff ? 100 : freeze.architectureCompliance.readinessScore,
    allPhasesPass,
    signedOff,
    closingSummary,
    summary: [
      `technical-governance-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.frozen}`,
    ].join(" "),
  };
}

export function assertTechnicalSignoffPass(
  report: TechnicalSignoffReport,
): asserts report is TechnicalSignoffReport & { signedOff: true } {
  if (!report.signedOff) {
    throw new Error(`V69 technical governance sign-off not complete: ${report.summary}`);
  }
}
