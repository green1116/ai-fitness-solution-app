import { NextRequest, NextResponse } from "next/server";

import {
  TENDER_VALIDATION_RUNTIME_CONTRACT,
  normalizeRequirementItem,
  runTenderValidationRuntime,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: TENDER_VALIDATION_RUNTIME_CONTRACT,
    pipeline: TENDER_VALIDATION_RUNTIME_CONTRACT.pipeline.join(" → "),
  });
}

/** POST body: { document, requirements, coverageRuntime, linking?, attachments? } */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    const coverageRuntime = body.coverageRuntime;
    if (!coverageRuntime?.validation) {
      return json(400, {
        ok: false,
        code: "COVERAGE_REQUIRED",
        message: "请先提供 coverageRuntime（调用覆盖运行时或完整 evidence runtime）",
      });
    }

    const requirements = (body.requirements || coverageRuntime.requirements || []).map(
      (r: Parameters<typeof normalizeRequirementItem>[0]) => normalizeRequirementItem(r),
    );

    const document = body.document || {
      documentId: body.documentId || `doc-${Date.now()}`,
      fileName: body.fileName,
      tenderTitle: body.tenderTitle,
    };

    const validation = runTenderValidationRuntime({
      document,
      requirements,
      coverageRuntime,
      linking: body.linking,
      registry: body.registry,
      attachments: body.attachments,
      policy: body.policy,
    });

    return json(200, { ok: true, validation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "validation failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
