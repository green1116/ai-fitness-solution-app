// app/api/debug/env/route.ts
import { NextResponse } from "next/server";
import { blockDebugInProduction } from "@/lib/http/productionRouteGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mask(s?: string) {
  if (!s) return null;
  if (s.length <= 8) return "***";
  return s.slice(0, 4) + "..." + s.slice(-4);
}

export async function GET() {
  const blocked = blockDebugInProduction();
  if (blocked) return blocked;

  return NextResponse.json({
    ok: true,
    PAY_WEBHOOK_SECRET: mask(process.env.PAY_WEBHOOK_SECRET),
    DEFAULT_MAX_DOWNLOADS: process.env.DEFAULT_MAX_DOWNLOADS ?? null,
    LICENSE_TTL_DAYS: process.env.LICENSE_TTL_DAYS ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
  });
}
