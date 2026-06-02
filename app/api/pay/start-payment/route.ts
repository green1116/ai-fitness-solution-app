import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, payload: Record<string, unknown>) {
  return NextResponse.json(payload, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const orderId = String(body?.orderId || "").trim();
    const planId = String(body?.planId || "").trim();
    const targetLevelRaw = String(body?.targetLevel || "").trim().toLowerCase();

    console.info(`[pay] start-payment received orderId=${orderId || "<empty>"}`);

    if (!orderId) {
      return json(400, {
        ok: false,
        code: "MISSING_ORDER_ID",
        message: "缺少 orderId",
      });
    }

    const provider = getPaymentProvider();
    const origin = new URL(req.url).origin;
    const result = await provider.startPayment({
      orderId,
      planId: planId || undefined,
      targetLevel:
        targetLevelRaw === "enterprise" || targetLevelRaw === "pro"
          ? targetLevelRaw
          : undefined,
      baseUrl: origin,
    });

    console.info(`[pay] start-payment found order=true orderId=${orderId}`);
    console.info("[pay] start-payment ok", {
      orderId: result.order.orderId,
      provider: result.order.provider,
      paymentStatus: result.paymentStatus,
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: result.order.orderId,
        planId: result.order.planId,
        targetLevel: result.order.targetLevel,
        amount: result.order.amount,
        status: result.order.status,
        provider: result.order.provider,
        providerOrderId: result.order.providerOrderId,
        paidAt: result.order.paidAt,
        paymentStatus: result.paymentStatus,
        paymentProvider: result.order.provider,
        paymentSession: result.paymentSession,
      },
      { status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "发起支付失败";
    if (msg.includes("订单不存在")) {
      console.info("[pay] start-payment found order=false");
      return json(404, { ok: false, code: "ORDER_NOT_FOUND", message: "订单不存在" });
    }
    console.error("[/api/pay/start-payment]", e);
    return json(500, { ok: false, code: "START_PAYMENT_FAILED", message: msg });
  }
}
