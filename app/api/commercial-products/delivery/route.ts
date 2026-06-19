import { NextRequest, NextResponse } from "next/server";
import {
  DELIVERY_MODE,
  type DeliveryMode,
} from "@/lib/commercial-products/orchestration/delivery-orchestrator-types";
import {
  executeDeliveryOrchestratorHeavy,
  runDeliveryOrchestratorHeavy,
} from "@/lib/commercial-products/orchestration/heavy-orchestration-runtime";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const quoteId = String(params.get("quoteId") ?? "").trim();
    const planId = params.get("planId")?.trim() || undefined;
    const budgetId = params.get("budgetId")?.trim() || undefined;
    const modeRaw = params.get("mode")?.trim() || "full";
    const execute = params.get("execute") === "1" || params.get("execute") === "true";

    if (!quoteId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_QUOTE_ID", message: "缺少 quoteId" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!DELIVERY_MODE.includes(modeRaw as DeliveryMode)) {
      return NextResponse.json(
        { ok: false, code: "INVALID_MODE", message: "mode 须为 fast | full | tender" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const request = {
      quoteId,
      planId,
      budgetId,
      mode: modeRaw as DeliveryMode,
    };

    if (execute) {
      const result = await executeDeliveryOrchestratorHeavy(request);
      return NextResponse.json({ ok: true, plan: result, executed: true }, { headers: NO_STORE_HEADERS });
    }

    const plan = await runDeliveryOrchestratorHeavy(request);
    return NextResponse.json({ ok: true, plan, executed: false }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "delivery orchestration failed";
    return NextResponse.json(
      { ok: false, code: "DELIVERY_ORCHESTRATOR_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
