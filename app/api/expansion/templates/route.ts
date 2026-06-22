import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import { resolveTemplateBundle } from "@/lib/expansion/expansion.service";
import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

const VALID = new Set(["fitness", "education", "procurement", "enterprise", "hr_admin"]);

export async function GET(req: NextRequest) {
  let traceId = "unknown";
  try {
    const gate = await runSaasOrgGate(req, "/api/expansion/templates");
    traceId = gate.traceId;

    const industry = (req.nextUrl.searchParams.get("industry") ?? "fitness") as VerticalIndustry;
    if (!VALID.has(industry)) {
      return NextResponse.json({ ok: false, message: "Invalid industry", traceId }, { status: 400 });
    }

    const templates = resolveTemplateBundle(industry);

    return NextResponse.json({ ok: true, industry, ...templates, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/templates" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Failed to load templates", traceId }, { status: 500 });
  }
}
