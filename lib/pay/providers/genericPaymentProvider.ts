import type { PaymentSession } from "@/lib/pay/paymentSession";
import type { PaymentProvider, StartPaymentContext, StartPaymentOrderRow } from "./paymentProvider";

/**
 * 未绑定具体渠道时的占位：通过环境变量拼接跳转 URL，或引导轮询订单状态。
 *
 * 后续接入 Stripe / 微信 / 支付宝时，可替换为对应 adapter，仍实现同一接口。
 */
export const genericPaymentProvider: PaymentProvider = {
  id: "generic",

  async startPayment(
    ctx: StartPaymentContext,
    _order: StartPaymentOrderRow,
  ): Promise<PaymentSession> {
    const tpl = (process.env.PAYMENT_REDIRECT_URL_TEMPLATE || "").trim();
    if (tpl) {
      const url = tpl
        .replace(/\{\{orderId\}\}/g, encodeURIComponent(ctx.orderId))
        .replace(/\{\{planId\}\}/g, encodeURIComponent(ctx.planId))
        .replace(/\{\{amount\}\}/g, String(ctx.amountCents));
      return { kind: "redirect", url };
    }

    const statusUrl = `/api/license/status?orderId=${encodeURIComponent(ctx.orderId)}`;
    return {
      kind: "provider_pending",
      statusUrl,
      pollIntervalMs: 2500,
      message:
        "未配置 PAYMENT_REDIRECT_URL_TEMPLATE：请在环境中配置收银台跳转 URL（含 {{orderId}} 占位），或完成第三方支付后由 webhook 更新订单；此期间可轮询订单状态。",
    };
  },
};
