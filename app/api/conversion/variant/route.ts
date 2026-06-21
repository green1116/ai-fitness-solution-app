import { NextRequest, NextResponse } from "next/server";

import {
  splitAndTrack,
  generateCTAVariants,
  generateLandingVariants,
  recordAbEvent,
} from "@/lib/conversion/conversion.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const visitorKey = String(body?.visitorKey ?? body?.sessionId ?? `anon-${Date.now()}`);
    const experimentType = String(body?.experimentType ?? "cta") as "landing" | "cta" | "demo" | "pricing";

    if (experimentType === "cta") {
      const variants = generateCTAVariants();
      const chosen = splitAndTrack({
        visitorKey,
        experimentId: "cro-cta-primary",
        experimentType: "cta",
        variants,
      });
      return NextResponse.json({
        ok: true,
        variant: { id: chosen.id, label: chosen.label, href: chosen.href, style: chosen.style },
      });
    }

    if (experimentType === "landing") {
      const variants = generateLandingVariants();
      const chosen = splitAndTrack({
        visitorKey,
        experimentId: "cro-landing-hero",
        experimentType: "landing",
        variants,
      });
      return NextResponse.json({ ok: true, variant: chosen });
    }

    return NextResponse.json({ ok: false, message: "unsupported experimentType" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "variant assignment failed" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const experimentType = String(body?.experimentType ?? "cta") as "landing" | "cta" | "demo" | "pricing";
    const variantId = String(body?.variantId ?? "");
    const eventType = String(body?.eventType ?? "click") as "click" | "conversion";

    if (!variantId) {
      return NextResponse.json({ ok: false, message: "variantId required" }, { status: 400 });
    }

    const experimentIds: Record<string, string> = {
      landing: "cro-landing-hero",
      cta: "cro-cta-primary",
      demo: "cro-demo-flow",
      pricing: "cro-pricing-layout",
    };

    recordAbEvent({
      experimentId: experimentIds[experimentType] ?? "cro-cta-primary",
      variantId,
      experimentType,
      eventType,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "track failed" },
      { status: 500 },
    );
  }
}
