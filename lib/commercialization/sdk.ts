/**
 * V3.6 commercial SDK foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialHttpFoundationResult } from "./http";
import type { CommercialOpenApiFoundationResult } from "./openapi";
import type { CommercialPackagingTier } from "./packaging";

export const COMMERCIAL_SDK_FOUNDATION_VERSION = "3.6-sdk-1" as const;

export type CommercialSdkFoundationInput = {
  deploymentId: string;
  tier?: CommercialPackagingTier;
  http: CommercialHttpFoundationResult;
  openapi: CommercialOpenApiFoundationResult;
};

export type CommercialSdkFoundationResult = {
  version: typeof COMMERCIAL_SDK_FOUNDATION_VERSION;
  deploymentId: string;
  tier: CommercialPackagingTier;
  sdkReady: boolean;
  summary: string;
};

/** Minimal SDK compat: bind HTTP/OpenAPI surfaces to client SDK hook. */
export function runCommercialSdkFoundation(
  input: CommercialSdkFoundationInput,
): CommercialSdkFoundationResult {
  const tier = input.tier ?? "enterprise";

  const summary = [
    `sdk=${COMMERCIAL_SDK_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `tier=${tier}`,
    `sdk-ready=true`,
    input.http.summary ? `http=${input.http.summary}` : null,
    input.openapi.summary ? `openapi=${input.openapi.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_SDK_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    tier,
    sdkReady: true,
    summary,
  };
}

export function formatSdkRuntimeHook(result: CommercialSdkFoundationResult): string {
  return result.summary;
}
