/**
 * Demo UI size bands → representative headcount for formal buildBudgetSummary.
 * Do not change formal gym-budget thresholds; mapping is demo-only.
 */

export type DemoRepresentativeSize = 100 | 200 | 300;

/** Deterministic band → companySize used by buildBudgetSummary. */
export function mapDemoSizeBandToCompanySize(
  companySize?: string,
): DemoRepresentativeSize {
  const s = (companySize ?? "200-500人").trim();
  // Check largest band first ("500人以上" must not match "50").
  if (s.includes("500人以上") || /^500\+/.test(s)) return 300;
  if (s.includes("200-500")) return 200;
  if (s.includes("50-200")) return 100;
  return 100;
}

export function demoEstimatedAreaForSize(companySize?: string): string {
  const n = mapDemoSizeBandToCompanySize(companySize);
  if (n >= 300) return "450㎡";
  if (n >= 200) return "350㎡";
  return "280㎡";
}

export function zoneFromBudgetCategory(category: string): string {
  if (category.includes("有氧")) return "有氧区";
  if (category.includes("力量")) return "力量区";
  if (category.includes("辅助")) return "辅助区";
  return "综合区";
}
