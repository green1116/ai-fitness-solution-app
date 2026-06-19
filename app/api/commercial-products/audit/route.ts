import { NextRequest, NextResponse } from "next/server";
import { AUDIT_ACTOR_TYPE, AUDIT_EVENT_TYPE, type AuditActorType, type AuditEventType } from "@/lib/commercial-products/audit/audit-types";
import { listAuditEventsHeavy, recordAuditEventHeavy } from "@/lib/commercial-products/audit/heavy-audit-runtime";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const workspaceId = params.get("workspaceId")?.trim() || undefined;
    const quoteId = params.get("quoteId")?.trim() || undefined;
    const approvalId = params.get("approvalId")?.trim() || undefined;
    const deliveryId = params.get("deliveryId")?.trim() || undefined;

    const result = await listAuditEventsHeavy({
      workspaceId,
      quoteId,
      approvalId,
      deliveryId,
    });

    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "audit lookup failed";
    return NextResponse.json(
      { ok: false, code: "AUDIT_LOOKUP_FAILED", message },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const eventType = String(body.eventType ?? "").trim() as AuditEventType;
    const actorType = String(body.actorType ?? "system").trim() as AuditActorType;

    if (!AUDIT_EVENT_TYPE.includes(eventType)) {
      return NextResponse.json(
        { ok: false, code: "INVALID_EVENT_TYPE", message: "eventType 无效" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!AUDIT_ACTOR_TYPE.includes(actorType)) {
      return NextResponse.json(
        { ok: false, code: "INVALID_ACTOR_TYPE", message: "actorType 无效" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const result = await recordAuditEventHeavy({
      eventType,
      workspaceId: body.workspaceId ? String(body.workspaceId) : undefined,
      projectId: body.projectId ? String(body.projectId) : undefined,
      quoteId: body.quoteId ? String(body.quoteId) : undefined,
      approvalId: body.approvalId ? String(body.approvalId) : undefined,
      packageId: body.packageId ? String(body.packageId) : undefined,
      deliveryId: body.deliveryId ? String(body.deliveryId) : undefined,
      actorType,
      actorId: body.actorId ? String(body.actorId) : undefined,
      actorName: body.actorName ? String(body.actorName) : undefined,
      title: String(body.title ?? eventType),
      description: body.description ? String(body.description) : undefined,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, unknown>)
          : undefined,
    });

    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "audit record failed";
    return NextResponse.json(
      { ok: false, code: "AUDIT_RECORD_FAILED", message },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }
}
