/**
 * V4-A2 Recovery & Optimization Recommendations
 */

import { deriveOperationalInsights } from "./insights";
import { identifyOperationalBottlenecks } from "./bottlenecks";
import { buildOperationalHealthSnapshot } from "./health";
import type {
  OperationalRecommendation,
  OperationalRecommendationType,
} from "./types";

export function buildOperationalRecommendation(input: {
  recommendationId: string;
  recommendationType: OperationalRecommendationType;
  priority: OperationalRecommendation["priority"];
  action: string;
  rationale: string;
  expectedOutcome: string;
  evidence: string[];
  confidence: number;
  observedAt: string;
  traceRoot: string;
  relatedInsights: string[];
  source?: string;
}): OperationalRecommendation {
  return {
    recommendationId: input.recommendationId,
    recommendationType: input.recommendationType,
    priority: input.priority,
    action: input.action,
    rationale: input.rationale,
    source: input.source ?? "recommendations.derive",
    traceId: `${input.traceRoot}-${input.recommendationId}`,
    observedAt: input.observedAt,
    evidence: input.evidence,
    expectedOutcome: input.expectedOutcome,
    confidence: input.confidence,
    relatedInsights: input.relatedInsights,
  };
}

const BOTTLENECK_REC_MAP: Partial<
  Record<string, { type: OperationalRecommendationType; action: string; outcome: string }>
> = {
  throughputBottleneck: {
    type: "improveThroughput",
    action: "Increase operational throughput coverage across pending stages.",
    outcome: "Higher throughput normalized score and reduced queue pressure.",
  },
  latencyBottleneck: {
    type: "optimize",
    action: "Investigate latency proxy contributors in registry confidence chain.",
    outcome: "Improved latency normalized score above comfort threshold.",
  },
  errorBottleneck: {
    type: "reduceErrorRate",
    action: "Stabilize degraded operations and re-verify registry statuses.",
    outcome: "Reduced degraded operation rate.",
  },
  retryBottleneck: {
    type: "reduceRetryFrequency",
    action: "Review stabilizing operations and reduce retry churn.",
    outcome: "Lower retry count signal.",
  },
  fallbackBottleneck: {
    type: "reduceFallbackUsage",
    action: "Resolve maintenance fallbacks and restore active operational paths.",
    outcome: "Reduced fallback count.",
  },
  queueBottleneck: {
    type: "reducePressure",
    action: "Relieve queue pressure by clearing blocked operational stages.",
    outcome: "Lower queue pressure signal.",
  },
  resourceBottleneck: {
    type: "reducePressure",
    action: "Reduce resource pressure via stability index recovery actions.",
    outcome: "Improved resource pressure normalized score.",
  },
  recoveryBottleneck: {
    type: "recover",
    action: "Execute controlled recovery for frozen/stabilizing operations.",
    outcome: "Normalized recovery frequency.",
  },
  executionDriftBottleneck: {
    type: "stabilize",
    action: "Re-align execution with sealed production freeze baseline.",
    outcome: "Execution drift within acceptable band.",
  },
  stabilityBottleneck: {
    type: "stabilize",
    action: "Run full stability review across release, governance, and operations registry.",
    outcome: "Stability index restored above 80.",
  },
};

export function generateOperationalRecommendations(input?: {
  deploymentId?: string;
}): OperationalRecommendation[] {
  const deploymentId = input?.deploymentId ?? "operational-recommendations";
  const traceRoot = `trace-rec-${deploymentId.slice(0, 8)}`;
  const health = buildOperationalHealthSnapshot({ deploymentId });
  const insights = deriveOperationalInsights({ deploymentId });
  const bottlenecks = identifyOperationalBottlenecks({ deploymentId });
  const observedAt = health.observedAt;
  const recommendations: OperationalRecommendation[] = [];

  if (health.status === "healthy" && bottlenecks.length === 0) {
    recommendations.push(
      buildOperationalRecommendation({
        recommendationId: "rec-monitor",
        recommendationType: "monitor",
        priority: "low",
        action: "Continue scheduled monitoring; no immediate intervention required.",
        rationale: `Health status ${health.status} with score ${health.healthScore}.`,
        expectedOutcome: "Stable operations with preserved baseline integrity.",
        evidence: [health.summary],
        confidence: 92,
        observedAt,
        traceRoot,
        relatedInsights: insights.filter((i) => i.insightType === "stabilityInsight").map((i) => i.insightId),
      }),
    );
  }

  for (const bottleneck of bottlenecks) {
    const mapped = BOTTLENECK_REC_MAP[bottleneck.bottleneckType];
    const recType = mapped?.type ?? "investigate";
    recommendations.push(
      buildOperationalRecommendation({
        recommendationId: `rec-${bottleneck.bottleneckId}`,
        recommendationType: recType,
        priority: bottleneck.severity === "high" ? "high" : "medium",
        action: mapped?.action ?? `Investigate ${bottleneck.bottleneckType}.`,
        rationale: bottleneck.explanation,
        expectedOutcome: mapped?.outcome ?? "Bottleneck signal returns above comfort threshold.",
        evidence: bottleneck.evidence,
        confidence: bottleneck.confidence,
        observedAt,
        traceRoot,
        relatedInsights: insights
          .filter((i) => i.relatedBottlenecks.includes(bottleneck.bottleneckId))
          .map((i) => i.insightId),
      }),
    );
  }

  for (const insight of insights.filter((i) => i.insightType === "escalationInsight")) {
    recommendations.push(
      buildOperationalRecommendation({
        recommendationId: `rec-escalation-${insight.insightId}`,
        recommendationType: "escalate",
        priority: "high",
        action: "Escalate to human operator for coordinated mitigation review.",
        rationale: insight.summary,
        expectedOutcome: "Operator acknowledgment and mitigation plan recorded.",
        evidence: insight.evidence,
        confidence: insight.confidence,
        observedAt,
        traceRoot,
        relatedInsights: [insight.insightId],
      }),
    );
  }

  for (const insight of insights.filter((i) => i.insightType === "anomalyInsight").slice(0, 2)) {
    if (recommendations.some((r) => r.relatedInsights.includes(insight.insightId))) continue;
    recommendations.push(
      buildOperationalRecommendation({
        recommendationId: `rec-anomaly-${insight.insightId}`,
        recommendationType: "investigate",
        priority: "medium",
        action: `Investigate anomaly root cause for ${insight.title}.`,
        rationale: insight.explanation,
        expectedOutcome: "Anomaly cleared or downgraded to watch.",
        evidence: insight.evidence,
        confidence: insight.confidence,
        observedAt,
        traceRoot,
        relatedInsights: [insight.insightId],
      }),
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      buildOperationalRecommendation({
        recommendationId: "rec-default-monitor",
        recommendationType: "monitor",
        priority: "low",
        action: "Maintain operational monitoring with current baseline.",
        rationale: "No elevated recommendations after conservative analysis.",
        expectedOutcome: "Continued operational stability.",
        evidence: [],
        confidence: 80,
        observedAt,
        traceRoot,
        relatedInsights: [],
      }),
    );
  }

  return recommendations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}

export function summarizeOperationalRecommendations(
  recommendations: OperationalRecommendation[],
): string {
  const high = recommendations.filter((r) => r.priority === "high").length;
  return `recommendations: total=${recommendations.length} high=${high} top=${recommendations[0]?.recommendationType ?? "none"}`;
}
