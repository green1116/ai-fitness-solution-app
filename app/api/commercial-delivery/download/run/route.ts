import { NextResponse } from "next/server";
import { runDownloadRuntime } from "@/lib/commercial-delivery/download";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runDownloadRuntime({ deploymentId: "download-api" }));
}
