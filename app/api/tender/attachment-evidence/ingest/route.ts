import { NextRequest, NextResponse } from "next/server";

import { runAttachmentEvidenceIngest } from "@/lib/tender/attachment-evidence";
import type { AttachmentInput } from "@/lib/tender/attachment-evidence/types";
import { buildSemanticGraph } from "@/lib/tender/semantic";
import { analyzeTender } from "@/lib/tender/analyzeTender";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V3.3 Attachment Evidence Ingest API
 *
 * multipart: files[] + optional tenderFile + optional graph JSON field
 * JSON: { attachments: [{ base64, fileName }], graph?, registry? }
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const attachmentInputs: AttachmentInput[] = [];
    let graph: TenderSemanticGraph | undefined;
    let registry: import("@/lib/tender/evidence/types").EvidenceRegistry | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const graphRaw = formData.get("graph");
      if (typeof graphRaw === "string" && graphRaw.trim()) {
        graph = JSON.parse(graphRaw) as TenderSemanticGraph;
      }

      const tenderFile = formData.get("tenderFile");
      if (tenderFile instanceof File && !graph) {
        const buffer = Buffer.from(await tenderFile.arrayBuffer());
        const parsed = await analyzeTender({
          buffer,
          fileName: tenderFile.name,
          mimeType: tenderFile.type,
        });
        graph = buildSemanticGraph(parsed).graph;
      }

      const files = formData.getAll("files");
      for (const f of files) {
        if (!(f instanceof File)) continue;
        attachmentInputs.push({
          buffer: Buffer.from(await f.arrayBuffer()),
          fileName: f.name,
          mimeType: f.type || undefined,
        });
      }
    } else {
      const body = await req.json().catch(() => null);
      graph = (body as { graph?: TenderSemanticGraph })?.graph;
      registry = (body as { registry?: import("@/lib/tender/evidence/types").EvidenceRegistry })
        ?.registry;

      const rawText = String((body as { rawText?: string })?.rawText || "").trim();
      if (!graph && rawText) {
        const parsed = await analyzeTender({ rawText, fileName: "tender.txt" });
        graph = buildSemanticGraph(parsed).graph;
      }

      const listed = (body as { attachments?: Array<{ base64: string; fileName: string; mimeType?: string }> })
        ?.attachments;
      if (listed?.length) {
        for (const a of listed) {
          attachmentInputs.push({
            buffer: Buffer.from(a.base64, "base64"),
            fileName: a.fileName,
            mimeType: a.mimeType,
          });
        }
      }
    }

    if (!attachmentInputs.length) {
      return json(400, {
        ok: false,
        code: "ATTACHMENTS_REQUIRED",
        message: "请上传 files 或提供 attachments 数组",
      });
    }

    const result = await runAttachmentEvidenceIngest({
      attachments: attachmentInputs,
      graph,
      registry,
    });

    return json(200, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "attachment ingest failed";
    console.error("[tender/attachment-evidence/ingest]", err);
    return json(500, {
      ok: false,
      code: "ATTACHMENT_INGEST_ERROR",
      message,
    });
  }
}

export async function GET() {
  return json(200, {
    ok: true,
    version: "3.3",
    message: "OCR Intelligence & Attachment Evidence Layer",
    hint: {
      multipart: {
        files: "一个或多个附件",
        tenderFile: "可选招标正文（用于构建 graph 链接）",
        graph: "可选 JSON 字符串 TenderSemanticGraph",
      },
      phases: ["extract", "classify", "link", "adapt", "ingest"],
    },
  });
}
