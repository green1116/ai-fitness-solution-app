/**
 * V4-A2 Bottleneck Analysis Intelligence
 */

import { buildOperationalStabilityReport } from "../stability";
import { buildProductionOperationsRegistry } from "../registry";
import { buildOperationalHealthSnapshot } from "./health";
import { detectOperationalAnomalies } from "./anomaly";
import { analyzeOperationalTrends } from "./trends";
import { createOperationalSignalBatch, getSignalByKind } from "./signals";
import type {
  OperationalBottleneck,
  OperationalBottleneckType,
  OperationalSignalKind,
} from "./types";

const BOTTLENECK_THRESHOLD = 70;

type BottleneckRule = {
  type: OperationalBottleneckType;
  signalKind: OperationalSignalKind;
  label: string;
};

const SIGNAL_RULES: BottleneckRule[] = [
  { type: "throughputBottleneck", signalKind: "throughput", label: "Throughput coverage constrained" },
  { type: "latencyBottleneck", signalKind: "latency", label: "Latency proxy elevated" },
  { type: "errorBottleneck", signalKind: "errorRate", label: "Error rate elevated" },
  { type: "retryBottleneck", signalKind: "retryCount", label: "Retry pressure elevated" },
  { type: "fallbackBottleneck", signalKind: "fallbackCount", label: "Fallback usage elevated" },
  { type: "queueBottleneck", signalKind: "queuePressure", label: "Queue pressure elevated" },
  { type: "resourceBottleneck", signalKind: "resourcePressure", label: "Resource pressure elevated" },
  { type: "recoveryBottleneck", signalKind: "recoveryFrequency", label: "Recovery frequency elevated" },
  { type: "executionDriftBottleneck", signalKind: "executionDrift", label: "Execution drift detected" },
];

export function buildOperationalBottleneck(input: {
  deploymentId: string;
  bottleneckType: OperationalBottleneckType;
  severity: OperationalBottleneck["severity"];
  affectedSignals: OperationalSignalKind[];
  evidence: string[];
  explanation: string;
  confidence: number;
  observedAt: string;
  traceRoot: string;
  source?: string;
}): OperationalBottleneck {
  return {
    bottleneckId: `bn-${input.bottleneckType}`,
    bottleneckType: input.bottleneckType,
    severity: input.severity,
    affectedSignals: input.affectedSignals,
    source: input.source ?? "bottlenecks.derive",
    traceId: `${input.traceRoot}-${input.bottleneckType}`,
    observedAt: input.observedAt,
    evidence: input.evidence,
    explanation: input.explanation,
    confidence: input.confidence,
  };
}

export function identifyOperationalBottlenecks(input?: {
  deploymentId?: string;
}): OperationalBottleneck[] {
  const deploymentId = input?.deploymentId ?? "operational-bottlenecks";
  const traceRoot = `trace-bottleneck-${deploymentId.slice(0, 8)}`;
  const batch = createOperationalSignalBatch({ deploymentId });
  const health = buildOperationalHealthSnapshot({ deploymentId });
  const anomalies = detectOperationalAnomalies({ deploymentId });
  const trends = analyzeOperationalTrends({ deploymentId });
  const stability = buildOperationalStabilityReport({ deploymentId });
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const observedAt = batch.collectedAt;
  const bottlenecks: OperationalBottleneck[] = [];

  for (const rule of SIGNAL_RULES) {
    const sig = getSignalByKind(batch, rule.signalKind);
    if (!sig || sig.normalizedScore >= BOTTLENECK_THRESHOLD) continue;

    const severity: OperationalBottleneck["severity"] =
      sig.normalizedScore < 50 ? "high" : sig.normalizedScore < BOTTLENECK_THRESHOLD ? "medium" : "low";

    bottlenecks.push(
      buildOperationalBottleneck({
        deploymentId,
        bottleneckType: rule.type,
        severity,
        affectedSignals: [rule.signalKind],
        evidence: [`signal:${rule.signalKind}=${sig.normalizedScore}`, `value:${sig.value}`],
        explanation: `${rule.label} (normalized=${sig.normalizedScore}, threshold=${BOTTLENECK_THRESHOLD}).`,
        confidence: severity === "high" ? 86 : 74,
        observedAt,
        traceRoot,
      }),
    );
  }

  if (health.stabilityScore < BOTTLENECK_THRESHOLD) {
    bottlenecks.push(
      buildOperationalBottleneck({
        deploymentId,
        bottleneckType: "stabilityBottleneck",
        severity: health.stabilityScore < 50 ? "high" : "medium",
        affectedSignals: ["successRatio", "resourcePressure"],
        evidence: [`health.stabilityScore:${health.stabilityScore}`, health.summary],
        explanation: `Stability score ${health.stabilityScore} below operational comfort.`,
        confidence: 82,
        observedAt,
        traceRoot,
        source: health.source,
      }),
    );
  }

  for (const record of registry.records) {
    if (record.status !== "degraded" && record.status !== "maintenance") continue;
    bottlenecks.push(
      buildOperationalBottleneck({
        deploymentId,
        bottleneckType: record.status === "degraded" ? "errorBottleneck" : "fallbackBottleneck",
        severity: record.stabilityScore < 60 ? "high" : "medium",
        affectedSignals: [],
        evidence: [`operation:${record.id}`, `status:${record.status}`, `domain:${record.domain}`],
        explanation: `Operation ${record.domain} (${record.stage}) in ${record.status} state.`,
        confidence: 78,
        observedAt,
        traceRoot,
        source: "registry.status",
      }),
    );
  }

  const detectedAnomalies = anomalies.filter((a) => a.detected);
  if (bottlenecks.length === 0 && detectedAnomalies.length > 0) {
    const top = detectedAnomalies[0];
    bottlenecks.push(
      buildOperationalBottleneck({
        deploymentId,
        bottleneckType: "stabilityBottleneck",
        severity: top.severity === "high" ? "high" : "medium",
        affectedSignals: top.kind === "composite" ? [] : [top.kind as OperationalSignalKind],
        evidence: top.evidence,
        explanation: `Derived from anomaly: ${top.explanation}`,
        confidence: top.confidence,
        observedAt,
        traceRoot,
        source: top.source,
      }),
    );
  }

  const declining = trends.filter((t) => t.direction === "declining");
  if (declining.length >= 2 && !bottlenecks.some((b) => b.bottleneckType === "stabilityBottleneck")) {
    bottlenecks.push(
      buildOperationalBottleneck({
        deploymentId,
        bottleneckType: "stabilityBottleneck",
        severity: "medium",
        affectedSignals: [],
        evidence: declining.map((t) => t.trendId),
        explanation: `${declining.length} declining trend(s) indicate emerging stability pressure.`,
        confidence: 70,
        observedAt,
        traceRoot,
      }),
    );
  }

  void stability;
  return bottlenecks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function summarizeOperationalBottlenecks(
  bottlenecks: OperationalBottleneck[],
): string {
  if (bottlenecks.length === 0) {
    return "bottlenecks: none identified (conservative threshold applied)";
  }
  const high = bottlenecks.filter((b) => b.severity === "high").length;
  return `bottlenecks: total=${bottlenecks.length} high=${high} top=${bottlenecks[0].bottleneckType}`;
}
