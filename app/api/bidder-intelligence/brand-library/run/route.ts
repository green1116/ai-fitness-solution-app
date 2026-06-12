import { NextResponse } from "next/server";
import { runBrandLibraryRuntime } from "@/lib/bidder-intelligence/brand-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runBrandLibraryRuntime({ deploymentId: "brand-library-api" }));
}
