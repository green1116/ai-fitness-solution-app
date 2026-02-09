import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mask(s?: string) {
  if (!s) return null;
  if (s.length <= 8) return "***";
  return s.slice(0, 4) + "..." + s.slice(-4);
}

export async function GET() {
  const cwd = process.cwd();
  const envLocalAtCwd = path.join(cwd, ".env.local");
  const hasEnvLocal = fs.existsSync(envLocalAtCwd);

  return NextResponse.json({
    ok: true,
    cwd,
    envLocalAtCwd,
    hasEnvLocal,
    PAY_WEBHOOK_SECRET: mask(process.env.PAY_WEBHOOK_SECRET),
    DEFAULT_MAX_DOWNLOADS: process.env.DEFAULT_MAX_DOWNLOADS ?? null,
    LICENSE_TTL_DAYS: process.env.LICENSE_TTL_DAYS ?? null,
  });
}
