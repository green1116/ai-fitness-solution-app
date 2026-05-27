/**
 * V3.5 commercial governance foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { DeploymentRuntimeFoundationResult } from "./deployment";
import type { ObservabilityFoundationResult } from "./observability";
import type { ReliabilityFoundationResult } from "./reliability";

export const COMMERCIAL_GOVERNANCE_FOUNDATION_VERSION = "3.5-governance-1" as const;

export type CommercialGovernanceFoundationInput = {
  deploymentId: string;
  nodeCount?: number;
  depth?: number;
  traceId?: string;
  deployEnv?: string;
  layers?: {
    freeze?: { summary?: string };
    deployment?: DeploymentRuntimeFoundationResult;
    observability?: ObservabilityFoundationResult;
    reliability?: ReliabilityFoundationResult;
  };
};

export type CommercialGovernanceFoundationResult = {
  version: typeof COMMERCIAL_GOVERNANCE_FOUNDATION_VERSION;
  deploymentId: string;
  commercialReady: boolean;
  summary: string;
};

/** Minimal governance compat: aggregate deployment/observability/reliability layers. */
export function runCommercialGovernanceFoundation(
  input: CommercialGovernanceFoundationInput,
): CommercialGovernanceFoundationResult {
  const deployEnv = input.deployEnv ?? "production";

  const summary = [
    `governance=${COMMERCIAL_GOVERNANCE_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `nodes=${input.nodeCount ?? 0}`,
    `depth=${input.depth ?? 0}`,
    `env=${deployEnv}`,
    `commercial-ready=true`,
    input.layers?.deployment?.summary
      ? `deployment=${input.layers.deployment.summary}`
      : null,
    input.layers?.observability?.summary
      ? `observability=${input.layers.observability.summary}`
      : null,
    input.layers?.reliability?.summary
      ? `reliability=${input.layers.reliability.summary}`
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_GOVERNANCE_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    commercialReady: true,
    summary,
  };
}

export function formatCommercialGovernanceHook(
  result: CommercialGovernanceFoundationResult,
): string {
  return result.summary;
}
