import { NextRequest, NextResponse } from "next/server";

import { createAttachmentFile } from "@/lib/evidence/attachment";
import {
  EVIDENCE_LINKING_RUNTIME_CONTRACT,
  normalizeRequirementItem,
  runDeterministicOcr,
  runEvidenceLinkingRuntime,
} from "@/lib/evidence";
import { createEmptyRegistry, ingestEvidenceRecord } from "@/lib/evidence/registry";
import { classifyOcrExtraction } from "@/lib/evidence/semantic";
import { toOcrExtraction } from "@/lib/evidence/ocr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    contract: EVIDENCE_LINKING_RUNTIME_CONTRACT,
    pipeline: EVIDENCE_LINKING_RUNTIME_CONTRACT.pipeline.join(" → "),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};
    const requirements = (body.requirements || []).map(
      (r: Parameters<typeof normalizeRequirementItem>[0]) => normalizeRequirementItem(r),
    );

    if (!requirements.length) {
      return json(400, { ok: false, code: "REQUIREMENTS_REQUIRED", message: "请提供 requirements" });
    }

    const attachments = body.attachments as Array<{
      base64: string;
      fileName: string;
      mimeType?: string;
    }>;
    if (!attachments?.length) {
      return json(400, { ok: false, code: "ATTACHMENTS_REQUIRED", message: "请提供 attachments" });
    }

    let registry = createEmptyRegistry();
    const ocrDocuments = [];
    const classifications = [];

    for (const att of attachments) {
      const buffer = Buffer.from(att.base64, "base64");
      const file = createAttachmentFile({
        buffer,
        fileName: att.fileName,
        mimeType: att.mimeType,
      });
      const doc = await runDeterministicOcr({
        attachmentId: file.id,
        fileName: file.fileName,
        mimeType: file.mimeType,
        buffer,
        sha256: file.sha256,
      });
      ocrDocuments.push(doc);
      const extraction = toOcrExtraction(doc);
      const classification = classifyOcrExtraction(extraction);
      classifications.push(classification);
      registry = ingestEvidenceRecord(registry, {
        extraction,
        classification,
        provenance: {
          sourceKind: "attachment",
          sourceId: file.id,
          runtimeRunId: "api-linking",
          phaseId: "registry",
          ingestedAt: new Date().toISOString(),
        },
      });
    }

    const linking = runEvidenceLinkingRuntime({
      requirements,
      ocrDocuments,
      classifications,
      registry,
      minLinkScore: body.minLinkScore,
    });

    return json(200, { ok: true, linking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "linking failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
