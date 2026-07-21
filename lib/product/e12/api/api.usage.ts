/**
 * E12-P5 — API Usage Tracking
 * Integrates billing usage meter for API call metering
 */

import { recordUsage as recordBillingUsage } from "../billing/billing.usage";
import { getApiCatalogEntry } from "./api.catalog";
import { getApiKey } from "./api.key";
import type { ApiUsageRecord, RecordApiUsageInput } from "./api.types";

const apiUsageRecords = new Map<string, ApiUsageRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(record: ApiUsageRecord): ApiUsageRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function recordApiUsage(input: RecordApiUsageInput): ApiUsageRecord {
  const productTenantId = input.productTenantId.trim();
  const developerId = input.developerId.trim();
  const apiKeyId = input.apiKeyId.trim();
  const apiCatalogEntryId = input.apiCatalogEntryId.trim();

  const key = getApiKey(apiKeyId);
  if (!key || key.productTenantId !== productTenantId) {
    throw new Error(`api key not found for tenant: ${apiKeyId}`);
  }

  const entry = getApiCatalogEntry(apiCatalogEntryId);
  if (!entry) throw new Error(`api catalog entry not found: ${apiCatalogEntryId}`);

  const id = input.id?.trim() || createId("apiusage");
  if (apiUsageRecords.has(id)) {
    throw new Error(`api usage record already exists: ${id}`);
  }

  const record: ApiUsageRecord = {
    id,
    productTenantId,
    developerId,
    apiKeyId,
    apiCatalogEntryId,
    path: entry.path,
    statusCode: input.statusCode ?? 200,
    latencyMs: input.latencyMs ?? 0,
    billingSubscriptionId: input.billingSubscriptionId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  apiUsageRecords.set(id, record);

  if (record.billingSubscriptionId) {
    try {
      recordBillingUsage({
        productTenantId,
        billingSubscriptionId: record.billingSubscriptionId,
        meter: "REQUEST",
        quantity: 1,
      });
    } catch {
      // billing subscription may not exist yet — non-fatal
    }
  }

  return cloneRecord(record);
}

export function listApiUsageRecords(filter?: {
  productTenantId?: string;
  developerId?: string;
  apiKeyId?: string;
  apiCatalogEntryId?: string;
}): ApiUsageRecord[] {
  let result = [...apiUsageRecords.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((r) => r.productTenantId === tid);
  }
  if (filter?.developerId) {
    const did = filter.developerId.trim();
    result = result.filter((r) => r.developerId === did);
  }
  if (filter?.apiKeyId) {
    const kid = filter.apiKeyId.trim();
    result = result.filter((r) => r.apiKeyId === kid);
  }
  if (filter?.apiCatalogEntryId) {
    const eid = filter.apiCatalogEntryId.trim();
    result = result.filter((r) => r.apiCatalogEntryId === eid);
  }
  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map(cloneRecord);
}

export function getApiUsageCount(filter?: {
  productTenantId?: string;
  apiCatalogEntryId?: string;
}): number {
  return listApiUsageRecords(filter).length;
}

export function clearApiUsageRecords(): void {
  apiUsageRecords.clear();
}
