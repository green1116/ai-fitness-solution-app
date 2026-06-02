import type {
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibility,
  GovernanceIncidentRecoveryProfileCanonicalContractTrace,
} from "./incident-recovery-profile-canonical-contract.types";

export function buildIncidentRecoveryProfileCanonicalContractTrace(input: {
  deploymentId: string;
  contractId: string;
  compatibilities: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility[];
}): GovernanceIncidentRecoveryProfileCanonicalContractTrace {
  return {
    traceId: `incident-profile-contract-trace-${input.deploymentId}`,
    loading: [`contract=${input.contractId}`, `consumers=${input.compatibilities.length}`],
    validation: input.compatibilities.map(
      (c) => `${c.consumerId}:missing=${c.missingRequiredFields.join(",") || "none"}`,
    ),
    compatibility: input.compatibilities.map(
      (c) => `${c.consumerId}:${c.consumerVersion}:${c.status}`,
    ),
    fallback: input.compatibilities
      .filter((c) => c.status === "fallbackCompatible")
      .map((c) => `${c.consumerId}:${c.fallbackReason ?? "fallback"}`),
  };
}
