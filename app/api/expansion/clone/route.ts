import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/error/global-error.handler";
import { isKnownApiError } from "@/lib/error/api-error.mapper";
import {
  cloneBusinessToNewIndustry,
  generateIndustrySolution,
} from "@/lib/expansion/expansion.service";
import type { VerticalIndustry } from "@/lib/expansion/expansion.types";
import { runSaasOrgGate, saasGateErrorResponse } from "@/lib/saas/api-gate";

const VALID = new Set(["fitness", "education", "procurement", "enterprise", "hr_admin"]);

export async function POST(req: NextRequest) {
  let traceId = "unknown";
  try {
    const body = await req.json();
    const gate = await runSaasOrgGate(req, "/api/expansion/clone", body);
    traceId = gate.traceId;

    if (body?.action === "solution") {
      const industry = String(body?.industry ?? "fitness") as VerticalIndustry;
      if (!VALID.has(industry)) {
        return NextResponse.json({ ok: false, message: "Invalid industry", traceId }, { status: 400 });
      }
      const solution = generateIndustrySolution(industry);
      return NextResponse.json({ ok: true, solution, traceId });
    }

    const sourceVertical = String(body?.sourceVertical ?? "fitness") as VerticalIndustry;
    const targetVertical = String(body?.targetVertical ?? "education") as VerticalIndustry;

    if (!VALID.has(sourceVertical) || !VALID.has(targetVertical)) {
      return NextResponse.json({ ok: false, message: "Invalid vertical", traceId }, { status: 400 });
    }

    const result = cloneBusinessToNewIndustry({
      organizationId: gate.organizationId,
      sourceVertical,
      targetVertical,
      branding: body?.companyName ? { companyName: String(body.companyName), logoUrl: body?.logoUrl } : undefined,
    });

    return NextResponse.json({ ok: true, ...result, traceId });
  } catch (err: unknown) {
    if (isKnownApiError(err)) return handleApiError(err, { traceId, endpoint: "/api/expansion/clone" });
    if (err instanceof Error && err.name === "SaasAuthError") return saasGateErrorResponse(err, traceId);
    return NextResponse.json({ ok: false, message: "Clone failed", traceId }, { status: 500 });
  }
}
