import { getCurrentUser } from "@/lib/auth/currentUser";
import { fulfillPaidOrder } from "@/lib/pay/fulfill";
import { prisma } from "@/lib/prisma";
import type { PaymentProvider } from "@/lib/payments/provider";
import { createWechatNativePrepay } from "@/lib/payments/wechatNativeClient";
import {
  assertWechatNotifySerialMatch,
  decryptWechatPayResource,
  loadWechatPlatformPublicKey,
  verifyWechatPayNotifySignature,
  type WechatTransactionNotify,
} from "@/lib/payments/wechatWebhookCrypto";
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

function readWechatNotifyEnvelope(input: WebhookInput): {
  rawBody: string;
  timestamp: string;
  nonce: string;
  serial: string;
  signature: string;
} {
  const rawBody = typeof input.rawBody === "string" ? input.rawBody : "";
  const timestamp =
    typeof input.timestamp === "string" ? input.timestamp.trim() : "";
  const nonce = typeof input.nonce === "string" ? input.nonce.trim() : "";
  const serial = typeof input.serial === "string" ? input.serial.trim() : "";
  const signature =
    typeof input.signature === "string" ? input.signature.trim() : "";
  if (!rawBody || !timestamp || !nonce || !signature) {
    throw new Error("WECHAT_NOTIFY_HEADERS_OR_BODY_MISSING");
  }
  if (!serial) {
    throw new Error("WECHAT_NOTIFY_SERIAL_MISSING");
  }
  return { rawBody, timestamp, nonce, serial, signature };
}

/**
 * WeChat Pay provider for /api/pay/* chain.
 * Native start-payment + notify verify/decrypt v1.
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

  async handleWebhook(input: WebhookInput): Promise<WebhookEvent> {
    if (!isWechatPayConfigured()) {
      throw notConfiguredError();
    }

    const { rawBody, timestamp, nonce, serial, signature } =
      readWechatNotifyEnvelope(input);

    // Bind Wechatpay-Serial to configured platform cert/key before verify.
    assertWechatNotifySerialMatch(serial);

    const platformPublicKeyPem = loadWechatPlatformPublicKey();
    const okSig = verifyWechatPayNotifySignature({
      timestamp,
      nonce,
      rawBody,
      signature,
      platformPublicKeyPem,
    });
    if (!okSig) {
      throw new Error("WECHAT_NOTIFY_SIGNATURE_INVALID");
    }

    let envelope: {
      resource?: {
        ciphertext?: string;
        nonce?: string;
        associated_data?: string;
        algorithm?: string;
      };
    };
    try {
      envelope = JSON.parse(rawBody) as typeof envelope;
    } catch {
      throw new Error("WECHAT_NOTIFY_JSON_INVALID");
    }

    const resource = envelope.resource;
    if (
      !resource ||
      typeof resource.ciphertext !== "string" ||
      typeof resource.nonce !== "string"
    ) {
      throw new Error("WECHAT_NOTIFY_RESOURCE_MISSING");
    }

    const apiV3Key = process.env.WECHAT_PAY_API_V3_KEY?.trim() || "";
    const decrypted = decryptWechatPayResource({
      apiV3Key,
      resource: {
        ciphertext: resource.ciphertext,
        nonce: resource.nonce,
        associated_data:
          typeof resource.associated_data === "string"
            ? resource.associated_data
            : "",
        algorithm: resource.algorithm,
      },
    });

    let tx: WechatTransactionNotify;
    try {
      tx = JSON.parse(decrypted) as WechatTransactionNotify;
    } catch {
      throw new Error("WECHAT_NOTIFY_DECRYPTED_JSON_INVALID");
    }

    const outTradeNo =
      typeof tx.out_trade_no === "string" ? tx.out_trade_no.trim() : "";
    const transactionId =
      typeof tx.transaction_id === "string" ? tx.transaction_id.trim() : "";
    const tradeState =
      typeof tx.trade_state === "string"
        ? tx.trade_state.trim().toUpperCase()
        : "";

    if (!outTradeNo) {
      throw new Error("WECHAT_NOTIFY_OUT_TRADE_NO_MISSING");
    }
    if (!transactionId) {
      throw new Error("WECHAT_NOTIFY_TRANSACTION_ID_MISSING");
    }
    if (tradeState !== "SUCCESS") {
      throw new Error(
        `WECHAT_TRADE_STATE_NOT_SUCCESS: ${tradeState || "EMPTY"}`,
      );
    }

    const order = await prisma.upgradeOrder.findUnique({
      where: { id: outTradeNo },
    });
    if (!order) {
      throw new Error("WECHAT_ORDER_NOT_FOUND");
    }

    const paymentProvider = String(order.paymentProvider ?? "")
      .trim()
      .toLowerCase();
    if (paymentProvider !== PROVIDER) {
      throw new Error("WECHAT_ORDER_PROVIDER_MISMATCH");
    }

    const targetLevel = String(order.targetLevel ?? "").trim().toLowerCase();
    if (targetLevel !== "pro") {
      throw new Error("WECHAT_ORDER_TARGET_NOT_PRO");
    }

    const amountTotal =
      typeof tx.amount?.total === "number" ? tx.amount.total : NaN;
    if (!Number.isInteger(amountTotal) || amountTotal !== order.amount) {
      throw new Error("WECHAT_AMOUNT_MISMATCH");
    }

    const cfgMch = process.env.WECHAT_PAY_MCH_ID?.trim() || "";
    const cfgApp = process.env.WECHAT_PAY_APP_ID?.trim() || "";
    if (
      typeof tx.mchid === "string" &&
      tx.mchid.trim() &&
      tx.mchid.trim() !== cfgMch
    ) {
      throw new Error("WECHAT_MCHID_MISMATCH");
    }
    if (
      typeof tx.appid === "string" &&
      tx.appid.trim() &&
      tx.appid.trim() !== cfgApp
    ) {
      throw new Error("WECHAT_APPID_MISMATCH");
    }

    const existingTxn = order.providerOrderId?.trim() || "";
    if (existingTxn && existingTxn !== transactionId) {
      throw new Error("WECHAT_TRANSACTION_ID_CONFLICT");
    }

    if (!existingTxn) {
      await prisma.upgradeOrder.update({
        where: { id: order.id },
        data: { providerOrderId: transactionId },
      });
    }

    console.info("[payment-provider] webhook", {
      provider: PROVIDER,
      orderId: order.id,
      tradeState,
      hasTransactionId: Boolean(transactionId),
    });

    return { kind: "payment_succeeded", orderId: order.id };
  },

  async confirmPaid(orderId: string, _hints?: PayConfirmPaidHints) {
    if (!isWechatPayConfigured()) {
      throw notConfiguredError();
    }

    const id = orderId.trim();
    if (!id) {
      throw new Error("缺少 orderId");
    }

    // Formal fulfill only — never DevFallback mock paid for WeChat.
    const result = await fulfillPaidOrder(id);
    if (!result.ok) {
      return {
        ok: false,
        payload: result as unknown as Record<string, unknown>,
      };
    }

    return {
      ok: true,
      licenseKey: result.licenseKeyPlain,
      payload: {
        ok: true,
        order: result.order,
        license: result.license,
        licenseKey: result.licenseKeyPlain,
        note: result.note,
      },
    };
  },
};
