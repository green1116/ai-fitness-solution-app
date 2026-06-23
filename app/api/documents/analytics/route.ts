import { NextRequest, NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import {
  DELIVERY_ANALYTICS_EVENTS,
  recordDeliveryAnalytics,
  type DeliveryAnalyticsEventName,
} from "@/lib/portal/v58/analytics/delivery-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const event = String(body?.event ?? "") as DeliveryAnalyticsEventName;
  if (!DELIVERY_ANALYTICS_EVENTS.includes(event)) {
    return NextResponse.json({ ok: false, code: "INVALID_EVENT" }, { status: 400 });
  }

  recordDeliveryAnalytics({
    event,
    userId: ctx.id,
    organizationId: ctx.organizationId,
    projectId: body?.projectId,
    quoteId: body?.quoteId,
    deliveryId: body?.deliveryId,
    meta: body?.meta,
  });

  return NextResponse.json({ ok: true });
}
