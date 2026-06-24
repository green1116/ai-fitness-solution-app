import { NextResponse } from "next/server";
import { buildDebtClosureReport } from "@/lib/portal/v61/debt/debt-closure";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    const debtClosure = buildDebtClosureReport();
    return NextResponse.json({ ok: true, debtClosure });
  });
}
