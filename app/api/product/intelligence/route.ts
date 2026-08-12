import { NextResponse } from "next/server";
import { getProductIntelligenceView } from "@/lib/product/intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * EPI-WP2 Product Intelligence API — readonly GET.
 * Returns existing EPI-WP1 ProductIntelligenceView only; no writes, no execution.
 */
export async function GET() {
  return NextResponse.json(getProductIntelligenceView());
}
