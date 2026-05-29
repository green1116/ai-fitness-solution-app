import type { FederationLifecyclePhase } from "./continuity-types";

export const DEFAULT_FEDERATION_LIFECYCLE_VERSION = "federation-lifecycle-v1";

export function resolveFederationLifecyclePhase(input: {
  federationStatus: string;
  consensusStatus: string;
  policyPropagationStatus: string;
  requestedPhase?: FederationLifecyclePhase;
}): FederationLifecyclePhase {
  if (input.requestedPhase) return input.requestedPhase;
  if (input.policyPropagationStatus === "rolled_back") return "recovering";
  if (input.policyPropagationStatus === "frozen") return "frozen";
  if (input.federationStatus === "isolated") return "retiring";
  if (input.federationStatus === "recovering" || input.consensusStatus === "recovering") {
    return "recovering";
  }
  if (input.federationStatus === "degraded" || input.policyPropagationStatus === "partial") {
    return "degraded";
  }
  if (input.consensusStatus === "failed") return "degraded";
  return "active";
}
