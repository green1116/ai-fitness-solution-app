import { NextResponse } from "next/server";
import { validateAuthClosure } from "@/lib/portal/v61_1/auth/auth-closure.engine";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    const report = validateAuthClosure();
    return NextResponse.json({ ok: true, report });
  });
}
