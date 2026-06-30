/**
 * V64 P6 — Upgrade / downgrade path maps (read-only metadata)
 */
import type { FeatureKey } from "@/lib/feature-flags/feature.service";
import { buildUpgradeMessage } from "@/lib/growth/conversion/pricing.strategy";
import type { ProductTier } from "@/lib/productization/catalog";

import { featureKeysForSaasPlan } from "./capability.map";
import { normalizePlanPrice } from "./pricing.normalize";
import {
  compareProductTiers,
  PRODUCT_TIER_RANK,
  productTierForRank,
  saasPlanForProductTier,
} from "./transition.rank";
import type { PlanTransitionKind, PlanTransitionPath } from "./transition.types";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

function featureFlagDelta(
  fromTier: ProductTier,
  toTier: ProductTier,
): { gained: FeatureKey[]; lost: FeatureKey[] } {
  const fromFlags = featureKeysForSaasPlan(saasPlanForProductTier(fromTier));
  const toFlags = featureKeysForSaasPlan(saasPlanForProductTier(toTier));
  const gained = toFlags.filter((f) => !fromFlags.includes(f));
  const lost = fromFlags.filter((f) => !toFlags.includes(f));
  return { gained, lost };
}

function buildTransitionMessage(
  kind: PlanTransitionKind,
  fromTier: ProductTier,
  toTier: ProductTier,
): string {
  const fromPlan = saasPlanForProductTier(fromTier);
  const toPlan = saasPlanForProductTier(toTier);
  if (kind === "upgrade") {
    return buildUpgradeMessage(fromPlan, toPlan);
  }
  return `Downgrade from ${fromPlan} to ${toPlan}: review feature and usage limit changes`;
}

function buildTransitionPath(fromTier: ProductTier, toTier: ProductTier): PlanTransitionPath | null {
  const delta = compareProductTiers(fromTier, toTier);
  if (delta === 0) return null;

  const kind: PlanTransitionKind = delta > 0 ? "upgrade" : "downgrade";
  const fromSaasPlan = saasPlanForProductTier(fromTier);
  const toSaasPlan = saasPlanForProductTier(toTier);
  const fromPrice = normalizePlanPrice(fromTier).displayPriceCny;
  const toPrice = normalizePlanPrice(toTier).displayPriceCny;
  const { gained, lost } = featureFlagDelta(fromTier, toTier);

  return {
    fromProductTier: fromTier,
    toProductTier: toTier,
    fromSaasPlan,
    toSaasPlan,
    kind,
    rankDelta: Math.abs(delta),
    monthlyPriceDeltaCny: toPrice - fromPrice,
    gainedFeatureFlags: gained,
    lostFeatureFlags: lost,
    message: buildTransitionMessage(kind, fromTier, toTier),
  };
}

function buildPathsForKind(kind: PlanTransitionKind): PlanTransitionPath[] {
  const paths: PlanTransitionPath[] = [];
  for (const fromTier of ALL_TIERS) {
    for (const toTier of ALL_TIERS) {
      const path = buildTransitionPath(fromTier, toTier);
      if (path && path.kind === kind) {
        paths.push(path);
      }
    }
  }
  return paths;
}

export function buildUpgradePathMap(): PlanTransitionPath[] {
  return buildPathsForKind("upgrade");
}

export function buildDowngradePathMap(): PlanTransitionPath[] {
  return buildPathsForKind("downgrade");
}

export function lookupUpgradePath(
  fromTier: ProductTier,
  toTier: ProductTier,
): PlanTransitionPath | null {
  const path = buildTransitionPath(fromTier, toTier);
  return path?.kind === "upgrade" ? path : null;
}

export function lookupDowngradePath(
  fromTier: ProductTier,
  toTier: ProductTier,
): PlanTransitionPath | null {
  const path = buildTransitionPath(fromTier, toTier);
  return path?.kind === "downgrade" ? path : null;
}

export function resolveNextUpgradeTier(fromTier: ProductTier): ProductTier | null {
  return productTierForRank(PRODUCT_TIER_RANK[fromTier] + 1);
}

export function resolveNextDowngradeTier(fromTier: ProductTier): ProductTier | null {
  return productTierForRank(PRODUCT_TIER_RANK[fromTier] - 1);
}
