// lib/pdf/presets.ts
export type TenderLevel = "saas" | "enterprise" | "government";

export function parseTenderLevel(v?: string | null): TenderLevel {
  const s = (v || "").trim().toLowerCase();
  if (s === "enterprise") return "enterprise";
  if (s === "government") return "government";
  return "saas";
}

/**
 * 预算 PDF 支持的模块（sections）
 * 你现有的至少会用到：header/overall/table/footer
 * enterprise/government 额外模块先按“占位页/条款页”的方式实现即可
 */
export type BudgetPdfSection =
  | "cover"
  | "toc"
  | "header"
  | "overall"
  | "table"
  | "pricing_terms"
  | "delivery_terms"
  | "payment_terms"
  | "after_sales"
  | "compliance"
  | "sign_seal"
  | "attachments"
  | "footer";

export const LEVEL_PRESETS: Record<
  TenderLevel,
  {
    budgetSections: BudgetPdfSection[];
    style: { dense: boolean };
  }
> = {
  // C：商业标准版（默认）
  saas: {
    budgetSections: ["header", "overall", "table", "footer"],
    style: { dense: true },
  },

  // A：企业招标级
  enterprise: {
    budgetSections: [
      "header",
      "overall",
      "table",
      "pricing_terms",
      "delivery_terms",
      "payment_terms",
      "after_sales",
      "sign_seal",
      "footer",
    ],
    style: { dense: false },
  },

  // B：政府投标级
  government: {
    budgetSections: [
      "cover",
      "toc",
      "header",
      "overall",
      "table",
      "pricing_terms",
      "delivery_terms",
      "payment_terms",
      "after_sales",
      "compliance",
      "sign_seal",
      "attachments",
      "footer",
    ],
    style: { dense: false },
  },
};