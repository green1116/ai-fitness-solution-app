/**
 * V64 P6 — Tier compatibility matrix
 */
import type { ProductTier } from "@/lib/productization/catalog";

import { compareProductTiers } from "./transition.rank";
import type { TierCompatibilityCell, TierCompatibilityMatrix } from "./transition.types";
import { V64_TRANSITION_LAYER_VERSION } from "./transition.types";

const ALL_TIERS: ProductTier[] = ["starter", "professional", "enterprise"];

function buildCompatibilityCell(fromTier: ProductTier, toTier: ProductTier): TierCompatibilityCell {
  const delta = compareProductTiers(fromTier, toTier);
  if (delta === 0) {
    return { fromTier, toTier, allowed: true, kind: "same" };
  }
  if (delta > 0) {
    return { fromTier, toTier, allowed: true, kind: "upgrade" };
  }
  return { fromTier, toTier, allowed: true, kind: "downgrade" };
}

export function buildTierCompatibilityMatrix(input?: {
  deploymentId?: string;
}): TierCompatibilityMatrix {
  const deploymentId = input?.deploymentId ?? "v64-transition-layer-default";
  const cells: TierCompatibilityCell[] = [];
  for (const fromTier of ALL_TIERS) {
    for (const toTier of ALL_TIERS) {
      cells.push(buildCompatibilityCell(fromTier, toTier));
    }
  }
  return {
    version: V64_TRANSITION_LAYER_VERSION,
    matrixId: `tier-compatibility-${deploymentId}`,
    tiers: [...ALL_TIERS],
    cells,
    summary: `tier-compatibility tiers=${ALL_TIERS.length} cells=${cells.length}`,
  };
}

export function isTransitionAllowed(fromTier: ProductTier, toTier: ProductTier): boolean {
  const cell = buildTierCompatibilityMatrix().cells.find(
    (c) => c.fromTier === fromTier && c.toTier === toTier,
  );
  return cell?.allowed === true && cell.kind !== "blocked";
}
