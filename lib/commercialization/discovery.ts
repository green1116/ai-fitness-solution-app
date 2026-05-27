/**
 * V3.6 commercial discovery foundation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { CommercialReleaseFoundationResult } from "./release";

export const COMMERCIAL_DISCOVERY_FOUNDATION_VERSION = "3.6-discovery-1" as const;

export type CommercialDiscoveryFoundationInput = {
  deploymentId: string;
  release: CommercialReleaseFoundationResult;
  sampleQuery?: string;
};

export type CommercialDiscoveryFoundationResult = {
  version: typeof COMMERCIAL_DISCOVERY_FOUNDATION_VERSION;
  deploymentId: string;
  sampleQuery: string;
  discoveryReady: boolean;
  searchIndexReady: boolean;
  summary: string;
  searchIndexSummary: string;
};

/** Minimal discovery compat: index release surface for search/discovery hooks. */
export function runCommercialDiscoveryFoundation(
  input: CommercialDiscoveryFoundationInput,
): CommercialDiscoveryFoundationResult {
  const sampleQuery = input.sampleQuery ?? "commercial api";

  const summary = [
    `discovery=${COMMERCIAL_DISCOVERY_FOUNDATION_VERSION}`,
    `deploymentId=${input.deploymentId}`,
    `query=${sampleQuery}`,
    `discovery-ready=true`,
    input.release.summary ? `release=${input.release.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: COMMERCIAL_DISCOVERY_FOUNDATION_VERSION,
    deploymentId: input.deploymentId,
    sampleQuery,
    discoveryReady: true,
    searchIndexReady: true,
    summary,
    searchIndexSummary: `search-index-ready=${COMMERCIAL_DISCOVERY_FOUNDATION_VERSION} deploymentId=${input.deploymentId}`,
  };
}

export function formatDiscoveryRuntimeHook(
  result: CommercialDiscoveryFoundationResult,
): string {
  return result.summary;
}

export function formatSearchIndexReadyHook(
  result: CommercialDiscoveryFoundationResult,
): string {
  return result.searchIndexSummary;
}
