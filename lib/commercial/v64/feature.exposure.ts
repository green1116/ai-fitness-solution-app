/**
 * V64 P3 — Capability exposure (commercial gating metadata; read-only)
 */
import type { ProductTier } from "@/lib/productization/catalog";
import { buildProductFeatures } from "@/lib/productization/catalog";

import { PRODUCT_FEATURE_TO_CAPABILITY, featureKeysForSaasPlan, PRODUCT_TO_SAAS_PLAN } from "./capability.map";
import type { ExposedCapability } from "./feature.types";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

function catalogFeatureEnabled(tier: ProductTier, productFeatureKey: string): boolean {
  const feature = buildProductFeatures().find((f) => f.key === productFeatureKey);
  if (!feature) return false;
  const value = feature.tiers[tier];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  return value === "unlimited";
}

function runtimeFlagEnabled(tier: ProductTier, flagKey: ExposedCapability["featureFlagKey"]): boolean {
  if (!flagKey) return false;
  const saasPlan = PRODUCT_TO_SAAS_PLAN[tier];
  return featureKeysForSaasPlan(saasPlan).includes(flagKey);
}

export function buildExposedCapability(binding: (typeof PRODUCT_FEATURE_TO_CAPABILITY)[number]): ExposedCapability {
  const feature = buildProductFeatures().find((f) => f.key === binding.productFeatureKey);
  const enabledByTier = Object.fromEntries(
    ALL_TIERS.map((tier) => {
      const catalogOn = catalogFeatureEnabled(tier, binding.productFeatureKey);
      const runtimeOn = binding.featureFlagKey
        ? runtimeFlagEnabled(tier, binding.featureFlagKey)
        : catalogOn;
      return [tier, binding.featureFlagKey ? runtimeOn && catalogOn : catalogOn];
    }),
  ) as Record<ProductTier, boolean>;

  return {
    productFeatureKey: binding.productFeatureKey,
    featureFlagKey: binding.featureFlagKey,
    usageType: binding.usageType,
    commercialLabel: feature?.label ?? binding.productFeatureKey,
    enabledByTier,
  };
}

export function buildExposedCapabilities(): ExposedCapability[] {
  return PRODUCT_FEATURE_TO_CAPABILITY.map(buildExposedCapability);
}

export function lookupExposedCapability(productFeatureKey: string): ExposedCapability | null {
  const binding = PRODUCT_FEATURE_TO_CAPABILITY.find((b) => b.productFeatureKey === productFeatureKey);
  return binding ? buildExposedCapability(binding) : null;
}
