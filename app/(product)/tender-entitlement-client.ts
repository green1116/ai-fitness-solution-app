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

/**
 * Resolve tender entitlement from billing subscription only.
 * When canGenerateTender is false, reuse static locked CTA (no growth paywall request).
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

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-organization-id": organizationId,
  };

  const subRes = await fetch("/api/billing/subscription", { headers });
  const sub = (await subRes.json().catch(() => ({}))) as SubscriptionResponse;
  const canGenerateTender = sub.ok === true && sub.featureFlags?.canGenerateTender === true;
  const currentPlan = String(sub.subscription?.plan ?? "BASIC").toUpperCase();

  if (canGenerateTender) {
    return {
      ...denied,
      canGenerateTender: true,
      currentPlan,
      recommendedPlan: currentPlan,
    };
  }

  // Subscription already proved no tender entitlement — skip slow paywall API; keep locked CTA.
  return {
    ...denied,
    currentPlan,
  };
}
