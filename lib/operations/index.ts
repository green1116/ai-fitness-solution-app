/**
 * V4-A1 Production Operations Runtime — unified foundation
 */

export * from "./shared";
export * from "./operations-context";
export * from "./registry";
export * from "./stability";
export * from "./intelligence";
export * from "./sustainability";

import { V4_OPERATIONS_VERSION } from "./shared";
import { buildProductionOperationsRegistry } from "./registry";
import { buildOperationalStabilityReport } from "./stability";
import { buildOperationalIntelligenceSummary } from "./intelligence";
import { buildOperationalSustainabilityReport } from "./sustainability";

export const V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION = V4_OPERATIONS_VERSION;

export type V4ProductionOperationsFoundation = {
  version: typeof V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION;
  foundationId: string;
  registry: ReturnType<typeof buildProductionOperationsRegistry>;
  stability: ReturnType<typeof buildOperationalStabilityReport>;
  intelligence: ReturnType<typeof buildOperationalIntelligenceSummary>;
  sustainability: ReturnType<typeof buildOperationalSustainabilityReport>;
  operationallyReady: boolean;
  foundationSummary: string;
};

export function buildV4ProductionOperationsFoundation(input?: {
  deploymentId?: string;
}): V4ProductionOperationsFoundation {
  const deploymentId = input?.deploymentId ?? "v4-production-operations";
  const foundationId = `V4POF-${deploymentId.slice(0, 8)}`;
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const stability = buildOperationalStabilityReport({ deploymentId });
  const intelligence = buildOperationalIntelligenceSummary({ deploymentId });
  const sustainability = buildOperationalSustainabilityReport({ deploymentId });

  const operationallyReady =
    intelligence.operationalReadiness &&
    sustainability.sustainable &&
    stability.stabilityIndex >= 80;

  return {
    version: V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION,
    foundationId,
    registry,
    stability,
    intelligence,
    sustainability,
    operationallyReady,
    foundationSummary: `v4-production-operations id=${foundationId} records=${registry.records.length} stability=${stability.stabilityIndex} confidence=${intelligence.confidenceScore} sustainable=${sustainability.sustainable} operationallyReady=${operationallyReady}`,
  };
}
