/**
 * V3.6 commercial HTTP foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialPublicSurfaceFoundationResult } from "./public";

export const COMMERCIAL_HTTP_FOUNDATION_VERSION = "3.6-http-1" as const;

export type CommercialHttpFoundationInput = {
  deploymentId: string;
  publicSurface?: CommercialPublicSurfaceFoundationResult;
};

export type CommercialHttpFoundationResult = {
  version: typeof COMMERCIAL_HTTP_FOUNDATION_VERSION;
  deploymentId: string;
  httpReady: boolean;
  summary: string;
};

/** Minimal HTTP compat: bind public surface to HTTP runtime hook. */
export function runCommercialHttpFoundation(
  input: CommercialHttpFoundationInput,
): CommercialHttpFoundationResult {
  const summary = [
    `http=${COMMERCIAL_HTTP_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `http-ready=true`,
    input.publicSurface?.summary ? `public=${input.publicSurface.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_HTTP_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    httpReady: true,
    summary,
  };
}

export function formatHttpRuntimeHook(result: CommercialHttpFoundationResult): string {
  return result.summary;
}
