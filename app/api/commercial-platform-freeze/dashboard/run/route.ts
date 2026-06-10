import { NextResponse } from "next/server";
import { runCommercialPlatformDashboardRuntime } from "@/lib/commercial-platform-freeze/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    runCommercialPlatformDashboardRuntime({ deploymentId: "dashboard-api" }),
  );
}
