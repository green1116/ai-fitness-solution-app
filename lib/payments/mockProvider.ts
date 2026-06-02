import { getCurrentUser } from "@/lib/auth/currentUser";
import { fulfillPaidOrderWithDevFallback } from "@/lib/pay/fulfillPaidOrderWithDevFallback";
import { mockPaymentProvider as lowLevelMockProvider } from "@/lib/pay/providers/mockPaymentProvider";
import { prisma } from "@/lib/prisma";
import { devPayGetPending, devPayRegisterPending } from "@/lib/pay/devPayMockOrders";
import type { PaymentProvider } from "@/lib/payments/provider";
import type {
  CreateOrderInput,
  CreateOrderResult,
  PayConfirmPaidHints,
  PaymentOrder,
  PaymentOrderStatus,
  ProviderName,
  StartPaymentInput,
  StartPaymentResult,
  WebhookEvent,
  WebhookInput,
} from "@/lib/payments/types";

const isDev = () => process.env.NODE_ENV !== "production";

function asOrder(
  raw: {
    orderId: string;
    planId: string;
    targetLevel: "pro" | "enterprise";
    amount: number;
    status: PaymentOrderStatus;
    provider: ProviderName;
    providerOrderId?: string | null;
    paidAt?: string | null;
  },
): PaymentOrder {
  return {
    orderId: raw.orderId,
    planId: raw.planId,
    targetLevel: raw.targetLevel,
    amount: raw.amount,
    status: raw.status,
    provider: raw.provider,
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

export function mockPaymentProvider(name: ProviderName): PaymentProvider {
  return {
    name,

    async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
      console.info("[payment-provider] create-order", {
        provider: name,
        planId: input.planId,
        targetLevel: input.targetLevel,
      });
      const orderId = `order_${Date.now()}`;
      const userId = await resolveSessionUserId(input.userId ?? null);

      devPayRegisterPending(orderId, {
        planId: input.planId,
        targetLevel: input.targetLevel,
        amount: input.amount,
        projectId: input.projectId,
      });

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
            paymentProvider: name,
          },
        });
      } catch (e) {
        console.warn("[payment-provider] create-order prisma skipped", {
          provider: name,
          error: e instanceof Error ? e.message : String(e),
        });
      }

      return {
        ok: true,
        order: asOrder({
          orderId,
          planId: input.planId,
          targetLevel: input.targetLevel,
          amount: input.amount,
          status: "pending",
          provider: name,
        }),
      };
    },

    async startPayment(input: StartPaymentInput): Promise<StartPaymentResult> {
      console.info("[payment-provider] start-payment", {
        provider: name,
        orderId: input.orderId,
      });

      let order: {
        orderId: string;
        planId: string;
        targetLevel: "pro" | "enterprise";
        amount: number;
        status: PaymentOrderStatus;
      } | null = null;

      try {
        const row = await prisma.upgradeOrder.findUnique({
          where: { id: input.orderId },
        });
        if (row) {
          const tl = String(row.targetLevel ?? "").trim().toLowerCase();
          order = {
            orderId: row.id,
            planId: row.planId,
            targetLevel: tl === "enterprise" ? "enterprise" : "pro",
            amount: row.amount,
            status: (row.status as PaymentOrderStatus) || "pending",
          };
        }
      } catch {
        // ignore and fallback to memory
      }

      if (!order) {
        const pending = devPayGetPending(input.orderId);
        if (pending) {
          order = {
            orderId: input.orderId,
            planId: pending.planId,
            targetLevel: pending.targetLevel,
            amount: pending.amount,
            status: "pending",
          };
        }
      }

      if (!order && isDev()) {
        order = {
          orderId: input.orderId,
          planId: input.planId || "__mock_plan__",
          targetLevel:
            String(input.targetLevel ?? "")
              .trim()
              .toLowerCase() === "enterprise"
              ? "enterprise"
              : "pro",
          amount: 100,
          status: "pending",
        };
      }

      if (!order) {
        throw new Error("订单不存在");
      }

      const paymentSession = await lowLevelMockProvider.startPayment(
        {
          orderId: order.orderId,
          planId: order.planId,
          targetLevel: order.targetLevel,
          amountCents: order.amount,
          baseUrl: input.baseUrl,
        },
        {
          id: order.orderId,
          planId: order.planId,
          targetLevel: order.targetLevel,
          amount: order.amount,
          status: order.status,
        },
      );

      try {
        await prisma.upgradeOrder.update({
          where: { id: order.orderId },
          data: { paymentProvider: name },
        });
      } catch {
        // ignore
      }

      return {
        ok: true,
        paymentSession,
        paymentStatus: "mock_started",
        order: asOrder({
          orderId: order.orderId,
          planId: order.planId,
          targetLevel: order.targetLevel,
          amount: order.amount,
          status: "mock_started",
          provider: name,
        }),
      };
    },

    async handleWebhook(input: WebhookInput): Promise<WebhookEvent> {
      console.info("[payment-provider] webhook", { provider: name });
      const orderId = String(input?.orderId || "").trim();
      const status = String(input?.status || "").trim().toLowerCase();
      const event = String(input?.event || "payment_succeeded").trim();
      if (!orderId) {
        throw new Error("缺少 orderId");
      }
      if (status === "paid") return { kind: "payment_succeeded", orderId };
      if (status === "failed") return { kind: "payment_failed", orderId };
      if (status === "canceled") return { kind: "payment_canceled", orderId };
      if (event === "payment_failed") return { kind: "payment_failed", orderId };
      if (event === "payment_canceled") return { kind: "payment_canceled", orderId };
      return { kind: "payment_succeeded", orderId };
    },

    async confirmPaid(orderId: string, hints?: PayConfirmPaidHints) {
      console.info("[payment-provider] confirm-paid", {
        provider: name,
        orderId,
        hints: hints ?? null,
      });
      const result = await fulfillPaidOrderWithDevFallback(orderId, hints);
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
}
