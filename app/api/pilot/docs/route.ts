import { NextResponse } from "next/server";
import { getPilotDocumentation } from "@/lib/portal/v62/docs/pilot-docs";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("pilot", async () => {
    return NextResponse.json({ ok: true, docs: getPilotDocumentation() });
  });
}
