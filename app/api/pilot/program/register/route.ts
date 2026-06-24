import { NextResponse } from "next/server";
import {
  ensurePilotEnrollment,
  buildPilotProgramReport,
} from "@/lib/portal/v62/pilot/pilot-program.engine";
import { registerPilotProject } from "@/lib/portal/v62/store/pilot-registry.store";
import { recordPilotTelemetry } from "@/lib/portal/v62/store/pilot-telemetry.store";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "enroll");

    if (action === "enroll") {
      ensurePilotEnrollment({
        organizationId: ctx.organizationId!,
        organizationName: String(body?.organizationName ?? ctx.organizationId!),
        userId: ctx.id,
        userEmail: ctx.email,
      });
      recordPilotTelemetry({
        name: "pilot_registered",
        organizationId: ctx.organizationId!,
        userId: ctx.id,
        success: true,
      });
    } else if (action === "register_project") {
      const projectId = String(body?.projectId ?? "").trim();
      if (!projectId) {
        return NextResponse.json({ ok: false, code: "PROJECT_ID_REQUIRED" }, { status: 400 });
      }
      registerPilotProject({
        projectId,
        organizationId: ctx.organizationId!,
        name: body?.name ? String(body.name) : undefined,
      });
      recordPilotTelemetry({
        name: "project_created",
        organizationId: ctx.organizationId!,
        userId: ctx.id,
        projectId,
        success: true,
      });
    }

    const report = buildPilotProgramReport(ctx.organizationId ?? undefined);
    return NextResponse.json({ ok: true, report });
  });
}
