import type { PaymentSession } from "@/lib/pay/paymentSession";
import type { PaymentProvider, StartPaymentContext, StartPaymentOrderRow } from "./paymentProvider";

/**
 * 开发 / 联调用：同步触发 webhook 完成履约（服务端 webhook 在 dev 下可放宽签名校验）。
 * 生产环境不应注册此 provider。
 */
export const mockPaymentProvider: PaymentProvider = {
  id: "mock",

  async startPayment(
    ctx: StartPaymentContext,
    _order: StartPaymentOrderRow,
  ): Promise<PaymentSession> {
    const webhookPath = "/api/pay/webhook";
    const url = ctx.baseUrl ? `${ctx.baseUrl.replace(/\/$/, "")}${webhookPath}` : webhookPath;

    return {
      kind: "client_complete",
      request: {
        url,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          orderId: ctx.orderId,
          event: "payment_succeeded",
          status: "paid",
          /** 与 create-order 对齐，供 webhook / ensure 在订单行异常或未落库时仍能升到 enterprise */
          planId: ctx.planId,
          targetLevel: ctx.targetLevel,
        },
      },
    };
  },
};
