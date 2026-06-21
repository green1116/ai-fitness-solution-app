import { NextRequest, NextResponse } from "next/server";

import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import {
  createApiKey,
  getPlatformCatalog,
  listApiEndpoints,
  validateApiAccess,
  resolvePlanForSaasTier,
} from "@/lib/expansion/expansion.service";
import { runSaasApiGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasApiGate(req, "canUseAPI");
    traceId = gate.traceId;

    const catalog = getPlatformCatalog();
    const access = await validateApiAccess({
      organizationId: gate.organizationId,
      endpoint: "/api/expansion/api-platform",
    });

    return NextResponse.json({
      ok: true,
      catalog,
      endpoints: listApiEndpoints(),
      access,
      planId: resolvePlanForSaasTier(gate.plan),
      traceId,
    });
  } catch (err: unknown) {
    if (err instanceof FeatureGateError) return saasGateErrorResponse(err, traceId);
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/api-platform" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "API platform fetch failed", traceId }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasApiGate(req, "canUseAPI", body);
    traceId = gate.traceId;

    const label = String(body?.label ?? "default").trim();
    const planId = resolvePlanForSaasTier(gate.plan);

    const apiKey = createApiKey({
      organizationId: gate.organizationId,
      label,
      planId,
    });

    return NextResponse.json({ ok: true, apiKey, traceId });
  } catch (err: unknown) {
    if (err instanceof FeatureGateError) return saasGateErrorResponse(err, traceId);
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/api-platform" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "API key creation failed", traceId }, { status: 500 });
  }
}
