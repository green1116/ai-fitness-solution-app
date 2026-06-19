import { NextRequest, NextResponse } from "next/server";
import { APPROVAL_ACTION, type ApprovalAction } from "@/lib/commercial-products/approval/approval-types";
import {
  createApprovalHeavy,
  getApprovalHeavy,
  runApprovalActionHeavy,
} from "@/lib/commercial-products/approval/heavy-approval-runtime";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const approvalId = params.get("approvalId")?.trim() || undefined;
    const quoteId = params.get("quoteId")?.trim() || undefined;
    const projectId = params.get("projectId")?.trim() || undefined;

    if (!approvalId && !quoteId && !projectId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_LOOKUP", message: "缺少 approvalId / quoteId / projectId" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const result = await getApprovalHeavy({ approvalId, quoteId, projectId });
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "approval lookup failed";
    return NextResponse.json(
      { ok: false, code: "APPROVAL_LOOKUP_FAILED", message },
      { status: 404, headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const actionRaw = String(body.action ?? "").trim() as ApprovalAction | "create";
    const approvalId = String(body.approvalId ?? "").trim();
    const quoteId = String(body.quoteId ?? "").trim();
    const projectId = String(body.projectId ?? "").trim();

    if (actionRaw === "create") {
      if (!quoteId || !projectId) {
        return NextResponse.json(
          { ok: false, code: "INVALID_CREATE", message: "create 需要 quoteId 和 projectId" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      const result = await createApprovalHeavy({ quoteId, projectId });
      return NextResponse.json(result, { headers: NO_STORE_HEADERS });
    }

    if (!APPROVAL_ACTION.includes(actionRaw as ApprovalAction)) {
      return NextResponse.json(
        { ok: false, code: "INVALID_ACTION", message: "action 无效" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!approvalId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_APPROVAL_ID", message: "缺少 approvalId" },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const result = await runApprovalActionHeavy(actionRaw as ApprovalAction, { approvalId });
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "approval action failed";
    return NextResponse.json(
      { ok: false, code: "APPROVAL_ACTION_FAILED", message },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }
}
