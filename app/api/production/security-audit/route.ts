import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { runSecurityAudit } from "@/lib/portal/v60/audit/security-audit.engine";
import { withReadonlyCache, READONLY_CACHE_TTL_MS } from "@/lib/portal/v60/cache/readonly-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const audit = await withReadonlyCache(
    "production:security-audit",
    READONLY_CACHE_TTL_MS.productionAudit,
    async () => runSecurityAudit(),
  );

  return NextResponse.json({ ok: true, audit });
}
