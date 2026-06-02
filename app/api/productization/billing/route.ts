import { NextResponse } from "next/server";
import { buildBillingResponse } from "@/lib/productization/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * V8.8 Subscription & Billing API — readonly GET surface.
 * No Stripe/PayPal; custom pricing placeholder only.
 */
export async function GET() {
  const response = buildBillingResponse({ deploymentId: "subscription-billing-api" });
  return NextResponse.json({
    plans: response.plans,
    subscriptions: response.subscriptions,
    invoices: response.invoices,
    entitlements: response.entitlements,
    summary: response.summary,
  });
}
