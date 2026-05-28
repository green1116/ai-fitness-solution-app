import type {
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibility,
  GovernanceIncidentRecoveryProfileCanonicalContractReport,
} from "./incident-recovery-profile-canonical-contract.types";

export function buildIncidentRecoveryProfileCanonicalContractReport(input: {
  contractVersion: string;
  compatibilities: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility[];
}): GovernanceIncidentRecoveryProfileCanonicalContractReport {
  const count = (status: string) => input.compatibilities.filter((c) => c.status === status).length;
  return {
    reportId: `incident-profile-contract-report-${Date.now()}`,
    contractVersion: input.contractVersion,
    consumerCount: input.compatibilities.length,
    compatibleCount: count("compatible"),
    warningCount: count("compatibleWithWarnings"),
    incompatibleCount: count("incompatible"),
    fallbackCompatibleCount: count("fallbackCompatible"),
    details: input.compatibilities.map(
      (c) =>
        `${c.consumerId}@${c.consumerVersion} status=${c.status} missing=${c.missingRequiredFields.join(",") || "none"} warnings=${c.warnings.join(",") || "none"}`,
    ),
  };
}
