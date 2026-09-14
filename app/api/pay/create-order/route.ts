import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/provider";
import { upgradeAmountForLevel } from "@/lib/upgradeUnlock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const planId = String(body?.planId || "").trim();
    const projectId = String(body?.projectId || "").trim();
    const targetLevelRaw = String(body?.targetLevel || "").trim().toLowerCase();
    const clientAmount = Number(body?.amount);

    if (!planId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_PLAN_ID", message: "缺少 planId" },
        { status: 400 },
      );
    }
    if (!projectId) {
      return NextResponse.json(
        { ok: false, code: "MISSING_PROJECT_ID", message: "缺少 projectId" },
        { status: 400 },
      );
    }
    if (targetLevelRaw !== "pro" && targetLevelRaw !== "enterprise") {
      return NextResponse.json(
        { ok: false, code: "INVALID_TARGET_LEVEL", message: "targetLevel 须为 pro 或 enterprise" },
        { status: 400 },
      );
    }

    // PRO: server-authoritative — never persist client body.amount.
    // Enterprise: unchanged — still requires a valid client amount.
    let amount: number;
    if (targetLevelRaw === "pro") {
      amount = upgradeAmountForLevel("pro");
      if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
        return NextResponse.json(
          {
            ok: false,
            code: "INVALID_SERVER_AMOUNT",
            message: "服务端 PRO 价格未正确配置",
          },
          { status: 503 },
        );
      }
    } else {
      amount = clientAmount;
      if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
        return NextResponse.json(
          { ok: false, code: "INVALID_AMOUNT", message: "amount 须为正整数（分）" },
          { status: 400 },
        );
      }
    }

    const provider = getPaymentProvider();
    const result = await provider.createOrder({
      planId,
      projectId,
      targetLevel: targetLevelRaw as "pro" | "enterprise",
      amount,
      userId: typeof body?.userId === "string" ? body.userId : null,
      clientFingerprint:
        typeof body?.clientFingerprint === "string"
          ? body.clientFingerprint
          : typeof body?.fingerprint === "string"
            ? body.fingerprint
            : null,
    });

    console.info(`[pay] create-order orderId=${result.order.orderId}`);
    console.info("[pay] create-order ok", {
      orderId: result.order.orderId,
      provider: result.order.provider,
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: result.order.orderId,
        status: result.order.status,
        planId: result.order.planId,
        targetLevel: result.order.targetLevel,
        amount: result.order.amount,
        provider: result.order.provider,
        providerOrderId: result.order.providerOrderId,
        paidAt: result.order.paidAt,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("[/api/pay/create-order]", e);
    return NextResponse.json(
      { ok: false, code: "CREATE_ORDER_FAILED", message: e instanceof Error ? e.message : "创建订单失败" },
      { status: 500 },
    );
  }
}
