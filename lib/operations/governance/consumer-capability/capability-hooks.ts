import type {
  CapabilityDegradationPlan,
  CapabilityHookEvent,
  CapabilityNegotiationResult,
  ConsumerCapabilityProfile,
} from "./capability-types";

export function runCapabilityGovernanceHooks(input: {
  profile: ConsumerCapabilityProfile;
  negotiation: CapabilityNegotiationResult;
  degradationPlan: CapabilityDegradationPlan;
}): CapabilityHookEvent[] {
  const events: CapabilityHookEvent[] = [
    {
      phase: "beforeNegotiation",
      consumerId: input.profile.consumerId,
      payload: `tier=${input.profile.compatibilityTier}`,
    },
    {
      phase: "afterNegotiation",
      consumerId: input.profile.consumerId,
      payload: `decision=${input.negotiation.governanceDecision} score=${input.negotiation.compatibilityScore}`,
    },
  ];
  if (input.negotiation.downgradedCapabilities.length > 0) {
    events.push({
      phase: "beforeDegradation",
      consumerId: input.profile.consumerId,
      payload: `downgrades=${input.negotiation.downgradedCapabilities.join(",")}`,
    });
    events.push({
      phase: "afterDegradation",
      consumerId: input.profile.consumerId,
      payload: `finalMode=${input.degradationPlan.finalMode}`,
    });
  }
  if (
    input.negotiation.governanceDecision === "restricted" ||
    input.negotiation.governanceDecision === "deny"
  ) {
    events.push({
      phase: "beforeRestriction",
      consumerId: input.profile.consumerId,
      payload: `governance=${input.negotiation.governanceDecision}`,
    });
    events.push({
      phase: "afterRestriction",
      consumerId: input.profile.consumerId,
      payload: "consumer restricted by capability governance",
    });
  }
  return events;
}
