import { NextRequest, NextResponse } from "next/server";
import {
  runWorkspaceRuntimeHeavy,
  syncWorkspaceFromQuoteHeavy,
} from "@/lib/commercial-products/workspace/heavy-workspace-runtime";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const customerId = params.get("customerId")?.trim() || "default-customer";
    const customerName = params.get("customerName")?.trim() || undefined;

    const result = await runWorkspaceRuntimeHeavy({ customerId, customerName });
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "workspace failed";
    return NextResponse.json(
      { ok: false, code: "WORKSPACE_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const customerId = String(body.customerId ?? "default-customer").trim();
    const customerName = body.customerName ? String(body.customerName).trim() : undefined;
    const quoteId = String(body.quoteId ?? "").trim();
    const projectName = String(body.projectName ?? "").trim();
    const sku = String(body.sku ?? "").trim();
    const suggestedPriceCny = Number(body.suggestedPriceCny);
    const sla = String(body.sla ?? "").trim();

    if (!quoteId || !projectName || !sku || !Number.isFinite(suggestedPriceCny) || !sla) {
      return NextResponse.json(
        { ok: false, code: "INVALID_WORKSPACE_PROJECT", message: "缺少 workspace project 字段" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const workspace = await syncWorkspaceFromQuoteHeavy({
      customerId,
      customerName,
      quoteId,
      projectName,
      sku,
      suggestedPriceCny,
      sla,
    });

    return NextResponse.json({ ok: true, workspace }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "workspace sync failed";
    return NextResponse.json(
      { ok: false, code: "WORKSPACE_SYNC_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
