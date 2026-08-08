import { NextResponse } from "next/server";

import {
  answerClarificationQuestion,
  getClarificationSnapshot,
  getIntakeSession,
  runClarificationDetection,
  skipClarificationQuestion,
} from "@/lib/pilot/v80";
import { withPilotRoute } from "@/lib/portal/v61/api/portal-route.helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ sessionId: string }> };

export async function GET(req: Request, { params }: RouteCtx) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }
    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      clarifications: getClarificationSnapshot(sessionId),
    });
  });
}

export async function POST(req: Request, { params }: RouteCtx) {
  return withPilotRoute(req, async (ctx) => {
    if (!ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "ORG_REQUIRED" }, { status: 403 });
    }

    const { sessionId } = await params;
    const session = getIntakeSession(sessionId);
    if (!session || session.organizationId !== ctx.organizationId) {
      return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "detect").trim();

    try {
      if (action === "detect") {
        const result = runClarificationDetection({
          sessionId,
          organizationId: ctx.organizationId,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          clarifications: result.clarifications,
          validation: result.validation,
          requirements: result.session.requirements,
          revision: result.session.requirementsRevision ?? 0,
        });
      }

      if (action === "answer") {
        const questionId = String(body?.questionId ?? "").trim();
        const answer = String(body?.answer ?? "");
        if (!questionId) {
          return NextResponse.json({ ok: false, code: "QUESTION_REQUIRED" }, { status: 400 });
        }
        const result = answerClarificationQuestion({
          sessionId,
          organizationId: ctx.organizationId,
          questionId,
          answer,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          clarifications: result.clarifications,
          requirements: result.requirements,
          validation: result.validation,
          revision: result.revision,
        });
      }

      if (action === "skip") {
        const questionId = String(body?.questionId ?? "").trim();
        if (!questionId) {
          return NextResponse.json({ ok: false, code: "QUESTION_REQUIRED" }, { status: 400 });
        }
        const result = skipClarificationQuestion({
          sessionId,
          organizationId: ctx.organizationId,
          questionId,
          actorId: ctx.id,
          forceBlocking: body?.forceBlocking === true,
        });
        return NextResponse.json({
          ok: true,
          clarifications: result.clarifications,
          validation: result.validation,
          requirements: result.session.requirements,
          revision: result.session.requirementsRevision ?? 0,
        });
      }

      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "CLARIFY_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" ||
        message === "ORG_MISMATCH" ||
        message === "QUESTION_NOT_FOUND"
          ? 404
          : message === "SESSION_FROZEN" ||
              message === "SESSION_LOCKED" ||
              message === "ALREADY_APPROVED" ||
              message === "RELEASE_LOCKED"
            ? 409
            : message === "ANSWER_REQUIRED" ||
                message === "NO_CLARIFICATION_STATE" ||
                message === "BLOCKING_SKIP_NOT_ALLOWED"
              ? 400
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
