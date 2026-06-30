/**
 * V64 P7 — Cross-layer invariant checks (P1–P6)
 */
import { buildCommercialCapabilityBundle } from "./capability.builder";
import { buildCommercialProductCatalogBundle } from "./catalog.builder";
import { PRODUCT_TO_SAAS_PLAN } from "./capability.map";
import { buildCommercialPricingSnapshot } from "./pricing.snapshot";
import { buildCommercialTransitionBundle } from "./transition.builder";
import type { CrossLayerInvariantReport } from "./verify.types";

export function checkCrossLayerInvariants(input?: {
  deploymentId?: string;
}): CrossLayerInvariantReport {
  const deploymentId = input?.deploymentId ?? "v64-verify-layer-default";

  const pricing = buildCommercialPricingSnapshot({ deploymentId });
  const capability = buildCommercialCapabilityBundle({ deploymentId });
  const catalog = buildCommercialProductCatalogBundle({ deploymentId });
  const transition = buildCommercialTransitionBundle({ deploymentId });

  const tierCountConsistent =
    pricing.plans.length === 3 &&
    capability.tierAggregates.length === 3 &&
    catalog.tierEntries.length === 3;

  const productName = catalog.productName;
  const productNameConsistent =
    catalog.tierEntries.every((e) => e.product.name.length > 0) &&
    capability.tierAggregates.every((t) => t.productName.length > 0) &&
    productName === "AI Fitness Solution";

  const saasPlanMappingConsistent = catalog.tierEntries.every((entry) => {
    const cap = capability.tierAggregates.find((t) => t.productTier === entry.productTier);
    return (
      cap != null &&
      cap.saasPlan === entry.saasPlan &&
      cap.saasPlan === PRODUCT_TO_SAAS_PLAN[entry.productTier]
    );
  });

  const transitionPathsConsistent =
    transition.upgradePaths.length === 3 && transition.downgradePaths.length === 3;

  const crossLayerInvariantsOk =
    tierCountConsistent &&
    productNameConsistent &&
    saasPlanMappingConsistent &&
    transitionPathsConsistent;

  return {
    tierCountConsistent,
    productNameConsistent,
    saasPlanMappingConsistent,
    transitionPathsConsistent,
    crossLayerInvariantsOk,
  };
}
