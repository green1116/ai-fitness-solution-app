/**
 * V59.4 — Stripe price resolution (monthly / yearly)
 */

import type { SaasPlan } from "@/lib/saas/types";

export type BillingInterval = "month" | "year";

const ENV_PRICE_KEYS: Record<SaasPlan, Record<BillingInterval, string>> = {
  BASIC: {
    month: "STRIPE_PRICE_BASIC_MONTHLY",
    year: "STRIPE_PRICE_BASIC_YEARLY",
  },
  PRO: {
    month: "STRIPE_PRICE_PRO_MONTHLY",
    year: "STRIPE_PRICE_PRO_YEARLY",
  },
  ENTERPRISE: {
    month: "STRIPE_PRICE_ENTERPRISE_MONTHLY",
    year: "STRIPE_PRICE_ENTERPRISE_YEARLY",
  },
};

/** Legacy single-price env vars (monthly fallback) */
const LEGACY_PRICE_KEYS: Record<SaasPlan, string> = {
  BASIC: "STRIPE_PRICE_BASIC",
  PRO: "STRIPE_PRICE_PRO",
  ENTERPRISE: "STRIPE_PRICE_ENTERPRISE",
};

export function resolveStripePriceId(plan: SaasPlan, interval: BillingInterval): string {
  const key = ENV_PRICE_KEYS[plan][interval];
  const fromEnv = process.env[key]?.trim();
  if (fromEnv) return fromEnv;

  if (interval === "month") {
    const legacy = process.env[LEGACY_PRICE_KEYS[plan]]?.trim();
    if (legacy) return legacy;
  }

  throw new Error(`Stripe price not configured for plan=${plan} interval=${interval}`);
}

export function listConfiguredPrices(): Array<{ plan: SaasPlan; interval: BillingInterval; priceId: string }> {
  const result: Array<{ plan: SaasPlan; interval: BillingInterval; priceId: string }> = [];
  const plans: SaasPlan[] = ["BASIC", "PRO", "ENTERPRISE"];
  const intervals: BillingInterval[] = ["month", "year"];

  for (const plan of plans) {
    for (const interval of intervals) {
      try {
        result.push({ plan, interval, priceId: resolveStripePriceId(plan, interval) });
      } catch {
        // skip unconfigured
      }
    }
  }
  return result;
}
