import type {
  CapabilityDegradationPlan,
  CapabilityNegotiationResult,
  ConsumerCapabilityProfile,
} from "./capability-types";

const DEGRADATION_LADDER = [
  "full rendering",
  "partial rendering",
  "fallback rendering",
  "minimal transport",
  "safe restricted mode",
] as const;

export function buildCapabilityDegradationPlan(input: {
  profile: ConsumerCapabilityProfile;
  negotiation: CapabilityNegotiationResult;
}): CapabilityDegradationPlan {
  const steps: CapabilityDegradationPlan["steps"] = [];
  let startIndex = 0;
  if (input.profile.compatibilityTier === "native") startIndex = 0;
  else if (input.profile.compatibilityTier === "compatible") startIndex = 1;
  else if (input.profile.compatibilityTier === "legacy") startIndex = 2;
  else startIndex = 4;

  if (input.negotiation.downgradedCapabilities.length > 0) startIndex = Math.max(startIndex, 1);
  if (input.negotiation.governanceDecision === "restricted") startIndex = 4;
  if (input.negotiation.governanceDecision === "deny") startIndex = 4;

  for (let i = startIndex; i < DEGRADATION_LADDER.length; i++) {
    steps.push({
      level: i + 1,
      mode: DEGRADATION_LADDER[i],
      reason:
        i === startIndex
          ? `Initial degradation tier for ${input.profile.compatibilityTier}`
          : `Cascade degradation step ${i + 1}`,
    });
  }

  return {
    planId: `cap-deg-${input.profile.consumerId}`,
    consumerId: input.profile.consumerId,
    steps,
    finalMode: steps[steps.length - 1]?.mode ?? "safe restricted mode",
  };
}
