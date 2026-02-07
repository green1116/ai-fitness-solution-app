// lib/types/gym-budget.ts
export type Range = { min: number; max: number };

export type BudgetTier = "low" | "mid" | "high";
export type CompanySize = 50 | 100 | 200;

export type BudgetCategory =
  | "cardio"
  | "strength_machine"
  | "free_weights"
  | "accessories";

export type BudgetLine = {
  category: BudgetCategory;
  categoryName: string;
  tier: BudgetTier;
  unitPriceText?: string;
  qtyText: string;
  subtotal: Range;
  fit: string;
  note: string;
};

export type BudgetSummary = {
  tier: BudgetTier;
  companySize: CompanySize;

  // 你表里的整体总计区间
  overallTotal: Range;

  // 四大类小计相加（方便对比 overallTotal）
  estimatedBySubtotals: Range;

  lines: BudgetLine[];
  notes: string[];
};

