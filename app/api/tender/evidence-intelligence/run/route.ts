import { NextRequest, NextResponse } from "next/server";

import { analyzeTender } from "@/lib/tender/analyzeTender";
import { buildTechnicalCompliancePackage } from "@/lib/tender/compliance";
import { runExternalEvidenceIntelligence } from "@/lib/tender/evidence-intelligence";
import type { ExternalEvidenceIntelligenceInput } from "@/lib/tender/evidence-intelligence/types";
import { buildSemanticGraph } from "@/lib/tender/semantic";
import { buildSkuMappings } from "@/lib/tender/sku";
import type { AttachmentInput } from "@/lib/tender/attachment-evidence/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V3.4 External Evidence Intelligence Runtime API
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const attachmentInputs: AttachmentInput[] = [];
    let body: Partial<ExternalEvidenceIntelligenceInput> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files");
      for (const f of files) {
        if (!(f instanceof File)) continue;
        attachmentInputs.push({
          buffer: Buffer.from(await f.arrayBuffer()),
          fileName: f.name,
          mimeType: f.type || undefined,
        });
      }

      const tenderFile = formData.get("tenderFile");
      if (tenderFile instanceof File) {
        const buffer = Buffer.from(await tenderFile.arrayBuffer());
        const parsed = await analyzeTender({
          buffer,
          fileName: tenderFile.name,
          mimeType: tenderFile.type,
        });
        const { graph } = buildSemanticGraph(parsed);
        const sku = buildSkuMappings(graph);
        const compliance = buildTechnicalCompliancePackage({ graph, skuResult: sku });
        body.snapshot = { graph, compliance, skuResult: sku };
      }
    } else {
      body = (await req.json().catch(() => null)) || {};
      const listed = (body as { attachments?: Array<{ base64: string; fileName: string; mimeType?: string }> })
        .attachments;
      if (listed?.length) {
        for (const a of listed) {
          attachmentInputs.push({
            buffer: Buffer.from(a.base64, "base64"),
            fileName: a.fileName,
            mimeType: a.mimeType,
          });
        }
      }

      const rawText = String((body as { rawText?: string }).rawText || "").trim();
      if (!body.snapshot?.graph && rawText) {
        const parsed = await analyzeTender({ rawText, fileName: "tender.txt" });
        const { graph } = buildSemanticGraph(parsed);
        const sku = buildSkuMappings(graph);
        const compliance = buildTechnicalCompliancePackage({ graph, skuResult: sku });
        body.snapshot = { graph, compliance, skuResult: sku };
      }
    }

    if (!attachmentInputs.length) {
      return json(400, {
        ok: false,
        code: "ATTACHMENTS_REQUIRED",
        message: "请上传 files 或提供 attachments",
      });
    }

    const result = await runExternalEvidenceIntelligence({
      attachments: attachmentInputs,
      graph: body.graph,
      snapshot: body.snapshot,
      registry: body.registry,
      minLinkScore: body.minLinkScore,
      mergeInternalEvidence: body.mergeInternalEvidence,
      evidencePolicy: body.evidencePolicy,
    });

    if (!result.ok) return json(400, result);
    return json(200, result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "evidence intelligence failed";
    console.error("[tender/evidence-intelligence/run]", err);
    return json(500, { ok: false, code: "EIR_ERROR", message });
  }
}

export async function GET() {
  return json(200, {
    ok: true,
    version: "3.4",
    message: "Tender Evidence Operating System — External Evidence Intelligence Runtime",
    pipeline: [
      "attachment",
      "ocr",
      "classification",
      "linking",
      "registry",
      "coverage",
    ],
    runtimes: ["attachment", "ocr", "classification", "linking", "registry", "coverage"],
  });
}
