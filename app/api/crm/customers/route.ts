import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { createCustomer, listCustomers } from "@/lib/crm/crm.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/crm/customers");
    traceId = gate.traceId;
    const customers = await listCustomers(gate.organizationId);
    return NextResponse.json({ ok: true, customers, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/crm/customers" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to list customers", traceId }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/crm/customers", body);
    traceId = gate.traceId;

    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ ok: false, message: "name required", traceId }, { status: 400 });
    }

    const customer = await createCustomer({
      organizationId: gate.organizationId,
      name,
      industry: body?.industry,
      userId: gate.userId,
    });

    return NextResponse.json({ ok: true, customer, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/crm/customers" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to create customer", traceId }, { status: 500 });
  }
}
