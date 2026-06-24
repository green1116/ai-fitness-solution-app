import { NextResponse } from "next/server";
import {
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
  submitPilotFeedback,
} from "@/lib/portal/v62/store/pilot-feedback.store";
import { recordPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    const body = await req.json().catch(() => ({}));
    const category = String(body?.category ?? "UX").toUpperCase() as FeedbackCategory;
    const message = String(body?.message ?? "").trim();

    if (!message) {
      return NextResponse.json({ ok: false, code: "MESSAGE_REQUIRED" }, { status: 400 });
    }
    if (!FEEDBACK_CATEGORIES.includes(category)) {
      return NextResponse.json({ ok: false, code: "INVALID_CATEGORY" }, { status: 400 });
    }

    const feedback = submitPilotFeedback({
      organizationId: ctx.organizationId!,
      userId: ctx.id,
      category,
      message,
    });
    recordPilotTelemetry({
      name: "feedback_submitted",
      organizationId: ctx.organizationId!,
      userId: ctx.id,
      success: true,
      meta: { feedbackId: feedback.id, category },
    });

    return NextResponse.json({ ok: true, feedback });
  });
}
