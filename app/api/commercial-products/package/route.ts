import { NextRequest, NextResponse } from "next/server";
import { runDeliverablePackageRuntimeHeavy } from "@/lib/commercial-products/package/heavy-deliverable-package";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const quoteId = String(params.get("quoteId") ?? "").trim();
    const planId = params.get("planId")?.trim() || undefined;
    const budgetId = params.get("budgetId")?.trim() || undefined;

    if (!quoteId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_QUOTE_ID", message: "缺少 quoteId" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const result = await runDeliverablePackageRuntimeHeavy({
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
        "X-Package-Version": result.manifest.version,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "deliverable package failed";
    return NextResponse.json(
      { ok: false, code: "DELIVERABLE_PACKAGE_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
