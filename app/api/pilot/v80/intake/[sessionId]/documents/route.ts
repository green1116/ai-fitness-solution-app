import { NextResponse } from "next/server";

import {
  consolidateIntakeSession,
  getIntakeSession,
  listIntakeDocuments,
  resolveConsolidationConflict,
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

    const documents = listIntakeDocuments(sessionId).map((d) => ({
      id: d.id,
      fileName: d.fileName,
      docType: d.docType,
      order: d.order,
      priority: d.priority,
      status: d.status,
      fileSize: d.fileSize,
      uploadedAt: d.uploadedAt,
    }));

    return NextResponse.json({
      ok: true,
      documents,
      consolidation: session.consolidation ?? null,
      requirements: session.requirements,
      revision: session.requirementsRevision ?? 0,
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
    const action = String(body?.action ?? "consolidate").trim();

    try {
      if (action === "consolidate") {
        const result = consolidateIntakeSession({
          sessionId,
          organizationId: ctx.organizationId,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          requirements: result.requirements,
          consolidation: result.consolidation,
          documents: result.documents.map((d) => ({
            id: d.id,
            fileName: d.fileName,
            docType: d.docType,
            order: d.order,
            priority: d.priority,
            status: d.status,
          })),
          validation: result.validation,
          revision: result.revision,
        });
      }

      if (action === "resolve") {
        const conflictId = String(body?.conflictId ?? "").trim();
        const resolution = String(body?.resolution ?? "").trim();
        if (!conflictId || (resolution !== "manual_keep" && resolution !== "manual_drop")) {
          return NextResponse.json({ ok: false, code: "INVALID_RESOLVE" }, { status: 400 });
        }
        const result = resolveConsolidationConflict({
          sessionId,
          organizationId: ctx.organizationId,
          conflictId,
          resolution,
          keepItemId: body?.keepItemId ? String(body.keepItemId) : undefined,
          actorId: ctx.id,
        });
        return NextResponse.json({
          ok: true,
          requirements: result.requirements,
          consolidation: result.consolidation,
          revision: result.revision,
        });
      }

      return NextResponse.json({ ok: false, code: "INVALID_ACTION" }, { status: 400 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "MULTIDOC_FAILED";
      const status =
        message === "SESSION_NOT_FOUND" || message === "ORG_MISMATCH"
          ? 404
          : message === "SESSION_FROZEN" ||
              message === "SESSION_LOCKED" ||
              message === "ALREADY_APPROVED" ||
              message === "RELEASE_LOCKED"
            ? 409
            : message === "NO_CONSOLIDATION_STATE"
              ? 400
              : 500;
      return NextResponse.json({ ok: false, code: message, message }, { status });
    }
  });
}
