import type { ConsumerCapabilityNegotiationRuntimeResult } from "../consumer-capability/capability-types";
import type { GovernanceOrchestrationRuntimeResult } from "../orchestration.types";

export const GOVERNANCE_FEDERATION_RUNTIME_VERSION =
  "v4-a3-r9.3-federation-runtime-1" as const;
export type GovernanceFederationRuntimeVersion = typeof GOVERNANCE_FEDERATION_RUNTIME_VERSION;

export type FederationDomainType = "core" | "regional" | "edge" | "consumer" | "partner";
export type FederationGovernanceLevel = "full" | "restricted" | "isolated";
export type FederationRecoveryMode = "local" | "shared" | "federated";
export type FederationTrustLevel = "trusted" | "verified" | "restricted";
export type FederationRoutingStatus = "routed" | "degraded" | "isolated" | "failed";
export type FederationRuntimeStatus = "stable" | "degraded" | "recovering" | "isolated";

export type FederationDomain = {
  domainId: string;
  domainType: FederationDomainType;
  activeNodes: string[];
  supportedPolicies: string[];
  governanceLevel: FederationGovernanceLevel;
  federationProtocols: string[];
  recoveryMode: FederationRecoveryMode;
  trustLevel: FederationTrustLevel;
  lastHealthCheckAt: string;
};

export type FederationNode = {
  nodeId: string;
  domainId: string;
  runtimeId: string;
  status: "healthy" | "degraded" | "failed";
  capabilities: string[];
};

export type FederationTopologyEdge = {
  from: string;
  to: string;
  relation: "routes-to" | "propagates-to" | "recovers-with";
};

export type FederationTopology = {
  topologyId: string;
  domains: FederationDomain[];
  nodes: FederationNode[];
  edges: FederationTopologyEdge[];
};

export type FederationRoutingDecision = {
  routingId: string;
  sourceDomainId: string;
  targetDomainId: string;
  routePath: string[];
  policyValidated: boolean;
  isolationApplied: boolean;
  degradedRoute: boolean;
  status: FederationRoutingStatus;
};

export type FederationOrchestrationPlan = {
  planId: string;
  coordinatedDomains: string[];
  steps: string[];
  crossRuntime: boolean;
};

export type FederationPolicyPropagation = {
  propagationId: string;
  sourceDomainId: string;
  targetDomainIds: string[];
  propagatedPolicies: string[];
  accepted: string[];
  rejected: string[];
};

export type FederationRecoveryCoordination = {
  coordinationId: string;
  trigger: string;
  affectedDomains: string[];
  rerouteApplied: boolean;
  sharedRecovery: boolean;
  stabilizationAction: string;
};

export type FederationLineageEntry = {
  entryId: string;
  event: "topology" | "routing" | "policy" | "recovery";
  detail: string;
  timestamp: string;
};

export type FederationLineageGraph = {
  graphId: string;
  entries: FederationLineageEntry[];
};

export type FederationAuditRecord = {
  federationId: string;
  domainId: string;
  action: string;
  routingDecision: string;
  governanceDecision: string;
  recoveryAction?: string;
  timestamp: string;
};

export type FederationHookPhase =
  | "beforeFederationRouting"
  | "afterFederationRouting"
  | "beforePolicyPropagation"
  | "afterPolicyPropagation"
  | "beforeFederationRecovery"
  | "afterFederationRecovery";

export type FederationHookEvent = {
  phase: FederationHookPhase;
  domainId: string;
  payload: string;
};

export type FederationRuntimeInput = {
  deploymentId: string;
  orchestration: GovernanceOrchestrationRuntimeResult;
  capabilityNegotiation: ConsumerCapabilityNegotiationRuntimeResult;
  policyPackMode: string;
  requestedDomainId?: string;
};

export type FederationRuntimeResult = {
  version: GovernanceFederationRuntimeVersion;
  registry: { federationId: string; domainCount: number; nodeCount: number };
  topology: FederationTopology;
  routing: FederationRoutingDecision;
  orchestration: FederationOrchestrationPlan;
  policy: FederationPolicyPropagation;
  recovery: FederationRecoveryCoordination;
  lineage: FederationLineageGraph;
  audit: FederationAuditRecord[];
  hooks: FederationHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: FederationRuntimeStatus;
};
