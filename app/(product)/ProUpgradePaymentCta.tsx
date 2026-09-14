"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

import type { ProductCommercialContext } from "./commercial-context";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

const proTier = getPricingTier("PRO");

type PayUiPhase =
  | "idle"
  | "starting"
  | "awaiting_scan"
  | "paid"
  | "failed";

type CreateOrderResponse = {
  ok?: boolean;
  orderId?: string;
  message?: string;
  code?: string;
};

type StartPaymentResponse = {
  ok?: boolean;
  orderId?: string;
  message?: string;
  paymentSession?: {
    kind?: string;
    codeUrl?: string;
    statusUrl?: string;
    pollIntervalMs?: number;
    message?: string;
  };
};

type LicenseStatusResponse = {
  ok?: boolean;
  paymentStatus?: string;
  licenseIssued?: boolean;
};

function resolvePlanId(ctx: ProductCommercialContext): string {
  return ctx.projectId?.trim() || ctx.organizationId?.trim() || "product-pro";
}

function absoluteUrl(raw: string): string {
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `${window.location.origin}${raw.startsWith("/") ? "" : "/"}${raw}`;
}

export function ProUpgradePaymentCta({
  label,
  context = {},
  buttonClassName,
  onPaidSuccess,
}: {
  label?: string;
  context?: ProductCommercialContext;
  buttonClassName?: string;
  /** Called only after paymentStatus=paid && licenseIssued=true. Closing early must not invoke this. */
  onPaidSuccess?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<PayUiPhase>("idle");
  const [statusText, setStatusText] = useState("微信扫码支付");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const abortRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paidRef = useRef(false);

  const ctaLabel = label ?? proTier.cta;
  const buttonClass =
    buttonClassName ??
    "inline-flex rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400";

  const clearPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const resetSession = useCallback(() => {
    clearPoll();
    abortRef.current = true;
    setPhase("idle");
    setStatusText("微信扫码支付");
    setErrorText(null);
    setQrDataUrl(null);
    setOrderId(null);
  }, [clearPoll]);

  const closeModal = useCallback(() => {
    // Closing before paid must not grant entitlement (onPaidSuccess only on paid).
    if (phase === "starting") return;
    clearPoll();
    abortRef.current = true;
    setOpen(false);
    if (!paidRef.current) {
      resetSession();
    } else {
      setPhase("idle");
      setQrDataUrl(null);
      setErrorText(null);
    }
  }, [clearPoll, phase, resetSession]);

  const pollUntilPaid = useCallback(
    async (statusUrl: string, pollIntervalMs: number) => {
      const deadline = Date.now() + 120_000;
      const tick = async (): Promise<void> => {
        if (abortRef.current) return;
        if (Date.now() >= deadline) {
          setPhase("failed");
          setStatusText("支付失败 / 超时");
          setErrorText("等待支付超时，请关闭后重试");
          return;
        }

        try {
          const res = await fetch(absoluteUrl(statusUrl), {
            cache: "no-store",
            credentials: "include",
          });
          const data = (await res.json().catch(() => null)) as LicenseStatusResponse | null;
          if (
            !abortRef.current &&
            data?.paymentStatus === "paid" &&
            data.licenseIssued === true
          ) {
            paidRef.current = true;
            setPhase("paid");
            setStatusText("支付成功");
            setErrorText(null);
            clearPoll();
            try {
              await onPaidSuccess?.();
            } catch {
              // Entitlement refresh failure must not invent paid fallback; payment already confirmed.
            }
            return;
          }
        } catch {
          // Transient poll errors: keep waiting until deadline.
        }

        if (abortRef.current) return;
        setStatusText("等待支付");
        pollTimerRef.current = setTimeout(() => {
          void tick();
        }, pollIntervalMs);
      };

      setStatusText("等待支付");
      await tick();
    },
    [clearPoll, onPaidSuccess],
  );

  const startPaymentFlow = useCallback(async () => {
    abortRef.current = false;
    paidRef.current = false;
    clearPoll();
    setOpen(true);
    setPhase("starting");
    setStatusText("微信扫码支付");
    setErrorText(null);
    setQrDataUrl(null);
    setOrderId(null);

    const projectId = context.projectId?.trim() || "";
    if (!projectId) {
      setPhase("failed");
      setStatusText("支付失败 / 超时");
      setErrorText("缺少项目上下文，无法发起支付");
      return;
    }

    try {
      // Server-authoritative PRO amount: do not send client amount.
      const createRes = await fetch("/api/pay/create-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: resolvePlanId(context),
          projectId,
          targetLevel: "pro",
        }),
      });
      const createData = (await createRes.json().catch(() => ({}))) as CreateOrderResponse;
      if (abortRef.current) return;
      if (!createRes.ok || !createData.ok || !createData.orderId) {
        setPhase("failed");
        setStatusText("支付失败 / 超时");
        setErrorText(createData.message || "创建订单失败");
        return;
      }

      const createdOrderId = createData.orderId.trim();
      setOrderId(createdOrderId);

      const startRes = await fetch("/api/pay/start-payment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createdOrderId,
          planId: resolvePlanId(context),
          targetLevel: "pro",
        }),
      });
      const startData = (await startRes.json().catch(() => ({}))) as StartPaymentResponse;
      if (abortRef.current) return;
      if (!startRes.ok || !startData.ok || !startData.paymentSession) {
        setPhase("failed");
        setStatusText("支付失败 / 超时");
        setErrorText(startData.message || "发起支付失败");
        return;
      }

      const session = startData.paymentSession;
      if (session.kind !== "wechat_native") {
        setPhase("failed");
        setStatusText("支付失败 / 超时");
        setErrorText("当前支付渠道不可用，请稍后重试");
        return;
      }

      const codeUrl = typeof session.codeUrl === "string" ? session.codeUrl.trim() : "";
      const statusUrl =
        typeof session.statusUrl === "string" ? session.statusUrl.trim() : "";
      if (!codeUrl || !statusUrl) {
        setPhase("failed");
        setStatusText("支付失败 / 超时");
        setErrorText("支付会话不完整");
        return;
      }

      const dataUrl = await QRCode.toDataURL(codeUrl, {
        margin: 1,
        width: 220,
        errorCorrectionLevel: "M",
      });
      if (abortRef.current) return;

      setQrDataUrl(dataUrl);
      setPhase("awaiting_scan");
      setStatusText("微信扫码支付");

      const pollMs =
        typeof session.pollIntervalMs === "number" && session.pollIntervalMs > 0
          ? session.pollIntervalMs
          : 2500;
      await pollUntilPaid(statusUrl, pollMs);
    } catch {
      if (abortRef.current) return;
      setPhase("failed");
      setStatusText("支付失败 / 超时");
      setErrorText("支付发起失败，请稍后重试");
    }
  }, [clearPoll, context, pollUntilPaid]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      clearPoll();
    };
  }, [clearPoll]);

  const busy = phase === "starting";

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        className={buttonClass}
        disabled={busy}
        onClick={() => {
          void startPaymentFlow();
        }}
      >
        {ctaLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  升级{proTier.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  {proTier.label} · ¥{proTier.monthlyPriceCny}/月 · {proTier.headline}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={busy}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                关闭
              </button>
            </div>

            <div className="space-y-4">
              <p
                className={
                  phase === "paid"
                    ? "text-sm font-medium text-emerald-300"
                    : phase === "failed"
                      ? "text-sm font-medium text-rose-300"
                      : "text-sm font-medium text-zinc-200"
                }
              >
                {statusText}
              </p>

              {phase === "starting" ? (
                <p className="text-sm text-white/60">正在创建支付订单…</p>
              ) : null}

              {qrDataUrl && (phase === "awaiting_scan" || phase === "paid") ? (
                <div className="flex flex-col items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt="微信支付二维码"
                    width={220}
                    height={220}
                    className="rounded-xl border border-white/10 bg-white p-2"
                  />
                  {phase === "awaiting_scan" ? (
                    <p className="text-center text-xs text-white/55">
                      请使用微信扫描二维码完成支付
                    </p>
                  ) : null}
                </div>
              ) : null}

              {errorText ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorText}
                </div>
              ) : null}

              {phase === "paid" ? (
                <p className="text-sm text-white/70">
                  授权已就绪，可继续生成预算。
                </p>
              ) : null}

              {phase === "failed" ? (
                <button
                  type="button"
                  className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
                  onClick={() => {
                    void startPaymentFlow();
                  }}
                >
                  重新发起支付
                </button>
              ) : null}

              {orderId && phase !== "starting" ? (
                <p className="text-[11px] text-white/35">订单号 {orderId}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
}
