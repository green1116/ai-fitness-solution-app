import { NextResponse } from "next/server";
import { validateSchemaMigrations } from "@/lib/portal/v61_1/validation/schema-validation.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    const report = await validateSchemaMigrations();
    return NextResponse.json({ ok: true, report });
  });
}
