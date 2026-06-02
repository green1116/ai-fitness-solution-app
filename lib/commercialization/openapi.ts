/**
 * V3.6 commercial OpenAPI foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialHttpFoundationResult } from "./http";

export const COMMERCIAL_OPENAPI_FOUNDATION_VERSION = "3.6-openapi-1" as const;

export type CommercialOpenApiFoundationInput = {
  http: CommercialHttpFoundationResult;
};

export type CommercialOpenApiFoundationResult = {
  version: typeof COMMERCIAL_OPENAPI_FOUNDATION_VERSION;
  deploymentId: string;
  openApiReady: boolean;
  summary: string;
};

/** Minimal OpenAPI compat: derive spec surface from HTTP foundation. */
export function runCommercialOpenApiFoundation(
  input: CommercialOpenApiFoundationInput,
): CommercialOpenApiFoundationResult {
  const summary = [
    `openapi=${COMMERCIAL_OPENAPI_FOUNDATION_VERSION}`,
    `deploymentId=${input.http.deploymentId}`,
    `openapi-ready=true`,
    input.http.summary ? `http=${input.http.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_OPENAPI_FOUNDATION_VERSION,
    deploymentId: input.http.deploymentId,
    openApiReady: true,
    summary,
  };
}

export function formatOpenApiRuntimeHook(
  result: CommercialOpenApiFoundationResult,
): string {
  return result.summary;
}
