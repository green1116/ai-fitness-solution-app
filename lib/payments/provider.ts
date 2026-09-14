import { mockPaymentProvider } from "@/lib/payments/mockProvider";
import { wechatPaymentProvider } from "@/lib/payments/wechatProvider";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PayConfirmPaidHints,
  ProviderName,
  StartPaymentInput,
  StartPaymentResult,
  WebhookEvent,
  WebhookInput,
} from "@/lib/payments/types";

export interface PaymentProvider {
  readonly name: ProviderName;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  startPayment(input: StartPaymentInput): Promise<StartPaymentResult>;
  handleWebhook(input: WebhookInput): Promise<WebhookEvent>;
  confirmPaid(
    orderId: string,
    hints?: PayConfirmPaidHints,
  ): Promise<{
    ok: boolean;
    licenseKey?: string | null;
    payload: Record<string, unknown>;
  }>;
}

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Resolve payment provider for /api/pay/*.
 * Production is fail-closed: only explicit `wechat` is allowed.
 * Non-production keeps mock default; `wechat` still selects wechatPaymentProvider.
 */
export function getPaymentProvider(): PaymentProvider {
  const raw = (process.env.PAYMENT_PROVIDER || "").trim().toLowerCase();

  if (isProduction()) {
    if (!raw) {
      throw new Error(
        "PAYMENT_PROVIDER is required in production (set PAYMENT_PROVIDER=wechat)",
      );
    }
    if (raw === "mock") {
      throw new Error(
        "PAYMENT_PROVIDER=mock is not allowed in production",
      );
    }
    if (raw === "stripe") {
      throw new Error(
        "NOT_IMPLEMENTED: PAYMENT_PROVIDER=stripe is not supported in production",
      );
    }
    if (raw === "wechat") {
      console.info("[payment-provider] selected", { provider: "wechat" });
      return wechatPaymentProvider;
    }
    throw new Error(
      `Unsupported PAYMENT_PROVIDER=${raw} in production (supported: wechat)`,
    );
  }

  // Non-production: preserve mock default; wechat resolves to real wechat adapter.
  if (raw === "wechat") {
    console.info("[payment-provider] selected", { provider: "wechat" });
    return wechatPaymentProvider;
  }

  const name: ProviderName =
    raw === "stripe" ? "stripe" : "mock";
  const provider: PaymentProvider = mockPaymentProvider(name);
  console.info("[payment-provider] selected", { provider: name });
  return provider;
}
