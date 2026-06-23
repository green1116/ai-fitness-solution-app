import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { analyzeOrganizationRisks } from "@/lib/portal/v59/risk/risk.intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const risk = await analyzeOrganizationRisks(ctx.organizationId);
  return NextResponse.json({ ok: true, risk });
}
