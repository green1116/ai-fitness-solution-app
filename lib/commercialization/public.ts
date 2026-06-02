/**
 * V3.6 commercial public surface foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialFinalizationFoundationResult } from "./finalization";
import type { CommercialGatewayFoundationResult } from "./gateway";
import type { PackagingFoundationResult } from "./packaging";

export const COMMERCIAL_PUBLIC_SURFACE_VERSION = "3.6-public-1" as const;

export type CommercialPublicSurfaceFoundationInput = {
  deploymentId: string;
  tier?: string;
  finalization?: CommercialFinalizationFoundationResult;
  packaging?: PackagingFoundationResult;
  gateway?: CommercialGatewayFoundationResult;
};

export type CommercialPublicSurfaceFoundationResult = {
  version: typeof COMMERCIAL_PUBLIC_SURFACE_VERSION;
  deploymentId: string;
  tier: string;
  publicReady: boolean;
  summary: string;
  manifestSummary: string;
};

/** Minimal public surface compat: expose sealed commercial stack publicly. */
export function runCommercialPublicSurfaceFoundation(
  input: CommercialPublicSurfaceFoundationInput,
): CommercialPublicSurfaceFoundationResult {
  const tier = input.tier ?? "enterprise";

  const summary = [
    `public-surface=${COMMERCIAL_PUBLIC_SURFACE_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `tier=${tier}`,
    `public-ready=true`,
    input.finalization?.summary ? `finalization=${input.finalization.summary}` : null,
    input.gateway?.summary ? `gateway=${input.gateway.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_PUBLIC_SURFACE_VERSION,
    deploymentId: input.deploymentId,
    tier,
    publicReady: true,
    summary,
    manifestSummary: `public-manifest=${COMMERCIAL_PUBLIC_SURFACE_VERSION} deploymentId=${input.deploymentId}`,
  };
}

export function formatPublicSurfaceRuntimeHook(
  result: CommercialPublicSurfaceFoundationResult,
): string {
  return result.summary;
}

export function formatPublicManifestHook(
  result: CommercialPublicSurfaceFoundationResult,
): string {
  return result.manifestSummary;
}
