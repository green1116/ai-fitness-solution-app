import { NextRequest, NextResponse } from "next/server";

import { runEvidenceDecisionOnly } from "@/lib/tender/evidence/runtime";
import { summarizeEvidenceMatrix } from "@/lib/tender/evidence/matrix";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import type {
  RequirementCoverageResult,
  TenderEvidenceMatrixRow,
} from "@/lib/tender/evidence/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V2.8 Trace API — 在已有 registry 上重跑决策并输出 trace（不重新 ingest）
 *
 * POST { registry, matrix?, coverage?, runtimePolicy?, forceAllow? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const registry = (body as { registry?: EvidenceRegistry })?.registry;

    if (!registry?.documents) {
      return json(400, {
        ok: false,
        code: "REGISTRY_REQUIRED",
        message: "请提供 registry（含 documents / links）",
      });
    }

    const matrix =
      (body as { matrix?: TenderEvidenceMatrixRow[] })?.matrix ?? [];
    const coverage =
      (body as { coverage?: RequirementCoverageResult[] })?.coverage ?? [];
    const matrixSummary = summarizeEvidenceMatrix(matrix);

    const evidence = {
      registry,
      matrix,
      coverage,
      summary: {
        ...matrixSummary,
        documentsCount: registry.documents.length,
        linksCount: registry.links.length,
        payloadsCollected: 0,
      },
    };

    const runtimeResult = runEvidenceDecisionOnly(evidence, {
      policy: (body as { runtimePolicy?: import("@/lib/tender/evidence/runtime/types").EvidenceDecisionPolicy })
        ?.runtimePolicy,
      forceAllow: (body as { forceAllow?: boolean })?.forceAllow,
    });

    return json(200, {
      ok: true,
      trace: runtimeResult.trace,
      decision: runtimeResult.decision,
      stages: runtimeResult.stages,
      ranAt: runtimeResult.ranAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "evidence trace failed";
    console.error("[tender/evidence/trace]", err);
    return json(500, {
      ok: false,
      code: "EVIDENCE_TRACE_FAILED",
      message,
    });
  }
}
