import type { GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer } from "../incident-recovery-profile-external-consumer-registry.types";
import type { GovernanceIncidentRecoveryProfileCanonicalContractResult } from "../incident-recovery-profile-canonical-contract.types";

export const GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION =
  "v4-a3-r9.2-consumer-capability-negotiation-1" as const;
export type GovernanceConsumerCapabilityNegotiationVersion =
  typeof GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION;

export type ConsumerCapabilityDegradationLevel = "none" | "partial" | "restricted";
export type ConsumerCompatibilityTier = "native" | "compatible" | "legacy" | "restricted";
export type CapabilityGovernanceDecision = "allow" | "allow_with_degradation" | "restricted" | "deny";
export type ConsumerCapabilityNegotiationStatus = "negotiated" | "degraded" | "restricted" | "denied";

export type ConsumerCapabilityProfile = {
  consumerId: string;
  supportedSchemas: string[];
  supportedFeatures: string[];
  supportedPolicies: string[];
  renderingModes: string[];
  transportProtocols: string[];
  negotiationVersion: string;
  fallbackModes: string[];
  degradationLevel: ConsumerCapabilityDegradationLevel;
  compatibilityTier: ConsumerCompatibilityTier;
  lastValidatedAt: string;
};

export type CapabilityNegotiationResult = {
  negotiationId: string;
  consumerId: string;
  requestedCapabilities: string[];
  acceptedCapabilities: string[];
  rejectedCapabilities: string[];
  downgradedCapabilities: string[];
  fallbackStrategies: string[];
  compatibilityScore: number;
  governanceDecision: CapabilityGovernanceDecision;
  auditTrail: string[];
};

export type CapabilityVersionMatrixEntry = {
  capability: string;
  supportedVersions: string[];
  deprecatedVersions: string[];
  minimumSupportedVersion: string;
  migrationAvailable: boolean;
};

export type CapabilityDegradationStep = {
  level: number;
  mode: string;
  reason: string;
};

export type CapabilityDegradationPlan = {
  planId: string;
  consumerId: string;
  steps: CapabilityDegradationStep[];
  finalMode: string;
};

export type CapabilityLineageEntry = {
  entryId: string;
  consumerId: string;
  event: "negotiation" | "degradation" | "version_check" | "restriction";
  detail: string;
  timestamp: string;
};

export type CapabilityLineageGraph = {
  graphId: string;
  entries: CapabilityLineageEntry[];
};

export type CapabilityAuditRecord = {
  negotiationId: string;
  consumerId: string;
  decision: string;
  reason: string;
  compatibilityScore: number;
  degradedCapabilities: string[];
  timestamp: string;
};

export type CapabilityHookPhase =
  | "beforeNegotiation"
  | "afterNegotiation"
  | "beforeDegradation"
  | "afterDegradation"
  | "beforeRestriction"
  | "afterRestriction";

export type CapabilityHookEvent = {
  phase: CapabilityHookPhase;
  consumerId: string;
  payload: string;
};

export type ConsumerCapabilityNegotiationInput = {
  deploymentId: string;
  resolvedConsumer: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer;
  canonicalContract: GovernanceIncidentRecoveryProfileCanonicalContractResult;
  requestedCapabilities?: string[];
};

export type ConsumerCapabilityNegotiationRuntimeResult = {
  version: GovernanceConsumerCapabilityNegotiationVersion;
  profile: ConsumerCapabilityProfile;
  negotiation: CapabilityNegotiationResult;
  resolvedCapabilities: string[];
  degradationPlan: CapabilityDegradationPlan;
  versionMatrix: CapabilityVersionMatrixEntry[];
  lineage: CapabilityLineageGraph;
  audit: CapabilityAuditRecord[];
  hooks: CapabilityHookEvent[];
  summary: { summaryId: string; text: string; traceId: string };
  status: ConsumerCapabilityNegotiationStatus;
};
