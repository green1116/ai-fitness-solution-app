// app/api/plan22-v2/route.ts
import { NextRequest, NextResponse } from "next/server";
import { renderPlan22PdfBytes_v2 } from "@/lib/pdf/plan2/renderPlan22_v2";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const planId = searchParams.get("planId") || "test-plan-001";
    const companyName = searchParams.get("companyName") || "测试企业";
    const reqsig = searchParams.get("reqsig") || undefined;
    
    // 生成日期（东京时区）
    const now = new Date();
    const ymd = new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(now)
      .replace(/\//g, "/");

    console.log("[PLAN22_V2_API] Rendering PDF...", { planId, companyName, ymd });

    const pdfBytes = await renderPlan22PdfBytes_v2({
      planId,
      companyName,
      ymd,
      reqsig,
    });

    console.log("[PLAN22_V2_API] PDF generated, size:", pdfBytes.length);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="plan22-v2-${planId}.pdf"`,
        "X-Plan-ID": planId,
        "X-PDF-Version": "PLAN22_V2",
      },
    });
  } catch (error) {
    console.error("[PLAN22_V2_API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
