import { NextResponse } from "next/server";
import { blockDebugInProduction } from "@/lib/http/productionRouteGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function blocked() {
  const res = blockDebugInProduction();
  if (res) return res;
  return NextResponse.json(
    { ok: false, code: "NOT_FOUND", message: "Not Found" },
    { status: 404 },
  );
}

export async function GET() {
  return blocked();
}

export async function POST() {
  return blocked();
}
