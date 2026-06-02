import { NextRequest, NextResponse } from "next/server";

import { createAttachmentFile } from "@/lib/evidence/attachment";
import {
  DETERMINISTIC_OCR_RUNTIME_CONTRACT,
  runDeterministicOcr,
  toOcrExtraction,
} from "@/lib/evidence/ocr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V3.4-E2 Deterministic OCR Runtime API
 */
export async function GET() {
  return json(200, {
    ok: true,
    contract: DETERMINISTIC_OCR_RUNTIME_CONTRACT,
    pipeline: DETERMINISTIC_OCR_RUNTIME_CONTRACT.pipeline.join(" → "),
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const attachments: Array<{
      buffer: Buffer;
      fileName: string;
      mimeType?: string;
    }> = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const f of formData.getAll("files")) {
        if (!(f instanceof File)) continue;
        attachments.push({
          buffer: Buffer.from(await f.arrayBuffer()),
          fileName: f.name,
          mimeType: f.type || undefined,
        });
      }
    } else {
      const body = (await req.json().catch(() => null)) || {};
      const listed = body.attachments as Array<{
        base64: string;
        fileName: string;
        mimeType?: string;
      }>;
      if (listed?.length) {
        for (const a of listed) {
          attachments.push({
            buffer: Buffer.from(a.base64, "base64"),
            fileName: a.fileName,
            mimeType: a.mimeType,
          });
        }
      }
    }

    if (!attachments.length) {
      return json(400, {
        ok: false,
        code: "ATTACHMENTS_REQUIRED",
        message: "请上传 files 或提供 attachments",
      });
    }

    const documents = [];
    for (const att of attachments) {
      const file = createAttachmentFile(att);
      const doc = await runDeterministicOcr({
        attachmentId: file.id,
        fileName: file.fileName,
        mimeType: file.mimeType,
        buffer: att.buffer,
        sha256: file.sha256,
      });
      documents.push({
        document: doc,
        extraction: toOcrExtraction(doc),
      });
    }

    return json(200, {
      ok: true,
      version: DETERMINISTIC_OCR_RUNTIME_CONTRACT.version,
      count: documents.length,
      documents,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ocr failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
