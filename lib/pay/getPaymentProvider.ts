import type { PaymentProvider } from "@/lib/pay/providers/paymentProvider";
import { genericPaymentProvider } from "@/lib/pay/providers/genericPaymentProvider";
import { mockPaymentProvider } from "@/lib/pay/providers/mockPaymentProvider";

/**
 * PAYMENT_PROVIDER：
 * - mock：仅应在开发 / 联调启用（由 NODE_ENV 或显式开关约束）
 * - generic：默认占位，通过 PAYMENT_REDIRECT_URL_TEMPLATE 跳转真实收银台
 * - 未来：stripe | wechat | alipay …
 */
export function getPaymentProvider(): PaymentProvider {
  const raw = (process.env.PAYMENT_PROVIDER || "").trim().toLowerCase();
  const env = process.env.NODE_ENV;

  if (raw === "mock" || (!raw && env === "development")) {
    if (env === "production") {
      console.warn(
        "[pay] PAYMENT_PROVIDER=mock ignored in production; falling back to generic",
      );
      return genericPaymentProvider;
    }
    return mockPaymentProvider;
  }

  if (!raw || raw === "generic") {
    return genericPaymentProvider;
  }

  console.warn(`[pay] Unknown PAYMENT_PROVIDER=${raw}, using generic`);
  return genericPaymentProvider;
}
