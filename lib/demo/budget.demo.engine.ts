/**
 * V64 P1 — Budget demo engine
 */

import type { DemoBudgetOutput, DemoCompanyInput, DemoQuoteOutput } from "./demo.types";
import { fallbackDemoBudget } from "./demo.fallback";

export function generateDemoBudget(input: DemoCompanyInput, quote?: DemoQuoteOutput): DemoBudgetOutput {
  const name = input.companyName?.trim();
  if (!name) return fallbackDemoBudget();

  const base = quote?.equipment.reduce((sum, e) => sum + e.qty * 45000, 0) ?? 900000;
  const install = Math.round(base * 0.22);
  const contingency = Math.round(base * 0.15);
  const total = base + install + contingency;

  return {
    total,
    currency: "CNY",
    breakdown: [
      { category: "设备采购", amount: base },
      { category: "安装施工", amount: install },
      { category: "运维预留", amount: contingency },
    ],
    mode: "demo-stub",
  };
}
