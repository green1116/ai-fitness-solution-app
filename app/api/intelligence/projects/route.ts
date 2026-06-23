import { NextRequest, NextResponse } from "next/server";
import { getPortalUserContext } from "@/lib/portal/v57/auth-context";
import {
  getProjectIntelligenceDetail,
  listProjectIntelligence,
} from "@/lib/portal/v59/aggregation/project.intelligence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ctx = await getPortalUserContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ ok: false, code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (projectId) {
    const detail = await getProjectIntelligenceDetail(ctx.organizationId, projectId);
    if (!detail) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, project: detail });
  }

  const projects = await listProjectIntelligence(ctx.organizationId);
  return NextResponse.json({ ok: true, projects });
}
