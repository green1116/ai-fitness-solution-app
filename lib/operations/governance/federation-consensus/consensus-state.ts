import type {
  ConsensusReconciliationResult,
  ConsensusResolution,
  ConsensusStateConvergence,
} from "./consensus-types";
import type { FederationRuntimeResult } from "../federation/federation-types";

export function convergeConsensusState(input: {
  deploymentId: string;
  federation: FederationRuntimeResult;
  resolution: ConsensusResolution;
  reconciliation: ConsensusReconciliationResult;
}): ConsensusStateConvergence {
  const federationId = input.federation.registry.federationId;
  const priorState = input.federation.status;
  let targetState = "stable";
  if (input.resolution.decision === "approved_with_restrictions") targetState = "restricted-stable";
  else if (input.resolution.decision === "recovery_required") targetState = "recovering";
  else if (input.resolution.decision === "rejected") targetState = "failed";

  const converged =
    input.resolution.converged && input.reconciliation.convergenceScore >= 0.75;
  const partialAgreement =
    !converged &&
    (input.resolution.decision === "approved_with_restrictions" ||
      input.reconciliation.convergenceScore >= 0.5);

  return {
    convergenceId: `consensus-convergence-${input.deploymentId}`,
    federationId,
    priorState,
    targetState,
    converged,
    partialAgreement,
  };
}
