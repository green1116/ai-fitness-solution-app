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
