import { NextRequest, NextResponse } from "next/server";
import renderBudgetPdfBuffer from "@/lib/pdf/renderBudget";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asciiSafe(s: string) {
  return String(s || "").replace(/[^\x20-\x7E]/g, "");
}
function json(status: number, obj: any) {
  return NextResponse.json(obj, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const planId = (searchParams.get("planId") || "").trim();
    const mode = (searchParams.get("mode") || "full").trim();
    if (!planId) return json(400, { ok: false, code: "MISSING_PLAN_ID" });

    if (mode !== "budget") {
      return json(200, { ok: true, hint: "Use mode=budget", planId, mode });
    }

    const pdfVersion = (searchParams.get("pdfVersion") || "TENDER_NEW_BUILD_V1").trim();

    const input = {
      planId,
      companyName: (searchParams.get("companyName") || "未命名企业").trim(),
      companySize: Number(searchParams.get("companySize") || "100"),
      budgetTier: (searchParams.get("budgetTier") || "mid").trim(),

      projectName: (searchParams.get("projectName") || "").trim() || undefined,
      tenderNo: (searchParams.get("tenderNo") || "").trim() || undefined,
      bidderName: (searchParams.get("bidderName") || "AI Fitness Solution").trim(),
      contactName: (searchParams.get("contactName") || "").trim() || undefined,
      contactPhone: (searchParams.get("contactPhone") || "").trim() || undefined,
      contactEmail: (searchParams.get("contactEmail") || "").trim() || undefined,
    } as any;

    const bytes = await renderBudgetPdfBuffer(input, { pdfVersion });

    const res = new NextResponse(Buffer.from(bytes), { status: 200 });
    res.headers.set("Content-Type", "application/pdf");
    res.headers.set("Cache-Control", "no-store");
    res.headers.set("Content-Disposition", `inline; filename="tender-budget-${asciiSafe(planId)}.pdf"`);

    res.headers.set("X-PDF-KIND", "BUDGET");
    res.headers.set("X-PDF-VERSION", asciiSafe(pdfVersion));

    // ✅ 唯一标识：只要你还看到 DEBUG_OVERRIDE，就说明没命中新代码
    res.headers.set("X-ROUTE", "app/api/pdf/route.ts::TENDER_STABLE::GET_RENDERED_3P__MARK_20260221");

    return res;
  } catch (err: any) {
    return json(500, {
      ok: false,
      code: "PDF_INTERNAL_ERROR",
      message: err?.message || String(err),
      name: err?.name,
      stack: err?.stack,
    });
  }
}

export async function HEAD(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planId = (searchParams.get("planId") || "").trim() || "NA";
  const pdfVersion = (searchParams.get("pdfVersion") || "NA").trim();

  const res = new NextResponse(null, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Content-Type", "application/pdf");
  res.headers.set("Content-Disposition", `inline; filename="tender-budget-${asciiSafe(planId)}.pdf"`);

  res.headers.set("X-PDF-KIND", "BUDGET");
  res.headers.set("X-PDF-VERSION", asciiSafe(pdfVersion));
  res.headers.set("X-ROUTE", "app/api/pdf/route.ts::TENDER_STABLE::HEAD_NO_BODY__MARK_20260221");

  return res;
}
