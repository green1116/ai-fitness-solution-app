import { NextResponse } from "next/server";

import { validateIntakeSession, type TenderRequirements } from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.sessionId ?? "").trim();
    if (!sessionId) {
      return NextResponse.json({ ok: false, code: "SESSION_REQUIRED" }, { status: 400 });
    }

    const validation = validateIntakeSession({
      sessionId,
      organizationId: ctx.organizationId,
      requirements: body?.requirements as TenderRequirements | undefined,
      actorId: ctx.id,
    });

    return NextResponse.json({
      ok: validation.valid,
      validation,
    });
  });
}
