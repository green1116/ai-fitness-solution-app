import { NextResponse } from "next/server";
import { reassessGoNoGo } from "@/lib/portal/v61_1/launch/go-no-go-reassessment.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async (ctx) => {
    const reassessment = await reassessGoNoGo(ctx.organizationId ?? undefined);
    return NextResponse.json({ ok: true, reassessment });
  });
}
