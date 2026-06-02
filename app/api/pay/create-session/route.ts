import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type ReqBody = {
  projectId?: string;
  tier?: "pro" | "enterprise";
};

function resolveOrigin(req: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const headerOrigin = req.headers.get("origin")?.trim();
  if (headerOrigin) return headerOrigin.replace(/\/+$/, "");
  return new URL(req.url).origin.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not configured" },
        { status: 500 },
      );
    }

    const { projectId, tier } = (await req.json()) as ReqBody;
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    if (tier !== "pro" && tier !== "enterprise") {
      return NextResponse.json({ error: "tier must be pro or enterprise" }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);
    const origin = resolveOrigin(req);
    const unitAmount = tier === "enterprise" ? 12900 : 2990;
    const displayName =
      tier === "enterprise"
        ? "AI Fitness Solution - Enterprise 投标包"
        : "AI Fitness Solution - Pro 评审版";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: { name: displayName },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/result?success=1&projectId=${encodeURIComponent(projectId)}&tier=${tier}`,
      cancel_url: `${origin}/result?cancel=1&projectId=${encodeURIComponent(projectId)}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
