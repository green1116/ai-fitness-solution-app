import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { runApiProtection, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { listProjects } from "@/lib/services/project.service";

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const organizationId = req.nextUrl.searchParams.get("organizationId") ?? undefined;
    const body = organizationId ? { organizationId } : undefined;
    // Same auth/org/RBAC path as org-scoped SaaS gate; skip subscription plan lookup for list TTFB.
    const gate = await runApiProtection(req, {
      endpoint: "/api/project/list",
      body,
      permission: "use_product",
      skipRateLimit: true,
    });
    traceId = gate.traceId;

    const projects = await listProjects({ organizationId: gate.organizationId });

    return NextResponse.json({ ok: true, projects, traceId: gate.traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, { traceId, endpoint: "/api/project/list" });
    }
    if (err instanceof Error && (err.name === "SaasAuthError" || err.name === "FeatureGateError")) {
      return saasGateErrorResponse(err, traceId);
    }
    console.error("[project/list]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "项目列表获取失败", traceId },
      { status: 500 },
    );
  }
}
