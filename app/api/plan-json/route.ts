// app/api/plan-json/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loadPlanJsonFromDisk, calcBudgetTotals } from "@/lib/pdf/loadPlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) {
      return NextResponse.json({ ok: false, code: "MISSING_PLAN_ID" }, { status: 400 });
    }

    const plan = loadPlanJsonFromDisk(planId);
    const totals = calcBudgetTotals(plan);

    return NextResponse.json({
      ok: true,
      plan,
      totals,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, code: "PLAN_JSON_ERROR", message: e?.message || String(e) },
      { status: 500 }
    );
  }
}
