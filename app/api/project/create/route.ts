import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";
import { recordProjectCreation } from "@/lib/growth/growth.service";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";
import {
  parseBudgetLevelValue,
  parseSiteTypeValue,
} from "@/lib/project/project-intake";
import { createProject } from "@/lib/services/project.service";

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/project/create", body);
    traceId = gate.traceId;

    const name = String(body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { ok: false, message: "缺少项目名称", traceId: gate.traceId },
        { status: 400 },
      );
    }

    const isFirst =
      getGrowthEventsSnapshot().filter(
        (e) => e.organizationId === gate.organizationId && e.event === "project.created",
      ).length === 0;

    const project = await createProject({
      name,
      clientName: body?.clientName,
      industry: body?.industry,
      city: body?.city,
      areaM2: body?.areaM2 ? Number(body.areaM2) : undefined,
      targetUsers: body?.targetUsers ? Number(body.targetUsers) : undefined,
      siteType: parseSiteTypeValue(body?.siteType),
      budgetLevel: parseBudgetLevelValue(body?.budgetLevel),
      notes: body?.notes,
      organizationId: gate.organizationId,
    });

    await recordProjectCreation({
      userId: gate.userId,
      organizationId: gate.organizationId,
      projectId: project.id,
      isFirst,
    });

    return NextResponse.json({ ok: true, project, traceId: gate.traceId, growth: { isFirstProject: isFirst } });
  } catch (err: unknown) {
    if (isKnownApiError(err)) {
      return handleApiError(err, { traceId, endpoint: "/api/project/create" });
    }
    if (err instanceof Error && (err.name === "SaasAuthError" || err.name === "FeatureGateError")) {
      return saasGateErrorResponse(err, traceId);
    }
    console.error("[project/create]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "项目创建失败", traceId },
      { status: 500 },
    );
  }
}
