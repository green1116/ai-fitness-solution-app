import { NextResponse } from "next/server";
import { guardProductionApiRoute } from "@/lib/http/productionRouteGuard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blocked = guardProductionApiRoute("/api/pay/fake-success");
  if (blocked) return blocked;

  try {
    const { projectId } = (await req.json()) as { projectId?: string };
    if (!projectId) {
      return NextResponse.json({ success: false, error: "projectId is required" }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      token: `paid-${projectId}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
