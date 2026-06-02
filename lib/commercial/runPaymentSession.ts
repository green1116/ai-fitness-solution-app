"use client";

import type { PaymentSession } from "@/lib/pay/paymentSession";

const pf = (step: string) => `[purchase-flow] ${step}`;

export type RunPaymentSessionResult =
  | { kind: "license"; licenseKey: string }
  | {
      kind: "paid_without_plain_key";
      message?: string;
    };

/**
 * 根据服务端返回的 PaymentSession 执行浏览器侧步骤（不包含具体渠道逻辑）。
 * redirect 型会话应在调用方处理（跳转收银台）。
 */
export async function runPaymentSessionOnClient(
  session: PaymentSession,
  meta?: { orderId?: string },
): Promise<RunPaymentSessionResult> {
  if (session.kind === "client_complete") {
    const rawUrl = session.request.url;
    const url =
      rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `${window.location.origin}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

    const res = await fetch(url, {
      method: session.request.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(session.request.headers || {}),
      },
      body: JSON.stringify(session.request.body ?? {}),
    });

    const data = (await res.json().catch(() => ({}))) as {
      licenseKey?: string;
      message?: string;
    };
    console.info(pf("webhook"), {
      orderId: meta?.orderId,
      ok: res.ok,
      status: res.status,
    });

    if (!res.ok) {
      throw new Error(
        typeof data.message === "string" ? data.message : `支付回调失败 (${res.status})`,
      );
    }

    const licenseKey =
      typeof data.licenseKey === "string" ? data.licenseKey.trim() : "";
    if (!licenseKey) {
      throw new Error("收银回调未返回 licenseKey");
    }

    console.info(pf("license-issued"), {
      orderId: meta?.orderId,
      hasPlainKey: true,
    });

    return { kind: "license", licenseKey };
  }

  if (session.kind === "provider_pending") {
    const raw = session.statusUrl;
    const statusUrl =
      raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `${window.location.origin}${raw.startsWith("/") ? "" : "/"}${raw}`;

    const pollMs = session.pollIntervalMs ?? 2500;
    const deadline = Date.now() + 120_000;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, pollMs));
      const r = await fetch(statusUrl, {
        cache: "no-store",
        credentials: "include",
      });
      const j = (await r.json().catch(() => null)) as {
        paymentStatus?: string;
        licenseIssued?: boolean;
      } | null;

      if (j?.paymentStatus === "paid" && j?.licenseIssued) {
        console.info(pf("webhook"), {
          orderId: meta?.orderId,
          ok: true,
          paymentStatus: j.paymentStatus,
          licenseIssued: j.licenseIssued,
        });
        console.info(pf("license-issued"), {
          orderId: meta?.orderId,
          hasPlainKey: false,
        });
        return {
          kind: "paid_without_plain_key",
          message:
            session.message ||
            "订单已支付且 License 已签发；若页面未自动填入 Key，请使用邮件或管理端获取后手动保存。",
        };
      }
    }

    throw new Error(session.message || "等待支付结果超时");
  }

  throw new Error("未知支付会话类型");
}
