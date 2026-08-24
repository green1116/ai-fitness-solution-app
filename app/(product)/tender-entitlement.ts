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

export function resolveEnterpriseContactPlanId(ctx: ProductCommercialContext): string {
  return ctx.projectId?.trim() || ctx.organizationId?.trim() || "product-tender";
}

export function buildEnterpriseContactNote(
  value: { phone?: string; title?: string },
  ctx: ProductCommercialContext,
): string {
  const parts: string[] = [];
  if (value.phone?.trim()) parts.push(`手机：${value.phone.trim()}`);
  if (value.title?.trim()) parts.push(`职位：${value.title.trim()}`);
  if (ctx.organizationId?.trim()) parts.push(`organizationId：${ctx.organizationId.trim()}`);
  if (ctx.projectId?.trim()) parts.push(`projectId：${ctx.projectId.trim()}`);
  if (ctx.quoteId?.trim()) parts.push(`quoteId：${ctx.quoteId.trim()}`);
  if (ctx.budgetId?.trim()) parts.push(`budgetId：${ctx.budgetId.trim()}`);
  parts.push("tender_upgrade");
  return parts.join("；");
}

export function isEnterpriseRegisterHref(href: string): boolean {
  return href.startsWith("/register");
}
