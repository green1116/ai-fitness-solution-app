import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { buildEvidenceFromPipeline } from "@/lib/tender/evidence/bridge";
import { runSemanticEvidenceReasoning } from "@/lib/tender/semantic-evidence";
import { buildSemanticGraph } from "@/lib/tender/semantic";
import { buildTechnicalCompliancePackage } from "@/lib/tender/compliance";
import { buildSkuMappings } from "@/lib/tender/sku";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V3.1 Semantic Evidence Intelligence API
 *
 * POST { graph?, registry?, rawText?, buildEvidence?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let graph: TenderSemanticGraph | undefined;
    let registry: EvidenceRegistry | undefined;
    let sourceName: string | null = null;
    let metadata: unknown;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return json(400, {
          ok: false,
          code: "FILE_REQUIRED",
          message: "缺少上传文件",
        });
      }
      sourceName = String(file.name || "tender.pdf").trim();
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await analyzeTender({
        buffer,
        fileName: sourceName,
        mimeType: file.type,
      });
      metadata = parsed.metadata;
      graph = buildSemanticGraph(parsed).graph;
    } else {
      const body = await req.json().catch(() => null);
      graph = (body as { graph?: TenderSemanticGraph })?.graph;
      registry = (body as { registry?: EvidenceRegistry })?.registry;
      sourceName = (body as { sourceName?: string })?.sourceName ?? null;
      const rawText = String((body as { rawText?: string })?.rawText || "").trim();
      const buildEvidence = (body as { buildEvidence?: boolean })?.buildEvidence !== false;

      if (!graph && rawText) {
        const parsed = await analyzeTender({
          rawText,
          fileName: sourceName || "pasted-tender.txt",
        });
        graph = buildSemanticGraph(parsed).graph;

        if (buildEvidence) {
          const skuResult = buildSkuMappings(graph);
          const compliance = buildTechnicalCompliancePackage({
            graph,
            skuResult,
          });
          const evidence = buildEvidenceFromPipeline({
            graph,
            compliance,
            skuResult,
          });
          registry = evidence.registry;
        }
      }
    }

    if (!graph?.requirements) {
      return json(400, {
        ok: false,
        code: "GRAPH_REQUIRED",
        message: "请提供 graph 或 rawText",
      });
    }

    const intelligence = runSemanticEvidenceReasoning({
      graph,
      registry,
      sourceName,
    });

    return json(200, {
      ok: true,
      sourceName,
      metadata,
      intelligence,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "semantic evidence failed";
    console.error("[tender/semantic-evidence]", err);
    return json(500, {
      ok: false,
      code: "SEMANTIC_EVIDENCE_ERROR",
      message,
    });
  }
}

export async function GET() {
  return json(200, {
    ok: true,
    version: "3.1",
    message: "Semantic Evidence Intelligence Foundation",
    hint: {
      method: "POST",
      body: {
        rawText: "<招标文本>",
        buildEvidence: true,
      },
      response: {
        intelligence: {
          executionGraph: "SemanticEvidenceExecutionGraph",
          evidenceNeeds: "SemanticEvidenceNeed[]",
          inferences: "SemanticInference[]",
          coverage: "SemanticEvidenceCoverageSummary",
          reasoningTrace: "SemanticReasoningStep[]",
        },
      },
    },
  });
}
