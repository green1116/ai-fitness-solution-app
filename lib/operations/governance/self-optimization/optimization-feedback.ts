import type { GovernanceFeedbackEntry, GovernanceFeedbackLoop } from "./optimization-types";
import type { GovernanceAutonomousRuntimeResult } from "../autonomous/autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../intelligence/intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function collectGovernanceFeedbackLoop(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  intelligence: GovernanceIntelligenceRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
}): GovernanceFeedbackLoop {
  const now = new Date().toISOString();
  const entries: GovernanceFeedbackEntry[] = [
    {
      entryId: `fb-health-${input.deploymentId}`,
      source: "observability",
      metric: "healthScore",
      value: input.observability.health.healthScore,
      observedAt: now,
    },
    {
      entryId: `fb-composite-${input.deploymentId}`,
      source: "observability",
      metric: "governanceComposite",
      value: input.observability.governanceScore.compositeScore,
      observedAt: now,
    },
    {
      entryId: `fb-intel-${input.deploymentId}`,
      source: "intelligence",
      metric: "intelligenceComposite",
      value: input.intelligence.intelligenceScore.compositeScore,
      observedAt: now,
    },
    {
      entryId: `fb-autonomous-${input.deploymentId}`,
      source: "autonomous",
      metric: "autonomousComposite",
      value: input.autonomous.autonomousScore.compositeScore,
      observedAt: now,
    },
    {
      entryId: `fb-approval-${input.deploymentId}`,
      source: "autonomous",
      metric: "approvalConfidence",
      value: input.autonomous.autonomousScore.confidence,
      observedAt: now,
    },
    {
      entryId: `fb-resilience-${input.deploymentId}`,
      source: "observability",
      metric: "resilienceScore",
      value: input.observability.governanceScore.resilienceScore,
      observedAt: now,
    },
    {
      entryId: `fb-continuity-${input.deploymentId}`,
      source: "observability",
      metric: "continuityScore",
      value: input.observability.governanceScore.continuityScore,
      observedAt: now,
    },
    {
      entryId: `fb-anomaly-${input.deploymentId}`,
      source: "intelligence",
      metric: "anomalyCount",
      value: input.intelligence.anomalies.length,
      observedAt: now,
    },
  ];

  const cycleComplete =
    entries.length >= 6 &&
    input.observability.health.healthScore > 0 &&
    input.autonomous.proposals.length > 0;

  return {
    loopId: `governance-feedback-loop-${input.deploymentId}`,
    federationId: input.observability.health.federationId,
    entries,
    cycleComplete,
  };
}
