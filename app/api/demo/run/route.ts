import { NextRequest, NextResponse } from "next/server";

import { runDemoOrchestrator } from "@/lib/demo/demo.orchestrator";
import { fallbackDemoResponse } from "@/lib/demo/demo.fallback";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const companyName = String(body?.companyName ?? "").trim();

    if (!companyName) {
      return NextResponse.json({ ok: false, message: "companyName required" }, { status: 400 });
    }

    const result = runDemoOrchestrator({
      companyName,
      companySize: body?.companySize,
      goal: body?.goal,
      industry: body?.industry,
    });

    return NextResponse.json({ ok: true, result });
  } catch {
    const fallback = fallbackDemoResponse({ companyName: "Demo" });
    return NextResponse.json({
      ok: true,
      result: {
        sessionId: `demo-fallback-${Date.now()}`,
        company: { companyName: "Demo" },
        ...fallback,
        upsellPrompts: ["Unlock full PDF", "Generate full tender", "Save your project", "Get enterprise version"],
        generatedAt: new Date().toISOString(),
        runtimeStub: "demo-fallback",
      },
    });
  }
}
