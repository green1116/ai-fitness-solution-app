import { NextRequest, NextResponse } from "next/server";

import { handleStripeWebhook } from "@/lib/billing/stripe/stripe.webhook";
import { isStripeConfigured } from "@/lib/billing/stripe/stripe.client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ ok: false, message: "Stripe not configured" }, { status: 503 });
    }

    const signature = req.headers.get("stripe-signature");
    const payload = await req.text();

    const result = await handleStripeWebhook(payload, signature);

    return NextResponse.json({
      ok: true,
      duplicate: result.duplicate ?? false,
      processed: result.processed?.handled ?? false,
    });
  } catch (err: unknown) {
    console.error("[billing/webhook]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Webhook processing failed" },
      { status: 400 },
    );
  }
}
