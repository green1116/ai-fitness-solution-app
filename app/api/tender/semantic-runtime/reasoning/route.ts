import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { buildEvidenceFromPipeline } from "@/lib/tender/evidence/bridge";
import { buildTechnicalCompliancePackage } from "@/lib/tender/compliance";
import { buildSemanticGraph } from "@/lib/tender/semantic";
import { buildSkuMappings } from "@/lib/tender/sku";
import { runSemanticRuntimeReasoning } from "@/lib/tender/semantic-runtime";
import type { SemanticRuntimeReasoningInput } from "@/lib/tender/semantic-runtime/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V3.2 Semantic Runtime Reasoning API
 *
 * POST { rawText?, graph?, registry?, intelligence?, policy?, forceAllow? }
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: SemanticRuntimeReasoningInput | null = null;
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
      const sourceName = String(file.name || "tender.pdf").trim();
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await analyzeTender({
        buffer,
        fileName: sourceName,
        mimeType: file.type,
      });
      metadata = parsed.metadata;
      const graph = buildSemanticGraph(parsed).graph;
      const sku = buildSkuMappings(graph);
      const compliance = buildTechnicalCompliancePackage({ graph, skuResult: sku });
      const evidence = buildEvidenceFromPipeline({ graph, compliance, skuResult: sku });
      body = { graph, registry: evidence.registry, sourceName };
    } else {
      body = (await req.json().catch(() => null)) as SemanticRuntimeReasoningInput | null;
      const rawText = String(
        (body as { rawText?: string })?.rawText || "",
      ).trim();

      if (!body?.graph && !body?.intelligence && rawText) {
        const parsed = await analyzeTender({
          rawText,
          fileName: (body as { sourceName?: string })?.sourceName || "pasted.txt",
        });
        const graph = buildSemanticGraph(parsed).graph;
        const sku = buildSkuMappings(graph);
        const compliance = buildTechnicalCompliancePackage({ graph, skuResult: sku });
        const evidence = buildEvidenceFromPipeline({ graph, compliance, skuResult: sku });
        body = { ...body, graph, registry: evidence.registry, sourceName: body?.sourceName };
      }
    }

    if (!body?.intelligence && !body?.graph) {
      return json(400, {
        ok: false,
        code: "INPUT_REQUIRED",
        message: "请提供 intelligence、graph 或 rawText",
      });
    }

    const result = runSemanticRuntimeReasoning(body);
    return json(200, { ok: true, metadata, reasoning: result });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "semantic runtime reasoning failed";
    console.error("[tender/semantic-runtime/reasoning]", err);
    return json(500, {
      ok: false,
      code: "SEMANTIC_RUNTIME_ERROR",
      message,
    });
  }
}

export async function GET() {
  return json(200, {
    ok: true,
    version: "3.2",
    message: "Semantic Runtime Reasoning Engine",
    hint: {
      phases: ["vocabulary", "intent", "profile", "match", "coverage", "decide"],
      body: { rawText: "<招标文本>" },
      response: {
        decision: "SemanticRuntimeDecision (allow|warn|block)",
        vocabulary: "SemanticVocabulary",
        intents: "RequirementIntent[]",
        profiles: "EvidenceSemanticProfile[]",
        matches: "SemanticMatchResult[]",
      },
    },
  });
}
