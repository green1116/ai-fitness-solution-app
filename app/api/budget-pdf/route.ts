// app/api/budget-pdf/route.ts
console.log("[BUDGET_PDF_ROUTE] ACTIVE: 20260301_OLD_ROUTE");

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function asciiSafeFilename(s: string) {
  return (s || "file")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim()
    .slice(0, 120);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    const download = (searchParams.get("download") || "1").trim() === "1";
    const companyName = (searchParams.get("companyName") || "示例企业").trim();
    const companySize = (searchParams.get("companySize") || "100").trim();
    const budgetTier = (searchParams.get("budgetTier") || "mid").trim();
    const pdfVersionBudget = (searchParams.get("pdfVersionBudget") || "").trim();
    const pdfVersion = (searchParams.get("pdfVersion") || "").trim();

    const mod = await import("@/lib/pdf/budgetRender");
    const renderBudgetPdfBuffer: any = mod.renderBudgetPdfBuffer;

    if (typeof renderBudgetPdfBuffer !== "function") {
      return json(
        500,
        "BUDGET_EXPORT_MISSING",
        "renderBudgetPdfBuffer is not a function in lib/pdf/budgetRender.ts",
        { gotType: typeof renderBudgetPdfBuffer }
      );
    }

    const input = {
      planId,
      companyName,
      companySize: companySize as any,
      budgetTier: budgetTier as any,
    };

    const bytes: Uint8Array = await renderBudgetPdfBuffer(input, {
      pdfVersion: pdfVersionBudget || pdfVersion || "",
    });

    const res = new NextResponse(Buffer.from(bytes), { status: 200 });
    res.headers.set("X-BUDGET-IMPL", "budgetRender.ts");
    res.headers.set("X-BUDGET-FP", "BUDGET_HIT_20260225_BRIDGE_01");
    res.headers.set("Content-Type", "application/pdf");
    res.headers.set(
      "Content-Disposition",
      `${download ? "attachment" : "inline"}; filename="budget-${asciiSafeFilename(planId)}.pdf"`
    );
    return res;
  } catch (e: any) {
    return json(500, "PDF_INTERNAL_ERROR", e?.message || "Internal error", {
      name: e?.name,
      stack: e?.stack,
    });
  }
}

export async function HEAD(req: NextRequest) {
  const r = await GET(req);
  return new NextResponse(null, { status: r.status, headers: r.headers });
}