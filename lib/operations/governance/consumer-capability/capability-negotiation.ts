import { RUNTIME_REQUIRED_CAPABILITIES } from "./capability-registry";
import type {
  CapabilityGovernanceDecision,
  CapabilityNegotiationResult,
  ConsumerCapabilityProfile,
} from "./capability-types";

export function negotiateConsumerCapabilities(input: {
  deploymentId: string;
  profile: ConsumerCapabilityProfile;
  requestedCapabilities: string[];
  canonicalCompatible: boolean;
}): CapabilityNegotiationResult {
  const requested = input.requestedCapabilities.length > 0
    ? input.requestedCapabilities
    : [...RUNTIME_REQUIRED_CAPABILITIES];
  const accepted: string[] = [];
  const rejected: string[] = [];
  const downgraded: string[] = [];
  const fallbackStrategies: string[] = [];
  const auditTrail: string[] = [];

  for (const cap of requested) {
    if (input.profile.supportedFeatures.includes(cap)) {
      accepted.push(cap);
      auditTrail.push(`accepted:${cap}`);
    } else if (
      cap === "full-rendering" &&
      input.profile.supportedFeatures.includes("partial-rendering")
    ) {
      downgraded.push(cap);
      accepted.push("partial-rendering");
      fallbackStrategies.push("full-to-partial-rendering");
      auditTrail.push(`downgraded:${cap}->partial-rendering`);
    } else if (
      cap === "schema-v2" &&
      input.profile.supportedFeatures.includes("schema-v1")
    ) {
      downgraded.push(cap);
      accepted.push("schema-v1");
      fallbackStrategies.push("schema-v2-to-v1");
      auditTrail.push(`downgraded:${cap}->schema-v1`);
    } else {
      rejected.push(cap);
      auditTrail.push(`rejected:${cap}`);
    }
  }

  const scoreBase = requested.length > 0 ? (accepted.length / requested.length) * 100 : 100;
  const penalty = rejected.length * 15 + downgraded.length * 5;
  const compatibilityScore = Math.max(0, Math.min(100, Math.round(scoreBase - penalty)));

  let governanceDecision: CapabilityGovernanceDecision = "allow";
  if (!input.canonicalCompatible || rejected.length >= 3) {
    governanceDecision = "deny";
  } else if (downgraded.length > 0 || input.profile.degradationLevel === "partial") {
    governanceDecision = "allow_with_degradation";
  } else if (input.profile.degradationLevel === "restricted" || rejected.length > 0) {
    governanceDecision = "restricted";
  }

  return {
    negotiationId: `cap-neg-${input.deploymentId}-${input.profile.consumerId}`,
    consumerId: input.profile.consumerId,
    requestedCapabilities: requested,
    acceptedCapabilities: accepted,
    rejectedCapabilities: rejected,
    downgradedCapabilities: downgraded,
    fallbackStrategies,
    compatibilityScore,
    governanceDecision,
    auditTrail,
  };
}
