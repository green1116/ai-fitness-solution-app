import type { GovernancePlatformBaselineAuditRecord } from "./baseline-types";

export function buildGovernancePlatformBaselineAuditRecords(input: {
  baselineId: string;
  deploymentId: string;
  capabilityCount: number;
  frozen: boolean;
  manifestDigest: string;
}): GovernancePlatformBaselineAuditRecord[] {
  return [
    {
      baselineId: input.baselineId,
      deploymentId: input.deploymentId,
      capabilityCount: input.capabilityCount,
      frozen: input.frozen,
      manifestDigest: input.manifestDigest,
      timestamp: new Date().toISOString(),
    },
  ];
}
