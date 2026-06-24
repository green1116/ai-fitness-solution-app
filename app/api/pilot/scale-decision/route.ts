import { NextResponse } from "next/server";
import { evaluateScaleDecision } from "@/lib/portal/v62/scale/scale-decision.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async (ctx) => {
    const scaleDecision = evaluateScaleDecision(ctx.organizationId ?? undefined);
    return NextResponse.json({ ok: true, scaleDecision });
  });
}
