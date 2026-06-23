import { NextRequest, NextResponse } from "next/server";
import {
  PRODUCT_ANALYTICS_EVENTS,
  recordProductAnalytics,
  type ProductAnalyticsEventName,
} from "@/lib/portal/v57/experience/product-analytics";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V57 P3 — Product analytics recording endpoint
 */
export async function POST(req: NextRequest) {
  const ctx = await getPortalUserContext();
  const body = await req.json().catch(() => ({}));
  const event = String(body?.event ?? "") as ProductAnalyticsEventName;

  if (!PRODUCT_ANALYTICS_EVENTS.includes(event)) {
    return NextResponse.json(
      { ok: false, code: "INVALID_EVENT", message: "无效事件类型" },
      { status: 400 },
    );
  }

  const entry = recordProductAnalytics({
    event,
    userId: ctx?.id ?? body?.userId,
    organizationId: ctx?.organizationId ?? body?.organizationId,
    projectId: body?.projectId,
    quoteId: body?.quoteId,
    meta: body?.meta,
  });

  return NextResponse.json({ ok: true, recorded: entry });
}
