import { NextRequest, NextResponse } from "next/server";
import { mapScoreGateToPanelGate } from "@/lib/tender/gate/mapScoreGateToPanelGate";
import type { BidDecisionGateResult as ScoreBidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const planId = String(body?.planId || "").trim();
    const rawText = String(
      body?.rawText || body?.tenderRawText || ""
    ).trim();
    const mode = String(body?.mode || "enterprise");

    if (!planId) {
      return NextResponse.json(
        { ok: false, message: "缺少 planId" },
        { status: 400 }
      );
    }

    const origin = new URL(req.url).origin;
    const pre = await fetch(`${origin}/api/tender-pack/precheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({   mode }),
      cache: "no-store",
    });
    const data = await pre.json().catch(() => null);

    if (!pre.ok || !data?.ok || !data?.gate) {
      return NextResponse.json(
        {
          ok: false,
          message: data?.message || "投标包门闸不可用",
        },
        { status: pre.ok ? 502 : pre.status }
      );
    }

    const gate = mapScoreGateToPanelGate(data.gate as ScoreBidDecisionGateResult);

    return NextResponse.json({
      ok: true,
      gate,
    });
  } catch (e) {
    console.error("[/api/tender/gate]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
