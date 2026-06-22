import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { createCustomBranding, getBrandingForTenant } from "@/lib/expansion/expansion.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/expansion/white-label");
    traceId = gate.traceId;

    const branding = getBrandingForTenant(gate.organizationId);
    return NextResponse.json({ ok: true, ...branding, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/white-label" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to load branding", traceId }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/expansion/white-label", body);
    traceId = gate.traceId;

    const companyName = String(body?.companyName ?? "").trim();
    if (!companyName) {
      return NextResponse.json({ ok: false, message: "companyName required", traceId }, { status: 400 });
    }

    const config = createCustomBranding({
      organizationId: gate.organizationId,
      companyName,
      logoUrl: body?.logoUrl,
      primaryColor: body?.primaryColor,
      secondaryColor: body?.secondaryColor,
      domain: body?.domain,
      enabled: body?.enabled !== false,
    });

    return NextResponse.json({ ok: true, branding: config, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/white-label" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to save branding", traceId }, { status: 500 });
  }
}
