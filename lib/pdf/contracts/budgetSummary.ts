export type MoneyRange = { min: number; max: number };

export type BudgetLine = {
  category: string;
  categoryName: string;
  qtyText: string;
  unitPriceText: string;
  subtotal: MoneyRange;
  fit?: string;
  note?: string;
};

export type BudgetItem = {
  category: string;
  name: string;
  qty: number;
  unitPrice: MoneyRange;
  subtotal: MoneyRange;
  note?: string;
  priceBasis?: "VERIFIED" | "ESTIMATE";
  /** Human-readable source of a VERIFIED unit price. */
  priceSource?: string;
  /** Display of a persisted organization estimate basis (ESTIMATE rows only): "组织价目表 第 N 版"; never the sourceNote. */
  estimateBasis?: string;
};

export type BudgetSummary = {
  planId: string;
  companyName?: string;
  companySize: number;
  tier: "low" | "mid" | "high";

  overallTotal: MoneyRange;
  estimatedBySubtotals?: MoneyRange;

  lines: BudgetLine[];
  items?: BudgetItem[];

  assumptions?: string[];

  meta?: {
    pdfVersion?: string;
    engineFP?: string;
    reqsig?: string;
    generatedAtISO?: string;
  };
};
