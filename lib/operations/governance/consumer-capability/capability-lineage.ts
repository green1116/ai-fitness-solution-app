import type {
  CapabilityDegradationPlan,
  CapabilityLineageGraph,
  CapabilityNegotiationResult,
} from "./capability-types";

export function buildCapabilityLineageGraph(input: {
  deploymentId: string;
  negotiation: CapabilityNegotiationResult;
  degradationPlan: CapabilityDegradationPlan;
  versionConflicts: string[];
}): CapabilityLineageGraph {
  const now = new Date().toISOString();
  const entries: CapabilityLineageGraph["entries"] = [
    {
      entryId: `lineage-neg-${input.negotiation.negotiationId}`,
      consumerId: input.negotiation.consumerId,
      event: "negotiation",
      detail: `decision=${input.negotiation.governanceDecision} score=${input.negotiation.compatibilityScore}`,
      timestamp: now,
    },
  ];
  for (const step of input.degradationPlan.steps) {
    entries.push({
      entryId: `lineage-deg-${input.degradationPlan.planId}-${step.level}`,
      consumerId: input.negotiation.consumerId,
      event: "degradation",
      detail: `mode=${step.mode} reason=${step.reason}`,
      timestamp: now,
    });
  }
  for (const conflict of input.versionConflicts) {
    entries.push({
      entryId: `lineage-ver-${input.deploymentId}-${entries.length}`,
      consumerId: input.negotiation.consumerId,
      event: "version_check",
      detail: conflict,
      timestamp: now,
    });
  }
  if (input.negotiation.governanceDecision === "restricted" || input.negotiation.governanceDecision === "deny") {
    entries.push({
      entryId: `lineage-rest-${input.deploymentId}`,
      consumerId: input.negotiation.consumerId,
      event: "restriction",
      detail: `governance=${input.negotiation.governanceDecision}`,
      timestamp: now,
    });
  }
  return {
    graphId: `capability-lineage-${input.deploymentId}`,
    entries,
  };
}
