// src/lib/plan/types.ts
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
  unitPriceText?: string;       // 原表里是"单台/单件/套"等，直接文本更稳
  qtyText: string;
  subtotal: Range;
  fit: string;
  note: string;
};

export type BudgetSummary = {
  tier: BudgetTier;
  companySize: CompanySize;
  overallTotal: Range;           // 你的表里"整体总计区间"
  estimatedBySubtotals: Range;   // 4 大类小计相加，便于对比
  lines: BudgetLine[];
  notes: string[];
};

export type Plan = {
  planId: string;
  createdAt: string;

  // 你业务相关字段（随时可扩展）
  companyName?: string;
  companySize: CompanySize;
  budgetTier: BudgetTier;

  // 预算（你这次的核心）
  budget: BudgetSummary;
};

