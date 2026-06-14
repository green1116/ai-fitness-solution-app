import { getChannelPricingBySku } from "../channel-pricing";
import { getDiscountRulesBySku } from "../discount-rules";
import { getLeadTimeBySku } from "../lead-time-intelligence";
import { getProjectPricingBySku } from "../project-pricing";
import type {
  ChannelPricingEntry,
  DiscountRuleEntry,
  ProcurementBundle,
  ProjectPricingEntry,
  ProjectType,
} from "../shared/types";

export function buildProcurementSnapshot(input: { sku: string }) {
  return {
    channelPricing: getChannelPricingBySku(input.sku),
    projectPricing: getProjectPricingBySku(input.sku),
    discountRules: getDiscountRulesBySku(input.sku),
    leadTime: getLeadTimeBySku(input.sku),
  };
}

function selectChannelPricing(
  entries: ChannelPricingEntry[],
  region: string,
): ChannelPricingEntry | undefined {
  return (
    entries.find((e) => e.region === region) ??
    entries.find((e) => e.channel === "manufacturer") ??
    entries[0]
  );
}

function selectProjectPricing(
  entries: ProjectPricingEntry[],
  projectType: ProjectType,
): ProjectPricingEntry | undefined {
  return entries.find((e) => e.projectType === projectType) ?? entries[0];
}

function selectLeadTime(
  sku: string,
  region: string,
): ReturnType<typeof getLeadTimeBySku>[number] | undefined {
  const entries = getLeadTimeBySku(sku);
  return entries.find((e) => e.region === region) ?? entries[0];
}

function selectDiscountRule(
  rules: DiscountRuleEntry[],
  quantity: number,
): DiscountRuleEntry | undefined {
  const eligible = rules
    .filter((r) => quantity >= r.quantityThreshold)
    .sort((a, b) => b.quantityThreshold - a.quantityThreshold);
  return (
    eligible.find((r) => r.appliesTo === "bulk") ??
    eligible.find((r) => r.appliesTo === "project") ??
    eligible.find((r) => r.appliesTo === "all") ??
    eligible[0]
  );
}

function applyDiscount(basePrice: number, rule: DiscountRuleEntry): number {
  switch (rule.discountType) {
    case "percentage":
    case "tiered":
      return Math.round(basePrice * (1 - rule.discountValue));
    case "fixed":
      return Math.max(0, basePrice - rule.discountValue);
    default:
      return basePrice;
  }
}

function computeFinalPrice(input: {
  channelPricing: ChannelPricingEntry;
  projectPricing: ProjectPricingEntry | undefined;
  discountRule: DiscountRuleEntry | undefined;
  quantity: number;
}): number {
  const { channelPricing, projectPricing, discountRule, quantity } = input;

  if (
    discountRule?.appliesTo === "bulk" &&
    quantity >= discountRule.quantityThreshold
  ) {
    return channelPricing.bulkPrice;
  }

  if (projectPricing) {
    if (
      discountRule &&
      (discountRule.appliesTo === "project" || discountRule.appliesTo === "all") &&
      quantity >= discountRule.quantityThreshold
    ) {
      return applyDiscount(projectPricing.finalPrice, discountRule);
    }
    return projectPricing.finalPrice;
  }

  const base = channelPricing.projectPrice;
  if (discountRule && quantity >= discountRule.quantityThreshold) {
    return applyDiscount(base, discountRule);
  }
  return base;
}

export function buildProcurementBundle(input: {
  sku: string;
  region: string;
  projectType: ProjectType;
  quantity: number;
}): ProcurementBundle {
  const { sku, region, projectType, quantity } = input;

  const channelEntries = getChannelPricingBySku(sku);
  const projectEntries = getProjectPricingBySku(sku);
  const discountRules = getDiscountRulesBySku(sku);

  const channelPricing = selectChannelPricing(channelEntries, region);
  const projectPricing = selectProjectPricing(projectEntries, projectType);
  const leadTime = selectLeadTime(sku, region);
  const discountRule = selectDiscountRule(discountRules, quantity);

  if (!channelPricing) {
    return {
      bundleId: `procurement-bundle-${sku}-${region}-${projectType}-q${quantity}`
        .replace(/\s+/g, "-")
        .toLowerCase(),
      sku,
      region,
      projectType,
      quantity,
      channelPricing: {
        id: "missing",
        brand: "",
        sku,
        channel: "manufacturer",
        listPrice: 0,
        dealerPrice: 0,
        projectPrice: 0,
        bulkPrice: 0,
        currency: "CNY",
        region,
        status: "inactive",
        mode: "procurement-intelligence",
      },
      projectPricing,
      discountRule,
      leadTime,
      finalPrice: 0,
      savings: 0,
      bundleReadiness: 0,
    };
  }

  const finalPrice = computeFinalPrice({
    channelPricing,
    projectPricing,
    discountRule,
    quantity,
  });
  const savings = channelPricing.listPrice - finalPrice;

  const checks = [
    true,
    projectPricing !== undefined,
    leadTime !== undefined,
    discountRule !== undefined || discountRules.length > 0,
    finalPrice > 0,
  ];
  const bundleReadiness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    bundleId: `procurement-bundle-${sku}-${region}-${projectType}-q${quantity}`
      .replace(/\s+/g, "-")
      .toLowerCase(),
    sku,
    region,
    projectType,
    quantity,
    channelPricing,
    projectPricing,
    discountRule,
    leadTime,
    finalPrice,
    savings,
    bundleReadiness,
  };
}
