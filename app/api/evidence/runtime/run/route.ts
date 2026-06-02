import { NextRequest, NextResponse } from "next/server";

import {
  EXTERNAL_EVIDENCE_RUNTIME_CONTRACT,
  runExternalEvidenceRuntime,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

/**
 * V3.4-E1 External Evidence Runtime API（独立于 /api/tender）
 */
export async function GET() {
  return json(200, {
    ok: true,
    contract: EXTERNAL_EVIDENCE_RUNTIME_CONTRACT,
    endpoint: "POST multipart files + optional requirements JSON",
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
    let requirements: import("@/lib/evidence").RequirementAnchor[] | undefined;
    let minLinkScore: number | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files");
      for (const f of files) {
        if (!(f instanceof File)) continue;
        attachments.push({
          buffer: Buffer.from(await f.arrayBuffer()),
          fileName: f.name,
          mimeType: f.type || undefined,
        });
      }

      const reqJson = formData.get("requirements");
      if (typeof reqJson === "string" && reqJson.trim()) {
        const parsed = JSON.parse(reqJson) as { requirements?: typeof requirements };
        requirements = parsed.requirements;
        minLinkScore = (parsed as { minLinkScore?: number }).minLinkScore;
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
      requirements = body.requirements;
      minLinkScore = body.minLinkScore;
    }

    if (!attachments.length) {
      return json(400, {
        ok: false,
        code: "ATTACHMENTS_REQUIRED",
        message: "请上传 files 或提供 attachments",
      });
    }

    const result = await runExternalEvidenceRuntime({
      attachments,
      requirements,
      minLinkScore,
    });

    if (!result.ok) {
      return json(422, result);
    }

    return json(200, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "runtime failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
