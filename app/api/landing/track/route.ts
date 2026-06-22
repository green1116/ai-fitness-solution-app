import { NextRequest, NextResponse } from "next/server";

import {
  trackLandingView,
  trackDemoStart,
  trackDemoComplete,
  trackSignupClick,
  trackConversion,
} from "@/lib/landing/conversion/conversion.tracker";
import { trackFunnelStage } from "@/lib/landing/conversion/funnel.tracker";

const HANDLERS: Record<string, (body: Record<string, unknown>) => void> = {
  landing_view: (body) =>
    trackLandingView({
      path: String(body.path ?? "/"),
      utmSource: body.utmSource as string | undefined,
    }),
  demo_start: (body) =>
    trackDemoStart({
      companyName: body.companyName as string | undefined,
      sessionId: body.sessionId as string | undefined,
    }),
  demo_complete: (body) =>
    trackDemoComplete({
      sessionId: body.sessionId as string | undefined,
      hasQuote: true,
      hasBudget: true,
      hasTender: true,
    }),
  signup_click: (body) =>
    trackSignupClick({
      source: body.source as string | undefined,
      cta: body.cta as string | undefined,
    }),
  conversion: (body) =>
    trackConversion({
      stage: body.stage as "visitor" | "demo" | "signup" | "activation",
      userId: body.userId as string | undefined,
      organizationId: body.organizationId as string | undefined,
    }),
  funnel: (body) => trackFunnelStage(body.stage as "landing", body as Record<string, unknown>),
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const event = String(body?.event ?? "").trim();
  const handler = HANDLERS[event];

  if (!handler) {
    return NextResponse.json({ ok: false, message: "unknown event" }, { status: 400 });
  }

  handler(body);
  return NextResponse.json({ ok: true, event });
}
