import type {
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibility,
  GovernanceIncidentRecoveryProfileCanonicalContractMatrix,
} from "./incident-recovery-profile-canonical-contract.types";

export function buildIncidentRecoveryProfileCanonicalContractMatrix(input: {
  deploymentId: string;
  compatibilities: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility[];
}): GovernanceIncidentRecoveryProfileCanonicalContractMatrix {
  return {
    matrixId: `incident-profile-contract-matrix-${input.deploymentId}`,
    entries: input.compatibilities,
  };
}
