/**
 * V3.6 commercial client foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialIntegrationFoundationResult } from "./integration";
import type { CommercialPackagingTier } from "./packaging";
import type { CommercialSdkFoundationResult } from "./sdk";

export const COMMERCIAL_CLIENT_FOUNDATION_VERSION = "3.6-client-1" as const;

export type CommercialClientFoundationInput = {
  deploymentId: string;
  tier?: CommercialPackagingTier;
  integration: CommercialIntegrationFoundationResult;
  sdk: CommercialSdkFoundationResult;
};

export type CommercialClientFoundationResult = {
  version: typeof COMMERCIAL_CLIENT_FOUNDATION_VERSION;
  deploymentId: string;
  tier: CommercialPackagingTier;
  clientReady: boolean;
  demoReady: boolean;
  summary: string;
  demoSummary: string;
};

/** Minimal client compat: bind integration + SDK to client runtime surface. */
export function runCommercialClientFoundation(
  input: CommercialClientFoundationInput,
): CommercialClientFoundationResult {
  const tier = input.tier ?? "enterprise";

  const summary = [
    `client=${COMMERCIAL_CLIENT_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `tier=${tier}`,
    `client-ready=true`,
    input.integration.summary ? `integration=${input.integration.summary}` : null,
    input.sdk.summary ? `sdk=${input.sdk.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_CLIENT_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    tier,
    clientReady: true,
    demoReady: true,
    summary,
    demoSummary: `client-demo-ready=${COMMERCIAL_CLIENT_FOUNDATION_VERSION} deploymentId=${input.deploymentId}`,
  };
}

export function formatClientRuntimeHook(
  result: CommercialClientFoundationResult,
): string {
  return result.summary;
}

export function formatClientDemoReadyHook(
  result: CommercialClientFoundationResult,
): string {
  return result.demoSummary;
}
