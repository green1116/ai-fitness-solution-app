/**
 * V67 P8 — Monitoring sign-off report builder (read-only)
 */
import { buildMonitoringFreezeManifest } from "./freeze.manifest";
import { collectMonitoringPhaseReadiness } from "./readiness.collector";
import { buildReleaseGateSummary } from "./release.gate.summary";
import { formatMonitoringClosingSummary } from "./signoff.summary";
import type { MonitoringSignoffPhase, MonitoringSignoffReport, MonitoringSignoffSignals } from "./signoff.types";
import { V67_MONITORING_SIGNOFF_VERSION } from "./signoff.types";

function collectPhases(
  deploymentId: string,
  freeze: ReturnType<typeof buildMonitoringFreezeManifest>,
): MonitoringSignoffPhase[] {
  const readiness = collectMonitoringPhaseReadiness(deploymentId);

  return [
    { id: "P1", label: "Monitoring foundation", ok: readiness.p1 },
    { id: "P2", label: "Incident lifecycle", ok: readiness.p2 },
    { id: "P3", label: "Alert taxonomy", ok: readiness.p3 },
    { id: "P4", label: "SLO/SLI governance", ok: readiness.p4 },
    { id: "P5", label: "On-call governance", ok: readiness.p5 },
    { id: "P6", label: "Observability dashboard", ok: readiness.p6 },
    { id: "P7", label: "Postmortem foundation", ok: readiness.p7 },
    { id: "P8", label: "Sign-off & freeze", ok: freeze.frozen },
  ];
}

export function buildMonitoringSignoffReport(input?: {
  deploymentId?: string;
  signals?: MonitoringSignoffSignals;
}): MonitoringSignoffReport {
  const deploymentId = input?.deploymentId ?? "v67-monitoring-signoff-default";
  const freeze = buildMonitoringFreezeManifest({ deploymentId, signals: input?.signals });

  const phases = collectPhases(deploymentId, freeze);
  const readiness = collectMonitoringPhaseReadiness(deploymentId);
  const releaseGates = buildReleaseGateSummary(readiness);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.frozen && allPhasesPass && releaseGates.allGatesPass;

  const closingSummary = formatMonitoringClosingSummary({
    phases,
    signedOff,
    readinessScore: freeze.postmortem.readinessScore,
  });

  return {
    version: V67_MONITORING_SIGNOFF_VERSION,
    signoffId: `monitoring-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    releaseGates,
    freeze,
    finalReadinessScore: signedOff ? 100 : freeze.postmortem.readinessScore,
    allPhasesPass,
    signedOff,
    closingSummary,
    summary: [
      `monitoring-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.frozen}`,
    ].join(" "),
  };
}

export function assertMonitoringSignoffPass(
  report: MonitoringSignoffReport,
): asserts report is MonitoringSignoffReport & { signedOff: true } {
  if (!report.signedOff) {
    throw new Error(`V67 monitoring sign-off not complete: ${report.summary}`);
  }
}
