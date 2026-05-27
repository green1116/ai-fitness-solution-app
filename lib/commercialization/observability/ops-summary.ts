/**
 * V3.7-H2 Production Observability — ops summary layer
 */

import { formatBuildFreezeSummary } from "../stabilization/build-freeze";
import {
  buildProductionHardeningFoundation,
  formatIncidentTaxonomySummary,
} from "../hardening";
import { buildRuntimeObservabilitySnapshot } from "./runtime-observability";

export const OPS_SUMMARY_VERSION = "3.7-h2-ops-summary-1" as const;

export type OpsSummaryLayer = {
  version: typeof OPS_SUMMARY_VERSION;
  summaryId: string;
  buildSummary: string;
  releaseSummary: string;
  readinessSummary: string;
  hardeningSummary: string;
  incidentSummary: string;
  summary: string;
};

export function buildOpsSummaryLayer(input?: { deploymentId?: string }): OpsSummaryLayer {
  const deploymentId = input?.deploymentId ?? "ops-default";
  const foundation = buildProductionHardeningFoundation({ deploymentId });
  const observability = buildRuntimeObservabilitySnapshot({ deploymentId });
  const summaryId = `OPS-V37H2-${deploymentId.slice(0, 8)}`;

  const buildSummary = formatBuildFreezeSummary();
  const releaseSummary = foundation.release.summary;
  const readinessSummary = foundation.operational.summary;
  const hardeningSummary = foundation.summary;
  const incidentSummary = formatIncidentTaxonomySummary();

  return {
    version: OPS_SUMMARY_VERSION,
    summaryId,
    buildSummary,
    releaseSummary,
    readinessSummary,
    hardeningSummary,
    incidentSummary,
    summary: `ops-summary id=${summaryId} observability=${observability.snapshotId} release=${foundation.release.releasable} ops=${foundation.operational.opsReady}`,
  };
}
