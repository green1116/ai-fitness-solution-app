/**
 * 统一购买履约：create-order → start-payment →（浏览器）执行 PaymentSession → 返回 licenseKey。
 * 真实渠道接入时仅需替换服务端 PaymentProvider，前端保持同一套会话协议。
 */

import { CheckoutRedirectError } from "@/lib/commercial/checkoutRedirectError";
import { runPaymentSessionOnClient } from "@/lib/commercial/runPaymentSession";
import type { PaymentSession } from "@/lib/pay/paymentSession";

const pf = (step: string) => `[purchase-flow] ${step}`;

export type ExecutePayPurchaseInput = {
  planId: string;
  targetLevel: "pro" | "enterprise";
  /** 金额（分） */
  amountCents: number;
  /** 当前交付关联的 projectId（create-order 必填） */
  projectId: string;
  /** 预留：账号体系用户 id */
  userId?: string | null;
  /** 预留：客户端指纹 */
  clientFingerprint?: string | null;
};

export type ExecutePayPurchaseResult = {
  orderId: string;
  licenseKey: string;
};

export async function executePayPurchaseAndIssueLicense(
  input: ExecutePayPurchaseInput,
): Promise<ExecutePayPurchaseResult> {
  const {
    planId,
    targetLevel,
    amountCents,
    projectId,
    userId,
    clientFingerprint,
  } = input;

  console.info(pf("create-order"), {
    planId,
    targetLevel,
    amount: amountCents,
    projectId,
  });

  const coRes = await fetch("/api/pay/create-order", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId,
      targetLevel,
      amount: amountCents,
      projectId,
      ...(userId ? { userId } : {}),
      ...(clientFingerprint ? { clientFingerprint } : {}),
    }),
  });
  const coData = (await coRes.json().catch(() => ({}))) as {
    ok?: boolean;
    orderId?: string;
    message?: string;
  };
  if (!coRes.ok || !coData.orderId) {
    console.info(pf("create-order"), {
      ok: false,
      status: coRes.status,
      message: coData.message,
    });
    throw new Error(coData.message || "创建订单失败");
  }

  const orderId = coData.orderId;
  console.info(pf("create-order"), {
    ok: true,
    orderId,
    planId,
    targetLevel,
    projectId,
  });

  const spRes = await fetch("/api/pay/start-payment", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      planId,
      targetLevel,
    }),
  });
  const spData = (await spRes.json().catch(() => ({}))) as {
    ok?: boolean;
    message?: string;
    paymentSession?: PaymentSession;
  };
  if (!spRes.ok || !spData.ok || !spData.paymentSession) {
    throw new Error(spData.message || "发起支付失败");
  }

  const session = spData.paymentSession;
  console.info(pf("start-payment"), { orderId, sessionKind: session.kind });

  if (session.kind === "redirect") {
    if (typeof window !== "undefined") {
      window.location.assign(session.url);
    }
    throw new CheckoutRedirectError(session.url);
  }

  const outcome = await runPaymentSessionOnClient(session, { orderId });
  if (outcome.kind === "license") {
    console.info(pf("webhook"), { orderId, ok: true });
    console.info(pf("license-issued"), { orderId, via: "webhook_response" });
    return { orderId, licenseKey: outcome.licenseKey };
  }

  throw new Error(
    outcome.message ||
      "支付已完成，但本机尚未收到授权结果，请刷新页面；若仍未解锁请联系支持。",
  );
}
