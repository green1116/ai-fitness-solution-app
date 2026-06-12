import { buildPackagingContext } from "../bridge/packaging-bridge";
import { buildLifecycleCostProfile } from "../lifecycle-cost/builders";
import type { PackagingBidderBrand } from "../shared/types";

const OPERATION_RATES: Record<PackagingBidderBrand, number> = {
  Technogym: 0.08,
  "Life Fitness": 0.06,
  Matrix: 0.07,
  Shuhua: 0.05,
};

export function buildTCOProfile(input?: {
  deploymentId?: string;
  bidderBrand?: PackagingBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "tco-runtime-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildPackagingContext({ deploymentId, bidderBrand });
  const lifecycle = buildLifecycleCostProfile({ deploymentId, bidderBrand });

  const acquisition = lifecycle.acquisitionCost;
  const operation = Math.round(acquisition * OPERATION_RATES[bidderBrand]);
  const maintenance = lifecycle.maintenanceCost;
  const replacement = lifecycle.replacementCost;
  const totalTCO = acquisition + operation + maintenance + replacement;

  const tcoReadiness = Math.min(
    100,
    Math.round(
      ctx.budgetStrategyScore * 0.4 +
        (totalTCO > acquisition ? 35 : 0) +
        (operation > 0 && maintenance > 0 && replacement > 0 ? 25 : 0),
    ),
  );

  return {
    profileId: `tco-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    acquisition,
    operation,
    maintenance,
    replacement,
    totalTCO,
    tcoReadiness,
  };
}
