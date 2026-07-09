/**
 * V68 P8 — Platform sign-off report builder (read-only)
 */
import { buildPlatformFreezeManifest } from "./freeze.manifest";
import { collectPlatformPhaseReadiness } from "./readiness.collector";
import { buildReleaseGateSummary } from "./release.gate.summary";
import { formatPlatformClosingSummary } from "./signoff.summary";
import type { PlatformSignoffPhase, PlatformSignoffReport, PlatformSignoffSignals } from "./signoff.types";
import { V68_PLATFORM_SIGNOFF_VERSION } from "./signoff.types";

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildPlatformFreezeManifest>,
): PlatformSignoffPhase[] {
  const readiness = collectPlatformPhaseReadiness(deploymentId);

  return [
    { id: "P1", label: "Service catalog", ok: readiness.p1 },
    { id: "P2", label: "Dependency graph", ok: readiness.p2 },
    { id: "P3", label: "Configuration governance", ok: readiness.p3 },
    { id: "P4", label: "Feature flag governance", ok: readiness.p4 },
    { id: "P5", label: "Capacity planning", ok: readiness.p5 },
    { id: "P6", label: "Reliability policy", ok: readiness.p6 },
    { id: "P7", label: "Observability policy", ok: readiness.p7 },
    { id: "P8", label: "Sign-off & freeze", ok: freeze.frozen },
  ];
}

export function buildPlatformSignoffReport(input?: {
  deploymentId?: string;
  signals?: PlatformSignoffSignals;
}): PlatformSignoffReport {
  const deploymentId = input?.deploymentId ?? "v68-platform-signoff-default";
  const freeze = buildPlatformFreezeManifest({ deploymentId, signals: input?.signals });

  const phases = collectPhases(deploymentId, freeze);
  const releaseGates = buildReleaseGateSummary(collectPlatformPhaseReadiness(deploymentId));
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.frozen && allPhasesPass && releaseGates.allGatesPass;

  const closingSummary = formatPlatformClosingSummary({
    phases,
    signedOff,
    readinessScore: freeze.observabilityPolicy.readinessScore,
  });

  return {
    version: V68_PLATFORM_SIGNOFF_VERSION,
    signoffId: `platform-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    releaseGates,
    freeze,
    finalReadinessScore: signedOff ? 100 : freeze.observabilityPolicy.readinessScore,
    allPhasesPass,
    signedOff,
    closingSummary,
    summary: [
      `platform-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.frozen}`,
    ].join(" "),
  };
}

export function assertPlatformSignoffPass(
  report: PlatformSignoffReport,
): asserts report is PlatformSignoffReport & { signedOff: true } {
  if (!report.signedOff) {
    throw new Error(`V68 platform sign-off not complete: ${report.summary}`);
  }
}
