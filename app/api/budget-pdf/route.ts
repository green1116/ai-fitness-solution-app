// app/api/budget-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { renderPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

/** base64url -> JSON */
function decodeCfg(cfgB64Url: string) {
  // base64url -> base64
  const b64 = cfgB64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const raw = Buffer.from(b64 + pad, "base64").toString("utf8");
  return JSON.parse(raw);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = (searchParams.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    const cfgParam = (searchParams.get("cfg") || "").trim();
    const cfg = cfgParam ? decodeCfg(cfgParam) : undefined;

    // ✅ 关键：mode=budget（渲染器里需按 budget 分支渲染预算版）
    const bytes = await renderPdf(planId, { mode: "budget", cfg });
    const buf = Buffer.from(bytes);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="budget_${planId}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
        "Content-Length": String(buf.length),
      },
    });
  } catch (e: any) {
    return json(500, "BUDGET_PDF_INTERNAL_ERROR", e?.message || String(e), {
      name: e?.name,
      stack: e?.stack,
    });
  }
}
