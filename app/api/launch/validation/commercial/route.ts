import { NextResponse } from "next/server";
import { validateCommercialWorkflow } from "@/lib/portal/v61/validation/commercial-workflow.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    const commercial = validateCommercialWorkflow();
    return NextResponse.json({ ok: true, commercial });
  });
}
