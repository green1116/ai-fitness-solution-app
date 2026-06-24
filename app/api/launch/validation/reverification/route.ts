import { NextResponse } from "next/server";
import { runLaunchReverification } from "@/lib/portal/v61_1/launch/launch-reverification.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async (ctx) => {
    const report = await runLaunchReverification(ctx.organizationId ?? undefined);
    return NextResponse.json({ ok: true, report });
  });
}
