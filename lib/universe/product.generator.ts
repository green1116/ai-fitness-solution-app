/**
 * V65 — SaaS product generator
 */

import { createTraceId } from "@/lib/ai-execution/core/execution.context";
import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import { generateIndustrySolution } from "@/lib/expansion/expansion.engine";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";
import type { SaaSInstance } from "./universe.types";
import { UNIVERSE_INDUSTRY_CATALOG } from "./universe.types";
import { registerSaaSInstance } from "./universe.store";

export function generateSaaSInstance(input: {
  industry: VerticalIndustry;
  organizationId?: string;
}): SaaSInstance {
  const solution = generateIndustrySolution(input.industry);
  const catalog = UNIVERSE_INDUSTRY_CATALOG.find((c) => c.industry === input.industry);
  const baseMrr = getPricingTier("PRO").monthlyPriceCny;
  const id = `saas-${input.industry}-${createTraceId().slice(0, 8)}`;

  const instance: SaaSInstance = {
    id,
    industry: input.industry,
    name: catalog?.label ?? solution.name,
    slug: input.industry.replace(/_/g, "-"),
    status: "draft",
    mrr: baseMrr,
    modules: solution.modules,
    revenueStreamId: `stream-${id}`,
    createdAt: new Date().toISOString(),
  };

  registerSaaSInstance(instance);
  return instance;
}

export function listGeneratableIndustries(): typeof UNIVERSE_INDUSTRY_CATALOG {
  return UNIVERSE_INDUSTRY_CATALOG;
}
