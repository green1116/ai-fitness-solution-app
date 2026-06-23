import { NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import { buildIntelligenceAnalytics } from "@/lib/portal/v59/analytics/intelligence-analytics.engine";
import { getDeliveryTrackingSnapshot } from "@/lib/portal/v59/tracking/delivery-tracking.intelligence";
import { analyzeOrganizationVersions } from "@/lib/portal/v59/versioning/version.intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const [analytics, tracking, versions] = await Promise.all([
    Promise.resolve(buildIntelligenceAnalytics(ctx.organizationId)),
    getDeliveryTrackingSnapshot(ctx.organizationId),
    analyzeOrganizationVersions(ctx.organizationId),
  ]);

  return NextResponse.json({
    ok: true,
    analytics,
    tracking,
    versionIntelligence: versions,
  });
}
