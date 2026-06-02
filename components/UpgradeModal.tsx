"use client";

import React, { useCallback, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { CommercialPlanLevel } from "@/lib/commercial/enterpriseUnlockStorage";
import { CheckoutRedirectError } from "@/lib/commercial/checkoutRedirectError";
import { pickVariant } from "@/lib/abTest";

export type UpgradeStartPaidPurchase = (
  target: "pro" | "enterprise",
) => Promise<void>;

type Props = {
  open: boolean;
  onClose: () => void;
  currentTierLabel: string;
  analytics: { planId: string };
  entryMode?: "upgrade" | "lead";
  /** 真实收银：create-order → start-payment → webhook；不得在此阶段触发 PDF/ZIP 下载 */
  startPaidPurchase: UpgradeStartPaidPurchase;
  /** 支付完成且 entitlement 就绪后，由用户明确点击触发；不得自动调用 */
  onManualDownloadPdf: (tier: "pro" | "enterprise") => void | Promise<void>;
  onManualDownloadZip: () => void | Promise<void>;
  onReturn: () => void;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function UpgradeModal({
  open,
  onClose,
  currentTierLabel,
  analytics,
  entryMode = "upgrade",
  startPaidPurchase,
  onManualDownloadPdf,
  onManualDownloadZip,
  onReturn,
}: Props) {
  const variant = pickVariant(analytics.planId);
  const [discountDeadlineTs, setDiscountDeadlineTs] = useState<number | null>(
    null,
  );
  const [nowTs, setNowTs] = useState(() => Date.now());
  const DISCOUNT_WINDOW_MS = 10 * 60 * 1000;
  const remainingSeconds = Math.max(
    0,
    Math.ceil(((discountDeadlineTs ?? nowTs) - nowTs) / 1000),
  );
  const discountExpired = remainingSeconds <= 0;
  const proShownPrice = discountExpired ? 199 : 99;
  const enterpriseShownPrice = discountExpired ? 999 : 499;
  const proPrice = `¥${proShownPrice}`;
  const enterprisePrice = `¥${enterpriseShownPrice}`;
  const valueCopy =
    variant === "A"
      ? "解锁完整投标方案 PDF"
      : "立即获取可直接提交的投标文件";
  const [phase, setPhase] = useState<"idle" | "paying">("idle");
  const [error, setError] = useState<string | null>(null);
  const [justUpgraded, setJustUpgraded] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState<CommercialPlanLevel | null>(
    null,
  );
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitSuccess, setLeadSubmitSuccess] = useState<string | null>(null);
  const [leadSubmitLeadId, setLeadSubmitLeadId] = useState<string | null>(null);
  const [leadSubmitError, setLeadSubmitError] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({
    company: "",
    name: "",
    email: "",
    note: "",
  });

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setJustUpgraded(false);
    setUnlockedLevel(null);
    setLeadFormOpen(false);
    setLeadSubmitting(false);
    setLeadSubmitSuccess(null);
    setLeadSubmitLeadId(null);
    setLeadSubmitError(null);
    setLeadForm({
      company: "",
      name: "",
      email: "",
      note: "",
    });
  }, []);

  const isFreeCurrent = currentTierLabel.trim().toLowerCase() === "free";

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  React.useEffect(() => {
    if (!open) return;
    if (entryMode === "lead") {
      setLeadSubmitError(null);
      setLeadSubmitSuccess(null);
      setLeadFormOpen(true);
    }
  }, [open, entryMode]);

  React.useEffect(() => {
    if (!open) return;
    const start = Date.now();
    setNowTs(start);
    setDiscountDeadlineTs(start + DISCOUNT_WINDOW_MS);
  }, [open]);

  React.useEffect(() => {
    if (!open || !discountDeadlineTs) return;
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, discountDeadlineTs]);

  React.useEffect(() => {
    if (!open) return;
    trackEvent("ab_variant", {
      planId: analytics.planId,
      variant,
    });
  }, [open, analytics.planId, variant]);

  React.useEffect(() => {
    if (!open || discountExpired) return;
    trackEvent("price_variant_view", {
      planId: analytics.planId,
      variant,
      shownPrice: 99,
      targetLevel: "pro",
    });
    trackEvent("price_variant_view", {
      planId: analytics.planId,
      variant,
      shownPrice: 499,
      targetLevel: "enterprise",
    });
  }, [open, analytics.planId, variant, discountExpired]);

  const handlePick = useCallback(
    async (target: "pro" | "enterprise") => {
      setError(null);
      setJustUpgraded(false);
      setPhase("paying");
      try {
        const event =
          target === "pro"
            ? "click_upgrade_pro"
            : "click_upgrade_enterprise";
        trackEvent(event, {
          planId: analytics.planId,
          targetLevel: target,
        });

        await startPaidPurchase(target);

        setPhase("idle");
        setJustUpgraded(true);
        setUnlockedLevel(target);
        trackEvent("upgrade_success", {
          planId: analytics.planId,
          variant,
          targetLevel: target,
        });
      } catch (e: unknown) {
        if (e instanceof CheckoutRedirectError) {
          setPhase("idle");
          return;
        }
        setPhase("idle");
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [analytics.planId, startPaidPurchase, variant],
  );

  const handleLeadSubmit = useCallback(async () => {
    const company = leadForm.company.trim();
    const name = leadForm.name.trim();
    const email = leadForm.email.trim().toLowerCase();
    const note = leadForm.note.trim();

    if (!company || !name || !email) {
      setLeadSubmitError("请填写公司名称、联系人和邮箱。");
      return;
    }
    if (!isValidEmail(email)) {
      setLeadSubmitError("邮箱格式不正确。");
      return;
    }

    setLeadSubmitting(true);
    setLeadSubmitError(null);
    setLeadSubmitSuccess(null);
    try {
      const res = await fetch("/api/lead/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: analytics.planId,
          company,
          name,
          email,
          note: note || undefined,
          createdAt: new Date().toISOString(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error("系统繁忙，请稍后重试");
      }

      trackEvent("lead_submit", {
        planId: analytics.planId,
        planLevel: "free",
      });
      setLeadSubmitLeadId(String(data?.leadId || ""));
      setLeadSubmitSuccess("我们会在 24 小时内联系你");
      setLeadFormOpen(false);
    } catch (err: unknown) {
      setLeadSubmitError(
        err instanceof Error ? err.message : "系统繁忙，请稍后重试",
      );
    } finally {
      setLeadSubmitting(false);
    }
  }, [analytics.planId, leadForm]);

  if (!open) return null;

  const busy = phase === "paying";

  const manualPdfTier: "pro" | "enterprise" =
    unlockedLevel === "enterprise" ? "enterprise" : "pro";

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
        <div className="mb-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          你的投标方案已生成，可立即下载完整文件
        </div>
        <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {discountExpired
            ? "优惠已结束"
            : `本次生成结果限时 10 分钟内可优惠下载（剩余 ${String(
                Math.floor(remainingSeconds / 60),
              ).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(
                2,
                "0",
              )}）`}
        </div>
        <div className="mb-4 text-sm text-red-300">
          本次分析结果关闭后将失效，需重新生成
        </div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">升级套餐</h2>
            <p className="mt-1 text-sm text-white/60">
              当前档位：<span className="text-white/90">{currentTierLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg px-2 py-1 text-sm text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              aria-label="关闭"
            >
              ✕
            </button>
            <span className="text-xs text-white/45">稍后再说（可能失去优惠）</span>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {justUpgraded ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-white/75">支付已完成，授权已就绪</p>
            <p className="text-xs leading-5 text-white/60">
              请手动点击下方按钮下载；不会在后台自动发起下载，也不会在刷新后自动下载。
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  trackEvent("download_success", {
                    planId: analytics.planId,
                    mode: "pack",
                    source: "upgrade_modal_success",
                    format: "pdf",
                  });
                  void onManualDownloadPdf(manualPdfTier);
                }}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                立即下载 PDF
              </button>
              {unlockedLevel === "enterprise" ? (
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("download_success", {
                      planId: analytics.planId,
                      mode: "pack",
                      source: "upgrade_modal_success",
                      format: "zip",
                    });
                    void onManualDownloadZip();
                    onReturn();
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  立即下载 ZIP
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onReturn}
              className="w-full rounded-xl border border-white/10 py-2.5 text-sm text-white/70 transition hover:bg-white/5"
            >
              返回页面
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm leading-6 text-white/65">
              选择目标版本以继续。
            </p>

            {busy ? (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                正在发起支付…
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <div className="mb-1 inline-flex items-center rounded-full border border-emerald-300/35 bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                  🔥 推荐
                </div>
                <div className="text-sm font-semibold text-emerald-100">
                  Pro · {valueCopy}
                </div>
                <p className="mt-1 text-xs leading-5 text-emerald-100/80">
                  适合需要正式投标材料的团队，支付完成后可下载完整 PDF
                </p>
                <p className="mt-1 text-xs leading-5 text-emerald-100/90">
                  已为你生成完整投标方案，仅差一步即可获取
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-xs text-emerald-100/60 line-through">
                    原价 ¥199
                  </span>
                  <span className="text-sm font-semibold text-emerald-100">
                    {discountExpired ? "当前价 ¥199" : "限时价 ¥99"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-emerald-100/85">
                  仅需 ¥99 即可获得完整投标文件
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handlePick("pro")}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {`👉 立即获取投标文件（仅 ${proPrice}）`}
                </button>
              </div>

              <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-4">
                <div className="mb-1 inline-flex items-center rounded-full border border-violet-300/35 bg-violet-400/15 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
                  ⭐ 企业首选
                </div>
                <div className="text-sm font-semibold text-violet-100">
                  Enterprise · 解锁投标包 PDF + ZIP
                </div>
                <p className="mt-1 text-xs leading-5 text-violet-100/80">
                  {valueCopy}，并可下载 PDF + 结构化 ZIP
                </p>
                <p className="mt-1 text-xs leading-5 text-violet-100/90">
                  适用于企业投标归档与正式提交
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-xs text-violet-100/60 line-through">
                    原价 ¥999
                  </span>
                  <span className="text-sm font-semibold text-violet-100">
                    {discountExpired ? "当前价 ¥999" : "限时价 ¥499"}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handlePick("enterprise")}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/15 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {`${enterprisePrice} ${discountExpired ? "获取完整投标包（PDF + ZIP）" : "获取完整投标包（PDF + ZIP）"}`}
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setLeadSubmitError(null);
                setLeadFormOpen(true);
              }}
              className="mt-4 w-full rounded-xl border border-cyan-300/35 bg-cyan-500/10 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:opacity-40"
            >
              获取完整方案（稍后联系）
            </button>

            {!isFreeCurrent ? (
              <button
                type="button"
                disabled={busy}
                onClick={onReturn}
                className="mt-4 w-full rounded-xl border border-white/10 py-2.5 text-sm text-white/60 transition hover:bg-white/5 disabled:opacity-40"
              >
                暂不升级
              </button>
            ) : null}
            <div className="mt-3 text-center text-xs text-white/45">
              已有 23 人下载了该方案
            </div>
            {leadSubmitSuccess ? (
              <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-100">
                {leadSubmitSuccess}
                {leadSubmitLeadId ? `（线索ID：${leadSubmitLeadId}）` : ""}
              </div>
            ) : null}
          </>
        )}
      </div>

      {leadFormOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">获取完整方案（稍后联系）</h3>
              <button
                type="button"
                onClick={() => setLeadFormOpen(false)}
                className="rounded px-2 py-1 text-xs text-white/50 hover:bg-white/10 hover:text-white"
              >
                关闭
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={leadForm.company}
                onChange={(e) =>
                  setLeadForm((prev) => ({ ...prev, company: e.target.value }))
                }
                placeholder="公司名称（必填）"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
              />
              <input
                value={leadForm.name}
                onChange={(e) =>
                  setLeadForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="联系人（必填）"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
              />
              <input
                value={leadForm.email}
                onChange={(e) =>
                  setLeadForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="邮箱（必填）"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
              />
              <textarea
                value={leadForm.note}
                onChange={(e) =>
                  setLeadForm((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="备注（可选）"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/25"
              />
            </div>

            {leadSubmitError ? (
              <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {leadSubmitError}
              </div>
            ) : null}

            <button
              type="button"
              disabled={leadSubmitting}
              onClick={() => void handleLeadSubmit()}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:opacity-50"
            >
              {leadSubmitting ? "提交中..." : "提交线索"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
