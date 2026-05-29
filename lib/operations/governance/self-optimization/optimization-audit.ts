import type { GovernanceSelfOptimizationAuditRecord, GovernanceSelfOptimizationScore } from "./optimization-types";

export function buildGovernanceSelfOptimizationAuditRecords(input: {
  optimizationId: string;
  federationId: string;
  mechanismCount: number;
  strategyCount: number;
  optimizationScore: GovernanceSelfOptimizationScore;
}): GovernanceSelfOptimizationAuditRecord[] {
  const now = new Date().toISOString();
  return [
    {
      optimizationId: input.optimizationId,
      federationId: input.federationId,
      mechanismCount: input.mechanismCount,
      strategyCount: input.strategyCount,
      compositeScore: input.optimizationScore.compositeScore,
      timestamp: now,
    },
  ];
}
