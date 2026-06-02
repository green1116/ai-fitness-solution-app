import type { CommandPlatformBaselineAuditRecord } from "./baseline-types";

export function buildCommandPlatformBaselineAuditRecords(input: {
  baselineId: string;
  deploymentId: string;
  capabilityCount: number;
  frozen: boolean;
  manifestDigest: string;
}): CommandPlatformBaselineAuditRecord[] {
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
