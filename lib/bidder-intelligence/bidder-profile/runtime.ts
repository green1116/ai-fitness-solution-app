import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BidderIntelligenceRuntimeResult, BidderIntelligenceStageResult } from "../shared/types";
import { BIDDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBidderProfileSnapshot } from "./builders";
import type { BidderProfileRuntimePayload } from "./types";
import { BIDDER_PROFILE_RUNTIME_VERSION } from "./types";

export function validateBidderProfileRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildBidderProfileSnapshot(input);
  return {
    valid:
      snapshot.profileReadiness > 0 &&
      snapshot.certifications.length >= 2 &&
      snapshot.deliveryCapabilities.length >= 2,
  };
}

export function runBidderProfileRuntime(input?: {
  deploymentId?: string;
}): BidderIntelligenceRuntimeResult<BidderProfileRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "bidder-profile-default";
  const stages: BidderIntelligenceStageResult[] = [];

  const snapshot = runStage("bidder-profile-build", "Bidder Profile", () => buildBidderProfileSnapshot({ deploymentId }), stages);
  const validation = runStage("bidder-profile-validate", "Profile Validation", () => validateBidderProfileRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Bidder profile validation failed");

  const payload: BidderProfileRuntimePayload = {
    version: BIDDER_PROFILE_RUNTIME_VERSION,
    bidderIntelligenceVersion: BIDDER_INTELLIGENCE_VERSION,
    snapshot,
    profileReadiness: snapshot.profileReadiness,
    summary: `bidder-profile company=${snapshot.profile.displayName} scale=${snapshot.scale} readiness=${snapshot.profileReadiness}% certs=${snapshot.certifications.length}`,
  };

  return finalizeRuntime({ domain: "bidder-profile", deploymentId, stages, payload, summary: payload.summary });
}
