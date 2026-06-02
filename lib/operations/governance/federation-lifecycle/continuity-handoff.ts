import type { FederationContinuityHandoff } from "./continuity-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

export function coordinateFederationContinuityHandoff(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  activationMode: string;
  stabilizationPending: boolean;
}): FederationContinuityHandoff {
  const sourceDomainId = input.federation.policy.sourceDomainId;
  const targetDomainId =
    input.federation.routing.targetDomainId ||
    input.federation.orchestration.coordinatedDomains[0] ||
    sourceDomainId;

  let handoffReason = "steady-state";
  if (input.stabilizationPending) handoffReason = "recovery-handoff";
  else if (input.federation.routing.status === "degraded" || input.federation.routing.status === "failed") {
    handoffReason = "routing-handoff";
  } else if (input.activationMode === "partial") {
    handoffReason = "partial-activation-handoff";
  }

  const continuityPreserved =
    sourceDomainId !== targetDomainId &&
    (input.federation.recovery.sharedRecovery || input.activationMode !== "restricted");

  return {
    handoffId: `federation-handoff-${input.deploymentId}`,
    sourceDomainId,
    targetDomainId,
    handoffReason,
    continuityPreserved,
  };
}
