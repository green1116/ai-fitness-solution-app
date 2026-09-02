import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { getCustomerById } from "@/lib/crm/customer/customer.service";
import { resolveValidatedProductContextForCustomer } from "@/lib/product/commercial-context-bridge";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/crm/product-context");
    traceId = gate.traceId;

    const customerId = req.nextUrl.searchParams.get("customerId") ?? "";
    if (!customerId) {
      return NextResponse.json(
        { ok: false, message: "customerId query required", traceId },
        { status: 400 },
      );
    }

    const customer = await getCustomerById(customerId, gate.organizationId);
    if (!customer) {
      return NextResponse.json(
        { ok: false, message: "Customer not found", traceId },
        { status: 404 },
      );
    }

    const productContext = await resolveValidatedProductContextForCustomer(
      gate.organizationId,
      customerId,
    );
    if (!productContext) {
      return NextResponse.json(
        { ok: false, message: "Product context not found", traceId },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      customerId,
      productContext,
      traceId,
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, { traceId, endpoint: "/api/crm/product-context" });
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
