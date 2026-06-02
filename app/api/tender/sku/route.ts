import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { buildSemanticGraph } from "@/lib/tender/semantic";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import { buildEvidenceFromPipeline } from "@/lib/tender/evidence/bridge";
import { packageEvidenceQuery } from "@/lib/tender/evidence/query";
import { buildSkuMappings } from "@/lib/tender/sku";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

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
      const { graph } = buildSemanticGraph(parsed);
      const skuResult = buildSkuMappings(graph);
      const evidence = buildEvidenceFromPipeline({ graph, skuResult });
      const query = packageEvidenceQuery(evidence);
      return json(200, {
        ok: true,
        sourceName,
        metadata: parsed.metadata,
        skuResult,
        requirements: graph.requirements,
        evidence,
        query,
      });
    }

    const body = await req.json().catch(() => null);
    const graph = (body as { graph?: TenderSemanticGraph })?.graph;
    const budgetTier = (body as { budgetTier?: "low" | "mid" | "high" })
      ?.budgetTier;

    if (graph?.requirements) {
      const skuResult = buildSkuMappings(graph, { budgetTier });
      const evidence = buildEvidenceFromPipeline({ graph, skuResult });
      const query = packageEvidenceQuery(evidence);
      return json(200, {
        ok: true,
        sourceName: (body as { sourceName?: string })?.sourceName || null,
        skuResult,
        requirements: graph.requirements,
        evidence,
        query,
      });
    }

    const rawText = String((body as { rawText?: string })?.rawText || "").trim();
    const sourceName = String((body as { sourceName?: string })?.sourceName || "").trim();

    if (!rawText) {
      return json(400, {
        ok: false,
        code: "RAW_TEXT_REQUIRED",
        message: "请上传文件、提供 rawText，或传入 graph",
      });
    }

    const parsed = await analyzeTender({
      rawText,
      fileName: sourceName || "pasted-tender.txt",
    });
    const { graph: builtGraph } = buildSemanticGraph(parsed);
    const skuResult = buildSkuMappings(builtGraph, { budgetTier });
    const evidence = buildEvidenceFromPipeline({
      graph: builtGraph,
      skuResult,
    });
    const query = packageEvidenceQuery(evidence);

    return json(200, {
      ok: true,
      sourceName: sourceName || null,
      metadata: parsed.metadata,
      skuResult,
      requirements: builtGraph.requirements,
      evidence,
      query,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "sku failed";
    console.error("[tender/sku]", err);
    return json(500, {
      ok: false,
      code: "TENDER_SKU_FAILED",
      message,
    });
  }
}
