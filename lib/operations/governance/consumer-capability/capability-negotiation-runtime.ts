import {
  GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION,
  type ConsumerCapabilityNegotiationInput,
  type ConsumerCapabilityNegotiationRuntimeResult,
  type ConsumerCapabilityNegotiationStatus,
} from "./capability-types";
import { buildConsumerCapabilityProfile } from "./capability-profile";
import { negotiateConsumerCapabilities } from "./capability-negotiation";
import { resolveConsumerCapabilitySet } from "./capability-resolution";
import { buildCapabilityDegradationPlan } from "./capability-degradation";
import { evaluateCapabilityVersionGovernance } from "./capability-versioning";
import { buildCapabilityLineageGraph } from "./capability-lineage";
import { buildCapabilityAuditRecords } from "./capability-audit";
import { runCapabilityGovernanceHooks } from "./capability-hooks";

export function buildConsumerCapabilityNegotiationRuntime(
  input: ConsumerCapabilityNegotiationInput,
): ConsumerCapabilityNegotiationRuntimeResult {
  const canonicalVersion = input.canonicalContract.snapshot.canonicalVersion;
  const profile = buildConsumerCapabilityProfile(input.resolvedConsumer, canonicalVersion);
  const canonicalCompatible =
    input.canonicalContract.status === "compatible" ||
    input.canonicalContract.status === "compatibleWithWarnings" ||
    input.canonicalContract.status === "fallbackCompatible";

  const negotiation = negotiateConsumerCapabilities({
    deploymentId: input.deploymentId,
    profile,
    requestedCapabilities: input.requestedCapabilities ?? [],
    canonicalCompatible,
  });

  const resolution = resolveConsumerCapabilitySet({
    profile,
    negotiationAccepted: negotiation.acceptedCapabilities,
  });
  negotiation.auditTrail.push(...resolution.dependencies.map((d) => `dependency:${d}`));
  if (resolution.conflicts.length > 0) {
    negotiation.auditTrail.push(...resolution.conflicts.map((c) => `conflict:${c}`));
    if (negotiation.governanceDecision === "allow") {
      negotiation.governanceDecision = "restricted";
    }
  }

  const degradationPlan = buildCapabilityDegradationPlan({ profile, negotiation });
  const versionGov = evaluateCapabilityVersionGovernance({ profile, canonicalVersion });
  const lineage = buildCapabilityLineageGraph({
    deploymentId: input.deploymentId,
    negotiation,
    degradationPlan,
    versionConflicts: versionGov.conflicts,
  });
  const audit = buildCapabilityAuditRecords(negotiation);
  const hooks = runCapabilityGovernanceHooks({ profile, negotiation, degradationPlan });

  const status: ConsumerCapabilityNegotiationStatus =
    negotiation.governanceDecision === "deny"
      ? "denied"
      : negotiation.governanceDecision === "restricted"
        ? "restricted"
        : negotiation.governanceDecision === "allow_with_degradation"
          ? "degraded"
          : "negotiated";

  const traceId = `capability-negotiation-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION,
    profile,
    negotiation,
    resolvedCapabilities: resolution.resolved,
    degradationPlan,
    versionMatrix: versionGov.matrix,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `capability-negotiation-summary-${Date.now()}`,
      text: `consumer=${profile.consumerId} tier=${profile.compatibilityTier} decision=${negotiation.governanceDecision} score=${negotiation.compatibilityScore} degraded=${negotiation.downgradedCapabilities.length} finalMode=${degradationPlan.finalMode}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_CONSUMER_CAPABILITY_NEGOTIATION_VERSION };
