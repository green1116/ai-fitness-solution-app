import { NextResponse } from "next/server";
import { validateCommercialRegistration } from "@/lib/portal/v61_1/validation/commercial-registration.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    const report = validateCommercialRegistration();
    return NextResponse.json({ ok: true, report });
  });
}
