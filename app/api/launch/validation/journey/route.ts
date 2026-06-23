import { NextResponse } from "next/server";
import { validateUserJourney } from "@/lib/portal/v61/validation/journey-validation.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    const journey = validateUserJourney();
    return NextResponse.json({ ok: true, journey });
  });
}
