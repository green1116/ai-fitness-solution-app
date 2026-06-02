/**
 * V4-A2 Failure Trend & Execution Pattern Intelligence
 */

import { buildProductionOperationsRegistry } from "../registry";
import { buildOperationalStabilityReport } from "../stability";
import { getReleaseFoundationForOperations } from "../operations-context";
import { createOperationalSignalBatch, getSignalByKind } from "./signals";
import type { OperationalTrend, OperationalTrendDirection } from "./types";

function directionFromScore(score: number): OperationalTrendDirection {
  if (score >= 85) return "improving";
  if (score >= 70) return "stable";
  return "declining";
}

export function analyzeOperationalTrends(input?: {
  deploymentId?: string;
}): OperationalTrend[] {
  const deploymentId = input?.deploymentId ?? "operational-trends";
  const traceRoot = `trace-trend-${deploymentId.slice(0, 8)}`;
  const batch = createOperationalSignalBatch({ deploymentId });
  const release = getReleaseFoundationForOperations(deploymentId);
  const stability = buildOperationalStabilityReport({ deploymentId });
  const observedAt = batch.collectedAt;

  const mk = (
    trendId: string,
    metric: string,
    direction: OperationalTrendDirection,
    delta: number,
    explanation: string,
    evidence: string[],
    confidence: number,
  ): OperationalTrend => ({
    trendId,
    id: trendId,
    metric,
    direction,
    delta,
    explanation,
    source: "trends.derive",
    traceId: `${traceRoot}-${trendId}`,
    observedAt,
    evidence,
    confidence,
  });

  const errorSig = getSignalByKind(batch, "errorRate");
  const successSig = getSignalByKind(batch, "successRatio");

  return [
    mk(
      "trend-stability",
      "stabilityIndex",
      directionFromScore(stability.stabilityIndex),
      stability.stabilityIndex - 80,
      `Stability index ${stability.stabilityIndex} (target >= 80).`,
      [`stabilityIndex:${stability.stabilityIndex}`],
      90,
    ),
    mk(
      "trend-error-rate",
      "errorRate",
      errorSig ? directionFromScore(errorSig.normalizedScore) : "unknown",
      errorSig ? errorSig.normalizedScore - 90 : 0,
      errorSig
        ? `Error-rate normalized ${errorSig.normalizedScore}, degraded=${stability.degradedOpsCount}.`
        : "Error-rate signal unavailable.",
      errorSig ? [`errorRate:${errorSig.value}`] : [],
      errorSig ? 85 : 50,
    ),
    mk(
      "trend-success-ratio",
      "successRatio",
      successSig ? directionFromScore(successSig.normalizedScore) : "unknown",
      successSig ? successSig.normalizedScore - 85 : 0,
      successSig ? `Success ratio ${successSig.value.toFixed(0)}%.` : "Success-ratio unavailable.",
      successSig ? [`successRatio:${successSig.value}`] : [],
      successSig ? 88 : 50,
    ),
    mk(
      "trend-release-readiness",
      "releaseReadiness",
      release.final.productionReady ? "improving" : "declining",
      release.final.readiness.confidenceScore - 80,
      `Release readiness confidence ${release.final.readiness.confidenceScore}.`,
      [`productionReady:${release.final.productionReady}`],
      92,
    ),
  ];
}

export function analyzeExecutionPatterns(input?: {
  deploymentId?: string;
}): OperationalTrend[] {
  const deploymentId = input?.deploymentId ?? "execution-patterns";
  const traceRoot = `trace-pattern-${deploymentId.slice(0, 8)}`;
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const batch = createOperationalSignalBatch({ deploymentId });
  const observedAt = batch.collectedAt;
  const throughputSig = getSignalByKind(batch, "throughput");

  const byStage = new Map<string, number>();
  for (const record of registry.records) {
    byStage.set(record.stage, (byStage.get(record.stage) ?? 0) + 1);
  }

  const patterns: OperationalTrend[] = [];
  for (const [stage, count] of byStage) {
    patterns.push({
      trendId: `pattern-${stage}`,
      id: `pattern-${stage}`,
      metric: `execution.${stage}`,
      direction: count >= 2 ? "stable" : "declining",
      delta: count,
      explanation: `${count} operation(s) in stage "${stage}".`,
      source: "trends.pattern",
      traceId: `${traceRoot}-${stage}`,
      observedAt,
      evidence: [`stage:${stage}`, `count:${count}`],
      confidence: 80,
    });
  }

  if (throughputSig) {
    patterns.push({
      trendId: "pattern-throughput",
      id: "pattern-throughput",
      metric: "execution.throughput",
      direction: directionFromScore(throughputSig.normalizedScore),
      delta: throughputSig.normalizedScore - 85,
      explanation: `Throughput coverage ${throughputSig.value.toFixed(0)}% (normalized ${throughputSig.normalizedScore}).`,
      source: "trends.pattern",
      traceId: `${traceRoot}-throughput`,
      observedAt,
      evidence: [`throughput:${throughputSig.value}`],
      confidence: 86,
    });
  }

  return patterns;
}
