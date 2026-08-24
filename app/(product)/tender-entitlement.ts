import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

export const TENDER_UPGRADE_HREF = "/register?plan=ENTERPRISE";
export const TENDER_RECOMMENDED_PLAN = "ENTERPRISE" as const;

export function tenderEnterpriseUpgradeLabel(): string {
  return getPricingTier(TENDER_RECOMMENDED_PLAN).cta;
}
