import { NextResponse } from "next/server";
import { evaluateGoNoGo } from "@/lib/portal/v61/launch/go-no-go.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async (ctx) => {
    const goNoGo = await evaluateGoNoGo(ctx.organizationId!);
    return NextResponse.json({ ok: true, goNoGo });
  });
}
