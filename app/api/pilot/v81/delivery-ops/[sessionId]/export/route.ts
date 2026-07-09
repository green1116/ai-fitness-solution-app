import { NextResponse } from "next/server";

import {
  buildDeliveryExportBundle,
  serializeDeliveryExportBundle,
} from "@/lib/pilot/v81";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(_req: Request, { params }: RouteCtx) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    try {
      const bundle = await buildDeliveryExportBundle(sessionId, ctx.organizationId);
      const json = serializeDeliveryExportBundle(bundle);
      const filename = `delivery-export-${bundle.releasePackageId}.json`;

      return new NextResponse(json, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Read-Only": "true",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "EXPORT_FAILED";
      const status = message === "NOT_RELEASED" ? 404 : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
