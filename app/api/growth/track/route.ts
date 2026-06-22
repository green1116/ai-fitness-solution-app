import { NextRequest, NextResponse } from "next/server";

import {
  trackSignup,
  trackActivation,
  trackQuoteGenerated,
  trackUpgradeClicked,
  trackPaymentCompleted,
  trackReturnSession,
  trackProjectCreated,
} from "@/lib/growth/analytics.events";
import { trackLandingPageView } from "@/lib/growth/acquisition/landing.analytics";
import { trackCampaignVisit } from "@/lib/growth/acquisition/campaign.tracker";
import type { GrowthEventName } from "@/lib/growth/funnel/growth.funnel.model";

const ALLOWED_EVENTS = new Set<string>([
  "visitor.landing",
  "user.signup",
  "user.activation",
  "project.created",
  "quote.generated",
  "upgrade.clicked",
  "payment.completed",
  "session.return",
  "campaign.visit",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = String(body?.event ?? "") as GrowthEventName | "campaign.visit";

    if (!ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ ok: false, message: "Unsupported growth event" }, { status: 400 });
    }

    const userId = body?.userId ? String(body.userId) : undefined;
    const organizationId = body?.organizationId ? String(body.organizationId) : undefined;

    switch (event) {
      case "visitor.landing":
        trackLandingPageView({
          path: body?.path,
          referrer: body?.referrer,
          utmSource: body?.utmSource,
          utmMedium: body?.utmMedium,
          utmCampaign: body?.utmCampaign,
        });
        break;
      case "campaign.visit":
        trackCampaignVisit({
          campaignId: String(body?.campaignId ?? "unknown"),
          campaignName: body?.campaignName,
          channel: body?.channel,
          utmSource: body?.utmSource,
          utmMedium: body?.utmMedium,
        });
        break;
      case "user.signup":
        if (!userId) return NextResponse.json({ ok: false, message: "userId required" }, { status: 400 });
        trackSignup({ userId, source: body?.source, utmSource: body?.utmSource });
        break;
      case "user.activation":
        if (!userId || !organizationId) {
          return NextResponse.json({ ok: false, message: "userId and organizationId required" }, { status: 400 });
        }
        trackActivation({ userId, organizationId });
        break;
      case "project.created":
        if (!organizationId || !body?.projectId) {
          return NextResponse.json({ ok: false, message: "organizationId and projectId required" }, { status: 400 });
        }
        trackProjectCreated({ userId, organizationId, projectId: String(body.projectId) });
        break;
      case "quote.generated":
        if (!organizationId) {
          return NextResponse.json({ ok: false, message: "organizationId required" }, { status: 400 });
        }
        trackQuoteGenerated({
          userId,
          organizationId,
          projectId: body?.projectId,
          isFirst: Boolean(body?.isFirst),
        });
        break;
      case "upgrade.clicked":
        if (!organizationId || !body?.targetPlan) {
          return NextResponse.json({ ok: false, message: "organizationId and targetPlan required" }, { status: 400 });
        }
        trackUpgradeClicked({
          userId,
          organizationId,
          targetPlan: String(body.targetPlan),
          trigger: body?.trigger,
        });
        break;
      case "payment.completed":
        if (!organizationId || !body?.plan) {
          return NextResponse.json({ ok: false, message: "organizationId and plan required" }, { status: 400 });
        }
        trackPaymentCompleted({
          userId,
          organizationId,
          plan: String(body.plan),
          amount: body?.amount ? Number(body.amount) : undefined,
        });
        break;
      case "session.return":
        if (!userId) return NextResponse.json({ ok: false, message: "userId required" }, { status: 400 });
        trackReturnSession({ userId, organizationId });
        break;
      default:
        return NextResponse.json({ ok: false, message: "Unknown event" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, event });
  } catch (err: unknown) {
    console.error("[growth/track]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Track failed" },
      { status: 500 },
    );
  }
}
