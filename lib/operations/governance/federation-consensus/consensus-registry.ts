import type { ConsensusProposalType } from "./consensus-types";

export const DEFAULT_CONSENSUS_VERSION = "consensus-v1";
export const DEFAULT_QUORUM_THRESHOLD = 0.66;

export const SUPPORTED_CONSENSUS_VERSIONS = [
  DEFAULT_CONSENSUS_VERSION,
  "consensus-v1-restricted",
  "consensus-v1-emergency",
] as const;

export function resolveConsensusQuorumThreshold(proposalType: ConsensusProposalType): number {
  switch (proposalType) {
    case "recovery":
      return 0.5;
    case "topology":
      return 0.75;
    case "policy":
      return DEFAULT_QUORUM_THRESHOLD;
    case "routing":
    default:
      return DEFAULT_QUORUM_THRESHOLD;
  }
}
