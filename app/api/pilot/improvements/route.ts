import { NextResponse } from "next/server";
import { buildOperationalImprovementLog } from "@/lib/portal/v62/improvements/operational-improvements.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async () => {
    const log = buildOperationalImprovementLog();
    return NextResponse.json({ ok: true, log });
  });
}
