"use client";

import type { ProductCommercialContext } from "./commercial-context";
import {
  buildTenderUpgradeHref,
  TENDER_RECOMMENDED_PLAN,
} from "./tender-entitlement";

type SubscriptionResponse = {
  ok?: boolean;
  organizationId?: string;
  subscription?: { plan?: string; status?: string };
  featureFlags?: { canGenerateTender?: boolean };
};

export type TenderClientEntitlement = {
  organizationId: string;
  canGenerateTender: boolean;
  currentPlan: string;
  recommendedPlan: string;
  trigger: string;
  upgradeHref: string;
  upgradeCta: string;
};

type SubscriptionSnapshot = {
  canGenerateTender: boolean;
  currentPlan: string;
};

type SnapshotCacheEntry = {
  snapshot: SubscriptionSnapshot;
  expiresAt: number;
};

/** Short TTL so plan changes can refresh without sticky permanent failures. */
const SUBSCRIPTION_SNAPSHOT_TTL_MS = 60_000;

const subscriptionSnapshotCache = new Map<string, SnapshotCacheEntry>();
const subscriptionSnapshotInflight = new Map<string, Promise<SubscriptionSnapshot>>();

function readCachedSnapshot(organizationId: string): SubscriptionSnapshot | null {
  const entry = subscriptionSnapshotCache.get(organizationId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    subscriptionSnapshotCache.delete(organizationId);
    return null;
  }
  return entry.snapshot;
}

function writeCachedSnapshot(organizationId: string, snapshot: SubscriptionSnapshot): void {
  subscriptionSnapshotCache.set(organizationId, {
    snapshot,
    expiresAt: Date.now() + SUBSCRIPTION_SNAPSHOT_TTL_MS,
  });
}

/**
 * Org-scoped subscription snapshot with in-flight coalescing.
 * Successful responses are cached briefly; network/HTTP failures are not cached.
 */
async function loadSubscriptionSnapshot(
  organizationId: string,
): Promise<SubscriptionSnapshot> {
  const orgId = organizationId.trim();
  if (!orgId) {
    return { canGenerateTender: false, currentPlan: "BASIC" };
  }

  const cached = readCachedSnapshot(orgId);
  if (cached) return cached;

  const existing = subscriptionSnapshotInflight.get(orgId);
  if (existing) return existing;

  const pending = (async (): Promise<SubscriptionSnapshot> => {
    try {
      const res = await fetch("/api/billing/subscription", {
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": orgId,
        },
      });
      if (!res.ok) {
        // Transient HTTP failure — do not cache.
        return { canGenerateTender: false, currentPlan: "BASIC" };
      }
      const sub = (await res.json().catch(() => ({}))) as SubscriptionResponse;
      const snapshot: SubscriptionSnapshot = {
        canGenerateTender:
          sub.ok === true && sub.featureFlags?.canGenerateTender === true,
        currentPlan: String(sub.subscription?.plan ?? "BASIC").toUpperCase(),
      };
      writeCachedSnapshot(orgId, snapshot);
      return snapshot;
    } catch {
      // Network/parse throw — do not cache; next caller may retry.
      return { canGenerateTender: false, currentPlan: "BASIC" };
    } finally {
      subscriptionSnapshotInflight.delete(orgId);
    }
  })();

  subscriptionSnapshotInflight.set(orgId, pending);
  return pending;
}

/**
 * Resolve tender entitlement from billing subscription only.
 * When canGenerateTender is false, reuse static locked CTA (no growth paywall request).
 * Subscription snapshot is shared per org; upgradeHref stays ctx/path-local.
 */
export async function loadTenderClientEntitlement(
  organizationId: string,
  ctx: ProductCommercialContext = {},
  options?: { currentPath?: string },
): Promise<TenderClientEntitlement> {
  const denied: TenderClientEntitlement = {
    organizationId,
    canGenerateTender: false,
    currentPlan: "BASIC",
    recommendedPlan: TENDER_RECOMMENDED_PLAN,
    trigger: "tender_generation_click",
    upgradeHref: buildTenderUpgradeHref(
      {
        ...ctx,
        organizationId: organizationId || ctx.organizationId,
      },
      { authenticated: Boolean(organizationId), currentPath: options?.currentPath },
    ),
    upgradeCta: "升级到 Enterprise 解锁标书",
  };
  if (!organizationId) return denied;

  const snapshot = await loadSubscriptionSnapshot(organizationId);

  if (snapshot.canGenerateTender) {
    return {
      ...denied,
      canGenerateTender: true,
      currentPlan: snapshot.currentPlan,
      recommendedPlan: snapshot.currentPlan,
    };
  }

  return {
    ...denied,
    currentPlan: snapshot.currentPlan,
  };
}
