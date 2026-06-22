import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest, SaasAuthError } from "@/lib/auth/auth.service";
import { resolveOrganizationFeatures } from "@/lib/billing/subscription/subscription.resolver";
import { saasGateErrorResponse } from "@/lib/saas/api-gate";
import { getUsageSummary } from "@/lib/usage/usage-aggregator.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const organizationId =
      req.nextUrl.searchParams.get("organizationId") ??
      req.headers.get("x-organization-id") ??
      undefined;

    const auth = await authenticateRequest(req, organizationId ? { organizationId } : undefined);

    const [features, usage] = await Promise.all([
      resolveOrganizationFeatures(auth.organizationId),
      getUsageSummary(auth.organizationId),
    ]);

    return NextResponse.json({
      ok: true,
      organizationId: auth.organizationId,
      subscription: {
        plan: features.plan,
        status: features.status,
      },
      featureFlags: features.flags,
      usage,
    });
  } catch (err: unknown) {
    if (err instanceof SaasAuthError) {
      return saasGateErrorResponse(err);
    }
    console.error("[billing/subscription]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Failed to load subscription" },
      { status: 500 },
    );
  }
}
