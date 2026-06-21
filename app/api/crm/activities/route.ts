import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { buildCustomerTimeline } from "@/lib/crm/activity/activity.timeline";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { getCustomerById } from "@/lib/crm/customer/customer.service";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/crm/activities");
    traceId = gate.traceId;

    const customerId = req.nextUrl.searchParams.get("customerId") ?? "";
    if (!customerId) {
      return NextResponse.json({ ok: false, message: "customerId query required", traceId }, { status: 400 });
    }

    const customer = await getCustomerById(customerId, gate.organizationId);
    if (!customer) {
      return NextResponse.json({ ok: false, message: "Customer not found", traceId }, { status: 404 });
    }

    const timeline = await buildCustomerTimeline(customerId);

    return NextResponse.json({ ok: true, customerId, timeline, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/crm/activities" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to load activities", traceId }, { status: 500 });
  }
}
