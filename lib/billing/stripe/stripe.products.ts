/**
 * V59.4 — Stripe product catalog
 */

import type { SaasPlan } from "@/lib/saas/types";

export const STRIPE_PRODUCTS = {
  BASIC_PLAN: {
    id: "BASIC_PLAN",
    plan: "BASIC" as SaasPlan,
    name: "AI Fitness Solution — Basic",
    description: "Quote generation with limited usage",
  },
  PRO_PLAN: {
    id: "PRO_PLAN",
    plan: "PRO" as SaasPlan,
    name: "AI Fitness Solution — Pro",
    description: "Quote + Budget + PDF export",
  },
  ENTERPRISE_PLAN: {
    id: "ENTERPRISE_PLAN",
    plan: "ENTERPRISE" as SaasPlan,
    name: "AI Fitness Solution — Enterprise",
    description: "Full platform + Tender + API access",
  },
} as const;

export type StripeProductKey = keyof typeof STRIPE_PRODUCTS;

export function planToProductKey(plan: SaasPlan): StripeProductKey {
  switch (plan) {
    case "BASIC":
      return "BASIC_PLAN";
    case "PRO":
      return "PRO_PLAN";
    case "ENTERPRISE":
      return "ENTERPRISE_PLAN";
  }
}

export function productKeyToPlan(key: string): SaasPlan | null {
  const entry = Object.values(STRIPE_PRODUCTS).find((p) => p.id === key);
  return entry?.plan ?? null;
}

export function metadataPlanToSaasPlan(value: string | undefined | null): SaasPlan | null {
  if (!value) return null;
  const normalized = value.toUpperCase();
  if (normalized === "BASIC" || normalized === "PRO" || normalized === "ENTERPRISE") {
    return normalized;
  }
  return productKeyToPlan(value);
}
