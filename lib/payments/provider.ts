import { mockPaymentProvider } from "@/lib/payments/mockProvider";
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

function selectedName(): ProviderName {
  const raw = (process.env.PAYMENT_PROVIDER || "mock").trim().toLowerCase();
  if (raw === "stripe") return "stripe";
  if (raw === "wechat") return "wechat";
  return "mock";
}

export function getPaymentProvider(): PaymentProvider {
  const name = selectedName();
  // 现阶段 stripe/wechat 尚未接 SDK，先复用 mock provider 保持链路稳定。
  const provider: PaymentProvider = mockPaymentProvider(name);
  console.info("[payment-provider] selected", { provider: name });
  return provider;
}
