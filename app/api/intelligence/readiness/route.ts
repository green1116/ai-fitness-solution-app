import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { computeOrganizationReadiness } from "@/lib/portal/v59/scoring/readiness.engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const readiness = await computeOrganizationReadiness(ctx.organizationId);
  return NextResponse.json({ ok: true, readiness });
}
