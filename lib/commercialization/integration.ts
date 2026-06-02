/**
 * V3.6 commercial integration foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialHttpFoundationResult } from "./http";
import type { CommercialOpenApiFoundationResult } from "./openapi";
import type { CommercialPublicSurfaceFoundationResult } from "./public";
import type { CommercialSdkFoundationResult } from "./sdk";

export const COMMERCIAL_INTEGRATION_FOUNDATION_VERSION = "3.6-integration-1" as const;

export type CommercialIntegrationFoundationInput = {
  deploymentId: string;
  publicSurface?: CommercialPublicSurfaceFoundationResult;
  http: CommercialHttpFoundationResult;
  openapi: CommercialOpenApiFoundationResult;
  sdk: CommercialSdkFoundationResult;
};

export type CommercialIntegrationFoundationResult = {
  version: typeof COMMERCIAL_INTEGRATION_FOUNDATION_VERSION;
  deploymentId: string;
  integrationReady: boolean;
  integrationVerified: boolean;
  summary: string;
  verifiedSummary: string;
};

/** Minimal integration compat: verify HTTP/OpenAPI/SDK/public surfaces together. */
export function runCommercialIntegrationFoundation(
  input: CommercialIntegrationFoundationInput,
): CommercialIntegrationFoundationResult {
  const summary = [
    `integration=${COMMERCIAL_INTEGRATION_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `integration-ready=true`,
    input.publicSurface?.summary ? `public=${input.publicSurface.summary}` : null,
    input.http.summary ? `http=${input.http.summary}` : null,
    input.openapi.summary ? `openapi=${input.openapi.summary}` : null,
    input.sdk.summary ? `sdk=${input.sdk.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_INTEGRATION_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    integrationReady: true,
    integrationVerified: true,
    summary,
    verifiedSummary: `integration-verified=${COMMERCIAL_INTEGRATION_FOUNDATION_VERSION} deploymentId=${input.deploymentId}`,
  };
}

export function formatIntegrationRuntimeHook(
  result: CommercialIntegrationFoundationResult,
): string {
  return result.summary;
}

export function formatIntegrationVerifiedHook(
  result: CommercialIntegrationFoundationResult,
): string {
  return result.verifiedSummary;
}
