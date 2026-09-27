import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import { analyzeQuoteRequirements } from "@/lib/services/quote.service";

/** Read-only: no Quote, no generation quota/usage, no growth/CRM side effects. */
export async function POST(req: NextRequest) {
  let organizationId: string | undefined;
  let userId: string | undefined;
  let traceId = "unknown";

  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/quote/analyze", body);
    organizationId = gate.organizationId;
    userId = gate.userId;
    traceId = gate.traceId;

    const projectId = String(body?.projectId ?? "").trim();
    if (!projectId) {
      return NextResponse.json(
        { ok: false, message: "缺少 projectId", traceId },
        { status: 400 },
      );
    }

    const result = await analyzeQuoteRequirements({
      projectId,
      organizationId: gate.organizationId,
      companyInfo: {
        companyName: String(body?.companyInfo?.companyName ?? body?.companyName ?? "").trim(),
        industry: body?.industry ?? body?.companyInfo?.industry,
        city: body?.city ?? body?.companyInfo?.city,
        targetUsers: body?.targetUsers ?? body?.companyInfo?.targetUsers,
        areaM2: body?.areaM2 ?? body?.companyInfo?.areaM2,
        notes: body?.notes ?? body?.companyInfo?.notes,
      },
    });

    return NextResponse.json({
      ok: true,
      missingCriticalInfo: result.missingCriticalInfo,
      conflicts: result.conflicts,
      traceId,
    });
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, {
        traceId,
        endpoint: "/api/quote/analyze",
        organizationId,
        userId,
      });
    }
    if (err instanceof Error && err.name === "SaasAuthError") {
      return saasGateErrorResponse(err, traceId);
    }
    if (err instanceof Error && err.message === "Project not found") {
      return NextResponse.json(
        { ok: false, message: "项目不存在", traceId },
        { status: 404 },
      );
    }
    console.error("[quote/analyze]", err);
    return NextResponse.json(
      { ok: false, message: "需求分析失败", traceId },
      { status: 500 },
    );
  }
}
