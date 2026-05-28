import type {
  GovernanceActionCandidate,
  OperationalGovernanceRuntimeInput,
} from "./types";

export function adaptGovernanceCandidates(
  input: OperationalGovernanceRuntimeInput,
): GovernanceActionCandidate[] {
  const intelligence = input.intelligence;
  if (!intelligence) return [];

  const recCandidates: GovernanceActionCandidate[] = intelligence.recommendations.map((rec) => ({
    candidateId: `cand-rec-${rec.recommendationId}`,
    kind: "recommendation",
    refId: rec.recommendationId,
    priority: rec.priority,
    confidence: rec.confidence,
    title: rec.action,
    evidence: rec.evidence,
  }));

  const anomalyCandidates: GovernanceActionCandidate[] = intelligence.anomalies
    .filter((a) => a.detected)
    .map((a) => ({
      candidateId: `cand-anomaly-${a.anomalyId}`,
      kind: "anomaly",
      refId: a.anomalyId,
      priority: a.severity === "high" ? "critical" : a.severity,
      confidence: a.confidence,
      title: a.explanation,
      evidence: a.evidence,
    }));

  const bottleneckCandidates: GovernanceActionCandidate[] = intelligence.bottlenecks.map((b) => ({
    candidateId: `cand-bn-${b.bottleneckId}`,
    kind: "bottleneck",
    refId: b.bottleneckId,
    priority: b.severity,
    confidence: b.confidence,
    title: b.explanation,
    evidence: b.evidence,
  }));

  const decision = intelligence.decisionSupport;
  const decisionCandidates: GovernanceActionCandidate[] = decision
    ? [
        {
          candidateId: `cand-decision-${decision.decisionSupportId}`,
          kind: "decision",
          refId: decision.decisionSupportId,
          priority:
            decision.status === "escalate"
              ? "critical"
              : decision.status === "mitigate" || decision.status === "hold"
                ? "high"
                : decision.status === "investigate" || decision.status === "monitor"
                  ? "medium"
                  : "low",
          confidence: decision.confidence,
          title: decision.recommendedAction,
          evidence: decision.evidence,
        },
      ]
    : [];

  const summaryCandidates: GovernanceActionCandidate[] = [
    {
      candidateId: `cand-summary-${intelligence.summary.summaryId}`,
      kind: "summary",
      refId: intelligence.summary.summaryId,
      priority:
        intelligence.summary.decisionStatus === "escalate" || intelligence.summary.healthStatus === "critical"
          ? "critical"
          : intelligence.summary.healthStatus === "degraded" || intelligence.summary.decisionStatus === "investigate"
            ? "high"
            : intelligence.summary.healthStatus === "watch"
              ? "medium"
              : "low",
      confidence: intelligence.summary.intelligenceScore,
      title: intelligence.summary.summary,
      evidence: [intelligence.summary.summary],
    },
  ];

  return [
    ...recCandidates,
    ...anomalyCandidates,
    ...bottleneckCandidates,
    ...decisionCandidates,
    ...summaryCandidates,
  ];
}
