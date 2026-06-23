import { NextResponse } from "next/server";
import { buildLaunchReadinessScores } from "@/lib/portal/v61/launch/launch-readiness.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async (ctx) => {
    const readiness = await buildLaunchReadinessScores(ctx.organizationId!);
    return NextResponse.json({ ok: true, readiness });
  });
}
