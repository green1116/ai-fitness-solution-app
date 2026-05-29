import type { FederationRuntimeResult } from "../federation/federation-types";

export const GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION =
  "v4-a3-r9.4-federation-consensus-runtime-1" as const;
export type GovernanceFederationConsensusRuntimeVersion =
  typeof GOVERNANCE_FEDERATION_CONSENSUS_RUNTIME_VERSION;

export type FederationConsensusNodeRole = "leader" | "validator" | "observer" | "recovery";
export type FederationConsensusNodeHealth = "healthy" | "degraded" | "isolated";
export type FederationConsensusTrustLevel = "trusted" | "verified" | "restricted";
export type ConsensusProposalType = "policy" | "routing" | "topology" | "recovery";
export type ConsensusVoteChoice = "approve" | "reject" | "abstain";
export type ConsensusDecision =
  | "approved"
  | "approved_with_restrictions"
  | "rejected"
  | "recovery_required";
export type ConsensusRuntimeStatus = "converged" | "partial" | "recovering" | "failed";

export type FederationConsensusNode = {
  nodeId: string;
  domainId: string;
  nodeRole: FederationConsensusNodeRole;
  votingPower: number;
  healthStatus: FederationConsensusNodeHealth;
  supportedPolicies: string[];
  supportedConsensusVersions: string[];
  trustLevel: FederationConsensusTrustLevel;
  lastConsensusAt: string;
};

export type ConsensusProposal = {
  proposalId: string;
  federationId: string;
  proposalType: ConsensusProposalType;
  payload: string;
  requiredQuorum: number;
  distributedAt: string;
};

export type ConsensusVote = {
  nodeId: string;
  proposalId: string;
  vote: ConsensusVoteChoice;
  weight: number;
  validated: boolean;
  timestamp: string;
};

export type ConsensusQuorumResult = {
  proposalId: string;
  participatingNodes: string[];
  quorumReached: boolean;
  approvalRate: number;
  rejectedNodes: string[];
  degradedNodes: string[];
  consensusDecision: ConsensusDecision;
};

export type ConsensusResolution = {
  resolutionId: string;
  proposalId: string;
  decision: ConsensusDecision;
  converged: boolean;
  restrictedNodes: string[];
  detail: string;
};

export type ConsensusReconciliationResult = {
  reconciliationId: string;
  stateReconciled: boolean;
  policyReconciled: boolean;
  topologyReconciled: boolean;
  recoveryReconciled: boolean;
  convergenceScore: number;
  detail: string;
};

export type ConsensusStateConvergence = {
  convergenceId: string;
  federationId: string;
  priorState: string;
  targetState: string;
  converged: boolean;
  partialAgreement: boolean;
};

export type ConsensusRecoveryCoordination = {
  recoveryId: string;
  trigger: string;
  fallbackConsensus: boolean;
  emergencyMode: boolean;
  degradedQuorum: boolean;
  stabilizationAction: string;
};

export type ConsensusLineageEntry = {
  entryId: string;
  event: "voting" | "quorum" | "reconciliation" | "convergence" | "recovery";
  detail: string;
  timestamp: string;
};

export type ConsensusLineageGraph = {
  graphId: string;
  entries: ConsensusLineageEntry[];
};

export type ConsensusAuditRecord = {
  proposalId: string;
  federationId: string;
  participatingNodes: string[];
  decision: string;
  quorumReached: boolean;
  reconciliationApplied: boolean;
  timestamp: string;
};

export type ConsensusHookPhase =
  | "beforeConsensusVote"
  | "afterConsensusVote"
  | "beforeReconciliation"
  | "afterReconciliation"
  | "beforeConsensusRecovery"
  | "afterConsensusRecovery";

export type ConsensusHookEvent = {
  phase: ConsensusHookPhase;
  nodeId: string;
  payload: string;
};

export type ConsensusRuntimeInput = {
  deploymentId: string;
  federation: FederationRuntimeResult;
  proposalType?: ConsensusProposalType;
};

export type ConsensusRuntimeResult = {
  version: GovernanceFederationConsensusRuntimeVersion;
  registry: { consensusId: string; nodeCount: number; proposalCount: number };
  nodes: FederationConsensusNode[];
  proposal: ConsensusProposal;
  votes: ConsensusVote[];
  quorum: ConsensusQuorumResult;
  resolution: ConsensusResolution;
  reconciliation: ConsensusReconciliationResult;
  convergence: ConsensusStateConvergence;
  recovery: ConsensusRecoveryCoordination;
  lineage: ConsensusLineageGraph;
  audit: ConsensusAuditRecord[];
  hooks: ConsensusHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: ConsensusRuntimeStatus;
};
