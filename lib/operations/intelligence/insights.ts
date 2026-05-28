/**
 * V4-A2 Actionable Operational Insights
 */

import { buildOperationalHealthSnapshot } from "./health";
import { detectOperationalAnomalies } from "./anomaly";
import { analyzeOperationalTrends, analyzeExecutionPatterns } from "./trends";
import { identifyOperationalBottlenecks } from "./bottlenecks";
import type {
  OperationalInsight,
  OperationalInsightPriority,
  OperationalInsightType,
} from "./types";

export function buildOperationalInsight(input: {
  insightId: string;
  insightType: OperationalInsightType;
  priority: OperationalInsightPriority;
  title: string;
  summary: string;
  explanation: string;
  evidence: string[];
  confidence: number;
  observedAt: string;
  traceRoot: string;
  relatedAnomalies?: string[];
  relatedTrends?: string[];
  relatedBottlenecks?: string[];
  source?: string;
}): OperationalInsight {
  return {
    insightId: input.insightId,
    insightType: input.insightType,
    priority: input.priority,
    title: input.title,
    summary: input.summary,
    source: input.source ?? "insights.derive",
    traceId: `${input.traceRoot}-${input.insightId}`,
    observedAt: input.observedAt,
    evidence: input.evidence,
    explanation: input.explanation,
    confidence: input.confidence,
    relatedAnomalies: input.relatedAnomalies ?? [],
    relatedTrends: input.relatedTrends ?? [],
    relatedBottlenecks: input.relatedBottlenecks ?? [],
  };
}

export function deriveOperationalInsights(input?: {
  deploymentId?: string;
}): OperationalInsight[] {
  const deploymentId = input?.deploymentId ?? "operational-insights";
  const traceRoot = `trace-insight-${deploymentId.slice(0, 8)}`;
  const health = buildOperationalHealthSnapshot({ deploymentId });
  const anomalies = detectOperationalAnomalies({ deploymentId });
  const trends = [...analyzeOperationalTrends({ deploymentId }), ...analyzeExecutionPatterns({ deploymentId })];
  const bottlenecks = identifyOperationalBottlenecks({ deploymentId });
  const observedAt = health.observedAt;
  const insights: OperationalInsight[] = [];

  insights.push(
    buildOperationalInsight({
      insightId: "ins-stability",
      insightType: "stabilityInsight",
      priority: health.status === "healthy" ? "low" : health.status === "watch" ? "medium" : "high",
      title: "Production stability posture",
      summary: `Health ${health.status} with composite score ${health.healthScore}.`,
      explanation: health.summary,
      evidence: [`healthScore:${health.healthScore}`, `stabilityScore:${health.stabilityScore}`],
      confidence: 90,
      observedAt,
      traceRoot,
    }),
  );

  for (const anomaly of anomalies.filter((a) => a.detected)) {
    insights.push(
      buildOperationalInsight({
        insightId: anomaly.anomalyId,
        insightType: "anomalyInsight",
        priority: anomaly.severity === "high" ? "critical" : "high",
        title: `Anomaly: ${anomaly.kind}`,
        summary: anomaly.explanation,
        explanation: `Detected with confidence ${anomaly.confidence}.`,
        evidence: anomaly.evidence,
        confidence: anomaly.confidence,
        observedAt,
        traceRoot,
        relatedAnomalies: [anomaly.anomalyId],
      }),
    );
  }

  for (const trend of trends.filter((t) => t.direction === "declining")) {
    insights.push(
      buildOperationalInsight({
        insightId: trend.trendId,
        insightType: "trendInsight",
        priority: "medium",
        title: `Declining trend: ${trend.metric}`,
        summary: trend.explanation,
        explanation: `Delta ${trend.delta} indicates downward movement.`,
        evidence: trend.evidence,
        confidence: trend.confidence,
        observedAt,
        traceRoot,
        relatedTrends: [trend.trendId],
      }),
    );
  }

  for (const bottleneck of bottlenecks.slice(0, 5)) {
    insights.push(
      buildOperationalInsight({
        insightId: bottleneck.bottleneckId,
        insightType: "bottleneckInsight",
        priority: bottleneck.severity === "high" ? "critical" : "high",
        title: `Bottleneck: ${bottleneck.bottleneckType}`,
        summary: bottleneck.explanation,
        explanation: `Affects signals: ${bottleneck.affectedSignals.join(", ") || "composite"}.`,
        evidence: bottleneck.evidence,
        confidence: bottleneck.confidence,
        observedAt,
        traceRoot,
        relatedBottlenecks: [bottleneck.bottleneckId],
      }),
    );
  }

  if (health.status === "healthy" && bottlenecks.length === 0) {
    insights.push(
      buildOperationalInsight({
        insightId: "ins-optimization",
        insightType: "optimizationInsight",
        priority: "low",
        title: "Optimization headroom available",
        summary: "No material bottlenecks; maintain current operational posture.",
        explanation: "Conservative analysis found no elevated bottleneck signals.",
        evidence: [`health:${health.status}`],
        confidence: 88,
        observedAt,
        traceRoot,
      }),
    );
  }

  const criticalCount = insights.filter((i) => i.priority === "critical").length;
  if (criticalCount >= 2) {
    insights.push(
      buildOperationalInsight({
        insightId: "ins-escalation",
        insightType: "escalationInsight",
        priority: "critical",
        title: "Escalation recommended",
        summary: `${criticalCount} critical insight(s) require operator review.`,
        explanation: "Multiple critical signals suggest coordinated mitigation.",
        evidence: insights.filter((i) => i.priority === "critical").map((i) => i.insightId),
        confidence: 85,
        observedAt,
        traceRoot,
      }),
    );
  }

  if (bottlenecks.some((b) => b.bottleneckType === "recoveryBottleneck")) {
    insights.push(
      buildOperationalInsight({
        insightId: "ins-recovery",
        insightType: "recoveryInsight",
        priority: "medium",
        title: "Recovery activity elevated",
        summary: "Recovery frequency signals suggest recent stabilization cycles.",
        explanation: "Review frozen/stabilizing operations for repeat recovery patterns.",
        evidence: bottlenecks
          .filter((b) => b.bottleneckType === "recoveryBottleneck")
          .flatMap((b) => b.evidence),
        confidence: 76,
        observedAt,
        traceRoot,
        relatedBottlenecks: bottlenecks
          .filter((b) => b.bottleneckType === "recoveryBottleneck")
          .map((b) => b.bottleneckId),
      }),
    );
  }

  return insights;
}

export function summarizeOperationalInsights(insights: OperationalInsight[]): string {
  const critical = insights.filter((i) => i.priority === "critical").length;
  const high = insights.filter((i) => i.priority === "high").length;
  return `insights: total=${insights.length} critical=${critical} high=${high}`;
}
