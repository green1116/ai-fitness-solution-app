import { NextRequest, NextResponse } from "next/server";

import { queryEvidenceRegistry } from "@/lib/tender/evidence/query";
import type { EvidenceQueryFilters } from "@/lib/tender/evidence/query/types";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V2.7 只读查询端点 — 在已有 EvidenceRegistry 上查询（不重新 build）
 *
 * POST { registry, matrix?, coverage?, filters? }
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

    const filters = (body as { filters?: EvidenceQueryFilters })?.filters;
    const matrix = (body as { matrix?: import("@/lib/tender/evidence/types").TenderEvidenceMatrixRow[] })
      ?.matrix;
    const coverage = (
      body as {
        coverage?: import("@/lib/tender/evidence/types").RequirementCoverageResult[];
      }
    )?.coverage;

    const query = queryEvidenceRegistry(
      registry,
      matrix ?? [],
      coverage ?? [],
      filters,
    );

    return json(200, {
      ok: true,
      query,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "evidence query failed";
    console.error("[tender/evidence/query]", err);
    return json(500, {
      ok: false,
      code: "EVIDENCE_QUERY_FAILED",
      message,
    });
  }
}
