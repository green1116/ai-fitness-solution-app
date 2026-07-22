/**
 * Post-Launch P5 — Usage Analytics
 * Integrates billing usage + API usage
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getApiUsageCount, listApiUsageRecords } from "../../product/e12/api/api.usage";
import { listUsageRecords } from "../../product/e12/billing/billing.usage";
import { getCustomerHealthProfile } from "../customer-success/success.health";
import { GROWTH_TRENDS } from "./growth.constants";
import type {
  ComputeUsageAnalyticsInput,
  GrowthTrend,
  UsageAnalyticsSnapshot,
} from "./growth.types";

const snapshots = new Map<string, UsageAnalyticsSnapshot>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSnapshot(
  snapshot: UsageAnalyticsSnapshot,
): UsageAnalyticsSnapshot {
  return { ...snapshot };
}

function deriveTrend(apiCalls: number, billingQty: number): GrowthTrend {
  const total = apiCalls + billingQty;
  if (total <= 0) return "UNKNOWN";
  if (total >= 100) return "UP";
  if (total >= 20) return "FLAT";
  return "DOWN";
}

export function computeUsageAnalytics(
  input: ComputeUsageAnalyticsInput,
): UsageAnalyticsSnapshot {
  const productId = input.productId.trim();
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  if (input.customerHealthProfileId) {
    const health = getCustomerHealthProfile(input.customerHealthProfileId.trim());
    if (!health || health.productId !== productId) {
      throw new Error(
        `customer health profile not found: ${input.customerHealthProfileId}`,
      );
    }
  }

  const productTenantId = input.productTenantId?.trim();
  const billingRecords = listUsageRecords(
    productTenantId ? { productTenantId } : undefined,
  );
  const billingUsageQuantity = billingRecords.reduce(
    (sum, r) => sum + r.quantity,
    0,
  );
  const activeMeters = new Set(billingRecords.map((r) => r.meter)).size;

  const apiCallCount = getApiUsageCount(
    productTenantId ? { productTenantId } : undefined,
  );
  const apiRecords = listApiUsageRecords(
    productTenantId ? { productTenantId } : undefined,
  );

  const trend = deriveTrend(apiCallCount, billingUsageQuantity);
  if (!(GROWTH_TRENDS as readonly string[]).includes(trend)) {
    throw new Error(`invalid growth trend: ${trend}`);
  }

  const id = input.id?.trim() || createId("usagean");
  if (snapshots.has(id)) {
    throw new Error(`usage analytics snapshot already exists: ${id}`);
  }

  const snapshot: UsageAnalyticsSnapshot = {
    id,
    productId,
    productTenantId,
    customerHealthProfileId: input.customerHealthProfileId?.trim() || undefined,
    billingUsageQuantity,
    apiCallCount,
    activeMeters,
    trend,
    detail: `billingQty=${billingUsageQuantity} apiCalls=${apiCallCount} apiRecords=${apiRecords.length}`,
    computedAt: nowIso(),
  };
  snapshots.set(id, snapshot);
  return cloneSnapshot(snapshot);
}

export function getUsageAnalyticsSnapshot(
  id: string,
): UsageAnalyticsSnapshot | undefined {
  const snapshot = snapshots.get(id.trim());
  return snapshot ? cloneSnapshot(snapshot) : undefined;
}

export function listUsageAnalyticsSnapshots(filter?: {
  productId?: string;
}): UsageAnalyticsSnapshot[] {
  let result = [...snapshots.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((s) => s.productId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSnapshot);
}

export function clearUsageAnalyticsSnapshots(): void {
  snapshots.clear();
}
