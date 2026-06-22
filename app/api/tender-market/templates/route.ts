import { NextRequest, NextResponse } from "next/server";

import { listTemplateMarketplace } from "@/lib/tender-market/tender-market.service";

export async function GET(req: NextRequest) {
  const industry = req.nextUrl.searchParams.get("industry") ?? undefined;
  const freeOnly = req.nextUrl.searchParams.get("freeOnly") === "true";

  const templates = listTemplateMarketplace({
    industry: industry as import("@/lib/expansion/expansion.types").VerticalIndustry | undefined,
    freeOnly: freeOnly || undefined,
  });

  return NextResponse.json({ ok: true, templates });
}
