import { NextResponse } from "next/server";
import { getPermissionMatrix } from "@/lib/portal/v61/rbac/portal-rbac";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withPortalRoute("launch", async () => {
    return NextResponse.json({ ok: true, matrix: getPermissionMatrix() });
  });
}
