import { NextResponse } from "next/server";

import { uploadTenderIntake } from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
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

    try {
      const result = await uploadTenderIntake({
        organizationId: ctx.organizationId,
        userId: ctx.id,
        buffer,
        fileName,
        mimeType: file.type || undefined,
      });

      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : "UPLOAD_FAILED";
      const status =
        message === "UNSUPPORTED_FILE_TYPE" || message === "EMPTY_TENDER_TEXT" ? 422 : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
