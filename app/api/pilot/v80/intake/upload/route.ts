import { NextResponse } from "next/server";

import { uploadTenderIntake } from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ ok: false, code: "FORM_PARSE_FAILED" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, code: "FILE_REQUIRED" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = String(file.name || "tender-upload").trim();
    const sessionId = String(formData.get("sessionId") ?? "").trim() || undefined;
    const docTypeRaw = String(formData.get("docType") ?? "").trim();
    const docType = (
      ["primary", "addendum", "annex", "drawing", "qa", "other"] as const
    ).includes(docTypeRaw as "primary")
      ? (docTypeRaw as "primary" | "addendum" | "annex" | "drawing" | "qa" | "other")
      : undefined;

    try {
      const result = await uploadTenderIntake({
        organizationId: ctx.organizationId,
        userId: ctx.id,
        buffer,
        fileName,
        mimeType: file.type || undefined,
        sessionId,
        docType,
      });

      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "UPLOAD_FAILED";
      const status =
        message === "UNSUPPORTED_FILE_TYPE" || message === "EMPTY_TENDER_TEXT"
          ? 422
          : message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH"
            ? 404
            : message === "SESSION_FROZEN" ||
                message === "SESSION_LOCKED" ||
                message === "ALREADY_APPROVED" ||
                message === "RELEASE_LOCKED"
              ? 409
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
