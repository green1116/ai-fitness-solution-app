/**
 * V60 — Cached production aggregations
 */

import { getWorkspaceSummary } from "@/lib/portal/v57/experience/workspace-summary.service";
import { getDocumentsSummary } from "@/lib/portal/v58/documents/documents.aggregator";
import { aggregateDeliveries } from "@/lib/portal/v58/documents/documents.aggregator";
import { buildExecutiveDashboard } from "@/lib/portal/v59/aggregation/executive.intelligence";
import {
  READONLY_CACHE_TTL_MS,
  withReadonlyCache,
} from "../cache/readonly-cache";

export async function getCachedWorkspaceSummary(organizationId: string, userId?: string) {
  return withReadonlyCache(
    `ws:${organizationId}:${userId ?? ""}`,
    READONLY_CACHE_TTL_MS.workspaceSummary,
    () => getWorkspaceSummary(organizationId, userId),
  );
}

export async function getCachedDocumentsSummary(organizationId: string) {
  return withReadonlyCache(
    `doc:${organizationId}`,
    READONLY_CACHE_TTL_MS.documentSummary,
    () => getDocumentsSummary(organizationId),
  );
}

export async function getCachedDeliveries(organizationId: string) {
  return withReadonlyCache(
    `del:${organizationId}`,
    READONLY_CACHE_TTL_MS.deliverySummary,
    () => aggregateDeliveries(organizationId),
  );
}

export async function getCachedExecutiveDashboard(organizationId: string, userId?: string) {
  return withReadonlyCache(
    `exec:${organizationId}:${userId ?? ""}`,
    READONLY_CACHE_TTL_MS.executiveDashboard,
    () => buildExecutiveDashboard(organizationId, userId),
  );
}
