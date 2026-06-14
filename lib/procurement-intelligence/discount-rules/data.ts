import type { DiscountRuleEntry } from "../shared/types";

export const DISCOUNT_RULES_CATALOG: DiscountRuleEntry[] = [
  {
    id: "dr-lf-t5-bulk-10",
    ruleName: "LF T5 Bulk 10+ Units",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    quantityThreshold: 10,
    discountType: "percentage",
    discountValue: 0.07,
    appliesTo: "bulk",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "dr-lf-t5-project-5",
    ruleName: "LF T5 Project Bundle 5+",
    brand: "Life Fitness",
    sku: "LF-T5-001",
    quantityThreshold: 5,
    discountType: "percentage",
    discountValue: 0.05,
    appliesTo: "project",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "dr-tg-skillrun-enterprise",
    ruleName: "Technogym Enterprise Volume",
    brand: "Technogym",
    sku: "TG-SKILLRUN-001",
    quantityThreshold: 3,
    discountType: "percentage",
    discountValue: 0.1,
    appliesTo: "project",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "dr-sh-t8000-campus-fixed",
    ruleName: "Shuhua Campus Fixed Rebate",
    brand: "Shuhua",
    sku: "SH-T8000-001",
    quantityThreshold: 20,
    discountType: "fixed",
    discountValue: 2000,
    appliesTo: "bulk",
    status: "active",
    mode: "procurement-intelligence",
  },
  {
    id: "dr-mx-sdrive-all-tiered",
    ruleName: "Matrix S-Drive Tiered Discount",
    brand: "Matrix",
    sku: "MX-SDRIVE-001",
    quantityThreshold: 8,
    discountType: "tiered",
    discountValue: 0.06,
    appliesTo: "all",
    status: "active",
    mode: "procurement-intelligence",
  },
];

export function getDiscountRulesBySku(sku: string): DiscountRuleEntry[] {
  return DISCOUNT_RULES_CATALOG.filter((e) => e.sku === sku);
}

export function getDiscountRulesByBrand(brand: string): DiscountRuleEntry[] {
  return DISCOUNT_RULES_CATALOG.filter((e) => e.brand === brand);
}

export function getAllDiscountRules(): DiscountRuleEntry[] {
  return [...DISCOUNT_RULES_CATALOG];
}
