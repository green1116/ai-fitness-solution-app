import { NextRequest, NextResponse } from "next/server";

import {
  buildRuntimeRecommendations,
  buildTenderRuntimeDecision,
  computeRuntimeScoringImpact,
} from "@/lib/tender/runtime/decision";
import { summarizeEvidenceMatrix } from "@/lib/tender/evidence/matrix";
import type { EvidenceAdapterResult } from "@/lib/tender/evidence/bridge/buildEvidenceFromPipeline";
import { buildEvidenceDecision } from "@/lib/tender/evidence/runtime/buildEvidenceDecision";
import type { BidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V2.9 Decision API — 在已有 evidence + gate 结果上重算统一决策（不跑完整 workflow）
 *
 * POST { evidence?, gate?, graph?, forceAllow? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const registry = (body as { registry?: EvidenceRegistry })?.registry;
    const evidenceFromBody = (body as { evidence?: EvidenceAdapterResult })?.evidence;
    const gate = (body as { gate?: BidDecisionGateResult })?.gate;
    const graph = (body as { graph?: import("@/lib/tender/semantic/types").TenderSemanticGraph })?.graph;
    const forceAllow = (body as { forceAllow?: boolean })?.forceAllow === true;

    let evidence: EvidenceAdapterResult | undefined = evidenceFromBody;

    if (!evidence && registry?.documents) {
      const matrix =
        (body as { matrix?: import("@/lib/tender/evidence/types").TenderEvidenceMatrixRow[] })
          ?.matrix ?? [];
      const coverage =
        (body as { coverage?: import("@/lib/tender/evidence/types").RequirementCoverageResult[] })
          ?.coverage ?? [];
      const matrixSummary = summarizeEvidenceMatrix(matrix);
      evidence = {
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
    }

    if (!evidence) {
      return json(400, {
        ok: false,
        code: "EVIDENCE_REQUIRED",
        message: "请提供 evidence 或 registry",
      });
    }

    const evidenceDecision = buildEvidenceDecision({
      coverage: evidence.coverage,
      documentsCount: evidence.registry.documents.length,
      linksCount: evidence.registry.links.length,
      forceAllow: false,
    });

    const scoreRatio = gate?.meta.scoreRatio ?? null;
    const scoringImpact = computeRuntimeScoringImpact({
      evidence,
      graph,
      scoreRatio,
    });

    const decision = buildTenderRuntimeDecision({
      evidenceDecision,
      gate,
      steps: [],
      forceAllow,
      scoreRatio,
    });

    const recommendations = buildRuntimeRecommendations({
      evidenceDecision,
      gate,
      scoringImpact,
    });

    return json(200, {
      ok: true,
      decision,
      recommendations,
      scoringImpact,
      evidenceDecision,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "runtime decision failed";
    console.error("[tender/runtime/decision]", err);
    return json(500, {
      ok: false,
      code: "DECISION_ERROR",
      message,
    });
  }
}
