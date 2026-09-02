import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { linkOpsCrmIdentity } from "@/lib/product/runtime-ops-crm-identity-store";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/runtime-ops/crm-identity/link", body);
    traceId = gate.traceId;

    const opsCustomerId = String(body?.opsCustomerId ?? "").trim();
    const crmCustomerId = String(body?.crmCustomerId ?? "").trim();
    if (!opsCustomerId || !crmCustomerId) {
      return NextResponse.json(
        { ok: false, message: "opsCustomerId and crmCustomerId required", traceId },
        { status: 400 },
      );
    }

    try {
      const link = await linkOpsCrmIdentity({
        organizationId: gate.organizationId,
        opsCustomerId,
        crmCustomerId,
      });

      return NextResponse.json({
        ok: true,
        link: {
          id: link.id,
          organizationId: link.organizationId,
          opsCustomerId: link.opsCustomerId,
          crmCustomerId: link.crmCustomerId,
        },
        traceId,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "CRM customer not found for organization") {
        return NextResponse.json(
          { ok: false, message: "CRM customer not found", traceId },
          { status: 404 },
        );
      }
      throw err;
    }
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, { traceId, endpoint: "/api/runtime-ops/crm-identity/link" });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    return NextResponse.json(
      { ok: false, message: "Failed to link Ops CRM identity", traceId },
      { status: 500 },
    );
  }
}
