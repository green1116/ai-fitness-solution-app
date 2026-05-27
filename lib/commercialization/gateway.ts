/**
 * V3.5 commercial gateway foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialGovernanceFoundationResult } from "./governance";
import type { CommercialPackagingTier, PackagingFoundationResult } from "./packaging";

export const COMMERCIAL_GATEWAY_FOUNDATION_VERSION = "3.5-gateway-1" as const;

export type CommercialGatewayFoundationInput = {
  deploymentId: string;
  tier?: CommercialPackagingTier;
  governance?: CommercialGovernanceFoundationResult;
  packaging?: PackagingFoundationResult;
};

export type CommercialGatewayFoundationResult = {
  version: typeof COMMERCIAL_GATEWAY_FOUNDATION_VERSION;
  deploymentId: string;
  tier: CommercialPackagingTier;
  gatewayReady: boolean;
  summary: string;
};

/** Minimal gateway compat: expose packaged commercial surface entry. */
export function runCommercialGatewayFoundation(
  input: CommercialGatewayFoundationInput,
): CommercialGatewayFoundationResult {
  const tier = input.tier ?? "enterprise";

  const summary = [
    `gateway=${COMMERCIAL_GATEWAY_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `tier=${tier}`,
    `gateway-ready=true`,
    input.packaging?.summary ? `packaging=${input.packaging.summary}` : null,
    input.governance?.summary ? `governance=${input.governance.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_GATEWAY_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    tier,
    gatewayReady: true,
    summary,
  };
}

export function formatGatewayRuntimeHook(
  result: CommercialGatewayFoundationResult,
): string {
  return result.summary;
}
