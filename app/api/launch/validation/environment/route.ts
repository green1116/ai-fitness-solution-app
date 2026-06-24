import { NextResponse } from "next/server";
import { validateProductionEnvironment } from "@/lib/portal/v61/validation/environment-validation.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    const environment = await validateProductionEnvironment();
    return NextResponse.json({ ok: true, environment });
  });
}
