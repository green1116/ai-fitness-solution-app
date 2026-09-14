import { getCurrentUser } from "@/lib/auth/currentUser";
import { prisma } from "@/lib/prisma";
import type { PaymentProvider } from "@/lib/payments/provider";
import { createWechatNativePrepay } from "@/lib/payments/wechatNativeClient";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PayConfirmPaidHints,
  PaymentOrder,
  PaymentOrderStatus,
  StartPaymentInput,
  StartPaymentResult,
  WebhookEvent,
  WebhookInput,
} from "@/lib/payments/types";

const PROVIDER = "wechat" as const;

/** Required env for WeChat Pay (API v3) integration. */
const WECHAT_REQUIRED_ENV = [
  "WECHAT_PAY_MCH_ID",
  "WECHAT_PAY_APP_ID",
  "WECHAT_PAY_API_V3_KEY",
  "WECHAT_PAY_SERIAL_NO",
  "WECHAT_PAY_PRIVATE_KEY",
] as const;

function missingWechatEnv(): string[] {
  return WECHAT_REQUIRED_ENV.filter((k) => !process.env[k]?.trim());
}

export function isWechatPayConfigured(): boolean {
  return missingWechatEnv().length === 0;
}

function notConfiguredError(): Error {
  const missing = missingWechatEnv();
  return new Error(
    `NOT_CONFIGURED: WeChat Pay is not configured (missing ${missing.join(", ")})`,
  );
}

function notImplementedError(action: string): Error {
  return new Error(
    `NOT_IMPLEMENTED: WeChat Pay ${action} is not implemented yet`,
  );
}

function asOrder(raw: {
  orderId: string;
  planId: string;
  targetLevel: "pro" | "enterprise";
  amount: number;
  status: PaymentOrderStatus;
  providerOrderId?: string | null;
  paidAt?: string | null;
}): PaymentOrder {
  return {
    orderId: raw.orderId,
    planId: raw.planId,
    targetLevel: raw.targetLevel,
    amount: raw.amount,
    status: raw.status,
    provider: PROVIDER,
    providerOrderId: raw.providerOrderId ?? null,
    paidAt: raw.paidAt ?? null,
  };
}

async function resolveSessionUserId(bodyUserId?: string | null) {
  try {
    const u = await getCurrentUser();
    return u?.id ?? bodyUserId ?? null;
  } catch {
    return bodyUserId ?? null;
  }
}

function parseStrictTargetLevel(raw: string | null | undefined): "pro" | "enterprise" {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "pro" || value === "enterprise") return value;
  throw new Error("ORDER_INVALID_TARGET_LEVEL");
}

function buildNotifyUrl(baseUrl: string): string {
  const origin = baseUrl.replace(/\/$/, "");
  return `${origin}/api/pay/webhook`;
}

/**
 * WeChat Pay provider for /api/pay/* chain.
 * Native start-payment v1: creates QR via API v3; webhook/entitlement still NOT_IMPLEMENTED.
 */
export const wechatPaymentProvider: PaymentProvider = {
  name: PROVIDER,

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    if (!isWechatPayConfigured()) {
      throw notConfiguredError();
    }

    console.info("[payment-provider] create-order", {
      provider: PROVIDER,
      planId: input.planId,
      targetLevel: input.targetLevel,
    });

    const orderId = `order_${Date.now()}`;
    const userId = await resolveSessionUserId(input.userId ?? null);

    try {
      await prisma.upgradeOrder.create({
        data: {
          id: orderId,
          planId: input.planId,
          projectId: input.projectId,
          targetLevel: input.targetLevel,
          status: "pending",
          amount: input.amount,
          userId,
          clientFingerprint: input.clientFingerprint ?? null,
          paymentProvider: PROVIDER,
          providerOrderId: null,
        },
      });
    } catch (e) {
      console.error("[payment-provider] create-order persist failed", {
        provider: PROVIDER,
        error: e instanceof Error ? e.message : String(e),
      });
      throw new Error(
        `CREATE_ORDER_PERSIST_FAILED: ${e instanceof Error ? e.message : "UpgradeOrder create failed"}`,
      );
    }

    return {
      ok: true,
      order: asOrder({
        orderId,
        planId: input.planId,
        targetLevel: input.targetLevel,
        amount: input.amount,
        status: "pending",
        providerOrderId: null,
      }),
    };
  },

  async startPayment(input: StartPaymentInput): Promise<StartPaymentResult> {
    if (!isWechatPayConfigured()) {
      throw notConfiguredError();
    }

    const orderId = input.orderId.trim();
    if (!orderId) {
      throw new Error("缺少 orderId");
    }

    const row = await prisma.upgradeOrder.findUnique({
      where: { id: orderId },
    });
    if (!row) {
      throw new Error("订单不存在");
    }

    const provider = String(row.paymentProvider ?? "").trim().toLowerCase();
    if (provider && provider !== PROVIDER) {
      throw new Error(
        `ORDER_PROVIDER_MISMATCH: expected wechat, got ${provider}`,
      );
    }

    const status = String(row.status ?? "").trim().toLowerCase();
    if (status === "paid") {
      throw new Error("ORDER_ALREADY_PAID");
    }
    if (status !== "pending") {
      throw new Error(`ORDER_INVALID_STATE: status=${status}`);
    }

    if (!Number.isInteger(row.amount) || row.amount <= 0) {
      throw new Error("ORDER_INVALID_AMOUNT");
    }

    const targetLevel = parseStrictTargetLevel(row.targetLevel);
    // Domestic self-service WeChat Native: BASIC → PRO only.
    if (targetLevel === "enterprise") {
      throw new Error("SELF_SERVICE_ENTERPRISE_NOT_ALLOWED");
    }

    const description = "AI Fitness PRO upgrade";

    console.info("[payment-provider] start-payment", {
      provider: PROVIDER,
      orderId,
      amount: row.amount,
      targetLevel,
    });

    const { codeUrl } = await createWechatNativePrepay({
      outTradeNo: orderId,
      description,
      amountTotalFen: row.amount,
      notifyUrl: buildNotifyUrl(input.baseUrl),
    });

    const statusUrl = `/api/license/status?orderId=${encodeURIComponent(orderId)}`;

    return {
      ok: true,
      paymentStatus: "pending",
      paymentSession: {
        kind: "wechat_native",
        codeUrl,
        statusUrl,
        pollIntervalMs: 2500,
        message: "请使用微信扫码支付",
      },
      order: asOrder({
        orderId,
        planId: row.planId,
        targetLevel,
        amount: row.amount,
        status: "pending",
        providerOrderId: row.providerOrderId ?? null,
      }),
    };
  },

  async handleWebhook(_input: WebhookInput): Promise<WebhookEvent> {
    if (!isWechatPayConfigured()) {
      throw notConfiguredError();
    }
    throw notImplementedError("handleWebhook");
  },

  async confirmPaid(_orderId: string, _hints?: PayConfirmPaidHints) {
    if (!isWechatPayConfigured()) {
      throw notConfiguredError();
    }
    throw notImplementedError("confirmPaid");
  },
};
