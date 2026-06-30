/**
 * V64 P2 — Commercial pricing layer types
 */
import type { ProductTier } from "@/lib/productization/catalog";
import type { SaasPlan } from "@/lib/saas/types";
import type { UserTier } from "@/lib/commercial/userTier";

import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export const V64_PRICING_LAYER_VERSION = "v64-pricing-layer-1" as const;

export type CommercialCurrencyCode = "CNY";

export type CommercialCurrencyMetadata = {
  code: CommercialCurrencyCode;
  symbol: string;
  name: string;
  minorUnit: number;
  locale: string;
};

export type PlanPriceKind = "subscription_monthly" | "one_time_unlock" | "catalog_custom";

export type NormalizedPlanPrice = {
  productTier: ProductTier;
  saasPlan: SaasPlan;
  userTier: UserTier;
  currency: CommercialCurrencyCode;
  /** Monthly display reference (CNY yuan) — from `PRICING_TIERS` */
  displayPriceCny: number;
  displayPriceLabel: string;
  /** One-time unlock reference (minor units / fen) — from `commercialTierAmountCents`; null when N/A */
  referencePriceCents: number | null;
  referencePriceLabel: string | null;
  /** Catalog custom pricing label — authoritative for sales packaging */
  catalogReferenceLabel: string;
  priceKinds: PlanPriceKind[];
};

export type CommercialPricingSnapshot = {
  version: typeof V64_PRICING_LAYER_VERSION;
  snapshotId: string;
  currency: CommercialCurrencyMetadata;
  generatedAt: string;
  plans: NormalizedPlanPrice[];
  foundationVersion: typeof V64_COMMERCIAL_FOUNDATION_VERSION;
  summary: string;
};

export type CommercialPricingValidation = {
  currencyOk: boolean;
  plansOk: boolean;
  displayPricesOk: boolean;
  referencePricesOk: boolean;
  catalogLabelsOk: boolean;
  backwardCompatible: boolean;
  pricingOk: boolean;
};
