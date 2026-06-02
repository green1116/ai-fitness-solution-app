import { NextRequest, NextResponse } from "next/server";

import {
  EVIDENCE_COVERAGE_RUNTIME_CONTRACT,
  normalizeRequirementItem,
  runEvidenceCoverageRuntime,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: EVIDENCE_COVERAGE_RUNTIME_CONTRACT,
    pipeline: EVIDENCE_COVERAGE_RUNTIME_CONTRACT.pipeline.join(" → "),
  });
}

/** POST body: { linking: EvidenceLinkingRuntimeResult, requirements: RequirementInput[] } */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    const linking = body.linking;
    if (!linking?.results) {
      return json(400, {
        ok: false,
        code: "LINKING_REQUIRED",
        message: "请提供 linking 运行时结果（先调用 /api/evidence/linking/run）",
      });
    }

    const requirements = (body.requirements || linking.requirements || []).map(
      (r: Parameters<typeof normalizeRequirementItem>[0]) => normalizeRequirementItem(r),
    );

    const coverage = runEvidenceCoverageRuntime({
      requirements,
      linking,
      policy: body.policy,
    });

    return json(200, { ok: true, coverage });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "coverage failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
