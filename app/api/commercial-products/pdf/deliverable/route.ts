import { NextRequest, NextResponse } from "next/server";
import { DELIVERABLE_ROUTE_TYPE, type DeliverableRouteType } from "@/lib/commercial-products/access-layer/shared/deliverable-types";
import { runDeliverablePdfRuntimeHeavy } from "@/lib/commercial-products/access-layer/runtime/heavy-deliverable-pdf";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const typeRaw = String(params.get("type") ?? "").trim() as DeliverableRouteType;
    const quoteId = String(params.get("quoteId") ?? "").trim();
    const planId = params.get("planId")?.trim() || undefined;
    const budgetId = params.get("budgetId")?.trim() || undefined;

    if (!DELIVERABLE_ROUTE_TYPE.includes(typeRaw)) {
      return NextResponse.json(
        { ok: false, code: "INVALID_DELIVERABLE_TYPE", message: "type 须为 summary | plan | budget | zip" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!quoteId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_QUOTE_ID", message: "缺少 quoteId" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const result = await runDeliverablePdfRuntimeHeavy({
      type: typeRaw,
      quoteId,
      planId,
      budgetId,
    });

    return new NextResponse(Buffer.from(result.buffer), {
      status: 200,
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "X-Deliverable-Source": result.source,
        "X-Quote-Id": quoteId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "deliverable pdf failed";
    return NextResponse.json(
      { ok: false, code: "DELIVERABLE_PDF_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
