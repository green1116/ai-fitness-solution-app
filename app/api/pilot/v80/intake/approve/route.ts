import { NextResponse } from "next/server";

import {
  IntakeQaError,
  IntakeValidationError,
  approveTenderIntake,
  validateIntakeSession,
  type TenderRequirements,
} from "@/lib/pilot/v80";
import { withPortalRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return withPortalRoute("pilot", async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.sessionId ?? "").trim();
    if (!sessionId) {
      return NextResponse.json({ ok: false, code: "SESSION_REQUIRED" }, { status: 400 });
    }

    const precheck = validateIntakeSession({
      sessionId,
      organizationId: ctx.organizationId,
      requirements: body?.requirements as TenderRequirements | undefined,
      actorId: ctx.id,
    });
    if (!precheck.valid) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_FAILED", errors: precheck.errors },
        { status: 422 },
      );
    }

    try {
      const result = await approveTenderIntake({
        sessionId,
        organizationId: ctx.organizationId,
        userId: ctx.id,
        userEmail: ctx.email,
        requirements: body?.requirements as TenderRequirements | undefined,
      });

      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      if (err instanceof IntakeQaError) {
        return NextResponse.json(
          {
            ok: false,
            code: err.code,
            message: err.message,
            checks: err.checks,
          },
          { status: 422 },
        );
      }
      if (err instanceof IntakeValidationError) {
        return NextResponse.json(
          { ok: false, code: err.code, errors: err.errors },
          { status: 422 },
        );
      }
      const message = err instanceof Error ? err.message : "APPROVE_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH"
          ? 404
          : message === "APPROVE_IN_PROGRESS"
            ? 409
            : message === "PARTIAL_WRITE_DETECTED"
              ? 409
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
