/**
 * V64 P5 — Commercial catalog validation (read-only invariants)
 */
import { validatePackaging } from "@/lib/productization/catalog";

import { validateCommercialCapability } from "./capability.validate";
import { buildCommercialProductCatalogBundle } from "./catalog.builder";
import { buildTierCatalogSnapshot } from "./catalog.snapshot";
import type {
  CommercialCatalogValidation,
  CommercialProductCatalogBundle,
  TierCatalogSnapshot,
} from "./catalog.types";
import { validateCommercialFeatureMatrix } from "./feature.validate";
import { validateCommercialFoundation } from "./foundation";
import { validateCommercialPricing } from "./pricing.validate";

function validateBundle(bundle: CommercialProductCatalogBundle): CommercialCatalogValidation {
  const tierEntriesOk = bundle.tierEntries.length === 3;
  const productsOk = bundle.tierEntries.every(
    (e) => e.product.tier === e.productTier && e.product.name.length > 0,
  );
  const plansOk = bundle.tierEntries.every(
    (e) => e.plan.productTier === e.productTier && e.plan.planId.startsWith("plan-"),
  );
  const pricingOk = validateCommercialPricing().pricingOk;
  const capabilityOk = validateCommercialCapability().capabilityOk;
  const featureOk = validateCommercialFeatureMatrix().featureMatrixOk;
  const packaging = validatePackaging();
  const foundation = validateCommercialFoundation();
  const packagingOk =
    packaging.packagingValid &&
    bundle.tierEntries.every((e) => e.packagingProfile.readyForSale);
  const backwardCompatible = foundation.foundationOk && packaging.packagingValid;

  const catalogOk =
    tierEntriesOk &&
    productsOk &&
    plansOk &&
    pricingOk &&
    capabilityOk &&
    featureOk &&
    packagingOk &&
    backwardCompatible;

  return {
    tierEntriesOk,
    productsOk,
    plansOk,
    pricingOk,
    capabilityOk,
    featureOk,
    packagingOk,
    backwardCompatible,
    catalogOk,
  };
}

export function validateCommercialCatalog(input?: {
  deploymentId?: string;
}): CommercialCatalogValidation {
  const bundle = buildCommercialProductCatalogBundle(input);
  return validateBundle(bundle);
}

export function validateTierCatalogSnapshot(
  snapshot: TierCatalogSnapshot,
): CommercialCatalogValidation {
  return validateBundle(snapshot.bundle);
}
