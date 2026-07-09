import { NextResponse } from "next/server";

import {
  clientErrorExtras,
  sanitizeProductionClientMessage,
} from "@/lib/http/sanitizeProductionClient";
import { pdfBinaryResponse } from "@/lib/http/binaryArtifact";
import {
  buildTenderPdfFilename,
  renderTenderPackPdfBuffer,
  resolveTenderExportContext,
} from "@/lib/pdf/tenderExportBundle";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function packError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
) {
  const safeMessage = sanitizeProductionClientMessage(
    message,
    status >= 500 ? "标书 PDF 生成失败，请稍后重试" : message,
  );
  const clientExtra = clientErrorExtras(extra);
  const body: Record<string, unknown> = {
    ok: false,
    code,
    message: safeMessage,
  };
  if (clientExtra) Object.assign(body, clientExtra);
  return NextResponse.json(body, { status });
}

function parseProjectId(req: Request, body?: { projectId?: string }): string {
  const url = new URL(req.url);
  return (
    body?.projectId?.trim() ||
    url.searchParams.get("projectId")?.trim() ||
    ""
  );
}

async function handlePackDownload(req: Request, body?: { projectId?: string }) {
  const startedAt = Date.now();
  const projectId = parseProjectId(req, body);
  if (!projectId) {
    return packError(400, "PACK_BAD_REQUEST", "projectId is required");
  }

  try {
    const resolved = await resolveTenderExportContext(req, projectId);
    if (!resolved.ok) {
      return packError(resolved.status, resolved.code, resolved.message, resolved.extra);
    }

    const pdfBuffer = await renderTenderPackPdfBuffer(resolved.ctx);
    if (!pdfBuffer.length) {
      return packError(500, "PACK_PDF_EMPTY", "标书 PDF 为空");
    }

    const fileName = buildTenderPdfFilename(resolved.ctx.project, projectId);

    try {
      await prisma.documentExport.create({
        data: {
          projectId: resolved.ctx.project!.id,
          docType: "tender",
          fileName,
          fileUrl: `/api/pdf/tender/pack?projectId=${projectId}`,
          renderVersion: "v59-pack-1",
          metadata: {
            pdfBytes: pdfBuffer.length,
            tenderId: resolved.ctx.docCtx.tenderId,
            dataSource: resolved.ctx.dataSource,
          },
        },
      });
    } catch (exportErr) {
      console.warn("[PACK] DocumentExport persist failed (non-fatal)", exportErr);
    }

    console.log("[PACK] success", {
      projectId,
      pdfBytes: pdfBuffer.length,
      elapsedMs: Date.now() - startedAt,
    });

    return pdfBinaryResponse(pdfBuffer, fileName);
  } catch (error) {
    console.error("[PACK][FATAL]", error);
    const message = sanitizeProductionClientMessage(
      error instanceof Error ? error.message : "标书 PDF 内部错误",
      "标书 PDF 生成失败，请稍后重试",
    );
    return packError(500, "PACK_INTERNAL_ERROR", message);
  }
}

export async function GET(req: Request) {
  const projectId = new URL(req.url).searchParams.get("projectId")?.trim();
  if (!projectId) {
    return NextResponse.json({
      ok: true,
      route: "/api/pdf/tender/pack",
      methods: ["GET", "POST"],
      hint: "GET/POST with projectId — 成功响应为 application/pdf 二进制",
    });
  }
  return handlePackDownload(req, { projectId });
}

export async function POST(req: Request) {
  const body = (await req.clone().json().catch(() => ({}))) as { projectId?: string };
  return handlePackDownload(req, body);
}
