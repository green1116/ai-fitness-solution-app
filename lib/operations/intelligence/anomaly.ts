/**
 * V4-A2 Anomaly Detection Intelligence
 */

import { createOperationalSignalBatch, getSignalByKind } from "./signals";
import type { OperationalAnomaly, OperationalSignalKind } from "./types";

const ANOMALY_THRESHOLD = 70;

export function detectOperationalAnomalies(input?: {
  deploymentId?: string;
}): OperationalAnomaly[] {
  const deploymentId = input?.deploymentId ?? "operational-anomaly";
  const traceRoot = `trace-anomaly-${deploymentId.slice(0, 8)}`;
  const batch = createOperationalSignalBatch({ deploymentId });
  const observedAt = batch.collectedAt;
  const anomalies: OperationalAnomaly[] = [];

  const checks: { kind: OperationalSignalKind; label: string }[] = [
    { kind: "errorRate", label: "Elevated degraded operation rate" },
    { kind: "latency", label: "Latency proxy below comfort band" },
    { kind: "queuePressure", label: "Queue pressure elevated" },
    { kind: "resourcePressure", label: "Resource pressure elevated" },
    { kind: "executionDrift", label: "Baseline execution drift" },
  ];

  for (const check of checks) {
    const sig = getSignalByKind(batch, check.kind);
    if (!sig) continue;
    const score = sig.normalizedScore;
    const detected = score < ANOMALY_THRESHOLD;
    const severity: OperationalAnomaly["severity"] =
      score < 50 ? "high" : score < ANOMALY_THRESHOLD ? "medium" : "low";

    anomalies.push({
      anomalyId: `anomaly-${check.kind}`,
      id: `anomaly-${check.kind}`,
      kind: check.kind,
      severity,
      detected,
      explanation: detected
        ? `${check.label}: normalized=${score} (threshold=${ANOMALY_THRESHOLD}).`
        : `${check.label}: within band (normalized=${score}).`,
      source: sig.source,
      traceId: `${traceRoot}-${check.kind}`,
      observedAt,
      evidence: [`signal:${check.kind}=${score}`, `value:${sig.value}`],
      confidence: detected ? (severity === "high" ? 88 : 72) : 95,
    });
  }

  const errorSig = getSignalByKind(batch, "errorRate");
  const driftSig = getSignalByKind(batch, "executionDrift");
  if (errorSig && driftSig && errorSig.normalizedScore < 80 && driftSig.normalizedScore < 80) {
    anomalies.push({
      anomalyId: "anomaly-composite-stability",
      id: "anomaly-composite-stability",
      kind: "composite",
      severity: "high",
      detected: true,
      explanation: "Composite risk: error rate and execution drift both below comfort.",
      source: "anomaly.composite",
      traceId: `${traceRoot}-composite`,
      observedAt,
      evidence: [`errorRate:${errorSig.normalizedScore}`, `executionDrift:${driftSig.normalizedScore}`],
      confidence: 85,
    });
  }

  return anomalies;
}
