import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { buildExecutiveDashboard } from "@/lib/portal/v59/aggregation/executive.intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const executive = await buildExecutiveDashboard(ctx.organizationId, ctx.id);
  return NextResponse.json({ ok: true, executive });
}
