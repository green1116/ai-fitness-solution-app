// src/app/api/plan/route.ts
import { NextResponse } from "next/server";
import { buildBudgetSummary } from "@/src/lib/gymBudget";
import type { BudgetTier, CompanySize, Plan } from "@/src/lib/plan/types";

function parseTier(x: any): BudgetTier {
  if (x === "low" || x === "mid" || x === "high") return x;
  return "mid";
}

function parseSize(x: any): CompanySize {
  const n = Number(x);
  if (n === 50 || n === 100 || n === 200) return n;
  // 兜底：按常见默认 100 人
  return 100;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const tier = parseTier(body?.budgetTier);
  const size = parseSize(body?.companySize);

  const budget = buildBudgetSummary(tier, size);

  const plan: Plan = {
    planId: body?.planId?.toString() || `plan_${Date.now()}`,
    createdAt: new Date().toISOString(),
    companyName: body?.companyName?.toString() || "未命名企业",
    companySize: size,
    budgetTier: tier,
    budget,
  };

  return NextResponse.json({ ok: true, plan });
}

