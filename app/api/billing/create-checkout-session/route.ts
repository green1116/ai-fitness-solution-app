import { NextRequest, NextResponse } from "next/server";

import { authenticateRequest, SaasAuthError } from "@/lib/auth/auth.service";
import { roleHasPermission } from "@/lib/organization/role.service";
import { createCheckoutSession } from "@/lib/billing/stripe/stripe.checkout";
import { createPendingPayment } from "@/lib/billing/payment/payment.service";
import { getActiveSubscriptionForOrganization } from "@/lib/billing/subscription/subscription.resolver";
import { saasGateErrorResponse } from "@/lib/saas/api-gate";
import type { SaasPlan } from "@/lib/saas/types";
import type { BillingInterval } from "@/lib/billing/stripe/stripe.prices";

export const runtime = "nodejs";

function resolveOrigin(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const headerOrigin = req.headers.get("origin")?.trim();
  if (headerOrigin) return headerOrigin.replace(/\/+$/, "");
  return req.nextUrl.origin.replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = await authenticateRequest(req, body);

    if (
      !roleHasPermission(auth.role, "manage_billing") &&
      !roleHasPermission(auth.role, "manage_subscription")
    ) {
      return NextResponse.json(
        { ok: false, message: "Insufficient permissions to upgrade plan" },
        { status: 403 },
      );
    }

    const plan = String(body?.plan ?? "PRO").toUpperCase() as SaasPlan;
    if (!["BASIC", "PRO", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json({ ok: false, message: "Invalid plan" }, { status: 400 });
    }

    const interval = (body?.interval === "year" ? "year" : "month") as BillingInterval;
    const origin = resolveOrigin(req);
    const organizationId = auth.organizationId;

    const active = await getActiveSubscriptionForOrganization(organizationId);

    const session = await createCheckoutSession({
      organizationId,
      customerEmail: auth.email,
      plan,
      interval,
      successUrl: `${origin}/dashboard?checkout=success&organizationId=${organizationId}`,
      cancelUrl: `${origin}/dashboard?checkout=cancel`,
      stripeCustomerId: active?.stripeCustomerId ?? undefined,
    });

    await createPendingPayment({
      organizationId,
      stripeSessionId: session.sessionId,
      amount: 0,
      currency: "usd",
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.sessionId,
      url: session.url,
      mode: session.mode,
    });
  } catch (err: unknown) {
    if (err instanceof SaasAuthError) {
      return saasGateErrorResponse(err);
    }
    console.error("[billing/create-checkout-session]", err);
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
