import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { resolveValidatedProductContextForOpsCustomer } from "@/lib/product/runtime-ops-product-context-adapter";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/runtime-ops/product-context");
    traceId = gate.traceId;

    const opsCustomerId = req.nextUrl.searchParams.get("opsCustomerId") ?? "";
    if (!opsCustomerId) {
      return NextResponse.json(
        { ok: false, message: "opsCustomerId query required", traceId },
        { status: 400 },
      );
    }

    const productContext = await resolveValidatedProductContextForOpsCustomer(
      gate.organizationId,
      opsCustomerId,
    );
    if (!productContext) {
      return NextResponse.json(
        { ok: false, message: "Product context not found", traceId },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      opsCustomerId,
      productContext,
      traceId,
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, { traceId, endpoint: "/api/runtime-ops/product-context" });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    return NextResponse.json(
      { ok: false, message: "Failed to load product context", traceId },
      { status: 500 },
    );
  }
}
