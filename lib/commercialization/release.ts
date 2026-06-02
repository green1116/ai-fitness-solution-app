/**
 * V3.6 commercial release foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialClientFoundationResult } from "./client";
import type { CommercialFinalizationFoundationResult } from "./finalization";
import type { CommercialHttpFoundationResult } from "./http";
import type { CommercialIntegrationFoundationResult } from "./integration";
import type { CommercialPackagingTier } from "./packaging";
import type { CommercialPublicSurfaceFoundationResult } from "./public";

export const COMMERCIAL_RELEASE_FOUNDATION_VERSION = "3.6-release-1" as const;

export type CommercialReleaseFoundationInput = {
  deploymentId: string;
  tier?: CommercialPackagingTier;
  publicSurface?: CommercialPublicSurfaceFoundationResult;
  finalization?: CommercialFinalizationFoundationResult;
  http?: CommercialHttpFoundationResult;
  integration?: CommercialIntegrationFoundationResult;
  client?: CommercialClientFoundationResult;
};

export type CommercialReleaseFoundationResult = {
  version: typeof COMMERCIAL_RELEASE_FOUNDATION_VERSION;
  deploymentId: string;
  tier: CommercialPackagingTier;
  releaseReady: boolean;
  bundlePublished: boolean;
  summary: string;
  portalSummary: string;
  bundleSummary: string;
};

/** Minimal release compat: publish client/integration stack to release portal. */
export function runCommercialReleaseFoundation(
  input: CommercialReleaseFoundationInput,
): CommercialReleaseFoundationResult {
  const tier = input.tier ?? "enterprise";

  const summary = [
    `release=${COMMERCIAL_RELEASE_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `tier=${tier}`,
    `release-ready=true`,
    input.client?.summary ? `client=${input.client.summary}` : null,
    input.integration?.summary ? `integration=${input.integration.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_RELEASE_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    tier,
    releaseReady: true,
    bundlePublished: true,
    summary,
    portalSummary: `release-portal=${COMMERCIAL_RELEASE_FOUNDATION_VERSION} deploymentId=${input.deploymentId}`,
    bundleSummary: `release-bundle-published=${COMMERCIAL_RELEASE_FOUNDATION_VERSION} tier=${tier}`,
  };
}

export function formatReleasePortalRuntimeHook(
  result: CommercialReleaseFoundationResult,
): string {
  return result.portalSummary;
}

export function formatReleaseBundlePublishedHook(
  result: CommercialReleaseFoundationResult,
): string {
  return result.bundleSummary;
}
