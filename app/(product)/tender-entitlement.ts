import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import {
  buildProductContextSearch,
  type ProductCommercialContext,
} from "./commercial-context";

export const TENDER_RECOMMENDED_PLAN = "ENTERPRISE" as const;

export function tenderEnterpriseUpgradeLabel(): string {
  return getPricingTier(TENDER_RECOMMENDED_PLAN).cta;
}

export function buildTenderUpgradeHref(
  ctx: ProductCommercialContext,
  options?: { authenticated?: boolean; currentPath?: string },
): string {
  if (options?.authenticated === false || !ctx.organizationId) {
    const params = new URLSearchParams();
    params.set("plan", TENDER_RECOMMENDED_PLAN);
    const query = buildProductContextSearch(ctx);
    if (query) params.set("context", query);
    return `/register?${params.toString()}`;
  }

  const params = new URLSearchParams();
  params.set("upgrade", TENDER_RECOMMENDED_PLAN);
  params.set("intent", "tender");
  const query = buildProductContextSearch(ctx);
  if (query) params.set("context", query);
  const currentPath = options?.currentPath?.trim() || "/tender";
  return `${currentPath}?${params.toString()}`;
}
