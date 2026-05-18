"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type Mode = "full";

type Props = {
  planId: string;
  /** @deprecated 保留兼容，不再使用 */
  defaultMode?: "full" | "preview" | "budget";
  /** @deprecated 保留兼容，不再使用 */
  showBudgetButton?: boolean;
  canDownloadNow?: boolean;
  onResolveRiskBeforeDownload?: () => void;
};

const UNLOCK_STORAGE_KEY = "attaguy_unlockToken";
const UNLOCK_PLAN_KEY = "attaguy_unlockPlanId";

type TokenResp =
  | { ok: true; downloadToken: string; token?: string }
  | { ok: false; code?: string; message?: string; extra?: any };

async function safeReadJsonOrText(
  res: Response
): Promise<{ rawText: string; json: any | null }> {
  const rawText = await res.text().catch(() => "");
  if (!rawText) return { rawText: "", json: null };

  try {
    return { rawText, json: JSON.parse(rawText) };
  } catch {
    return { rawText, json: null };
  }
}

function getBrowserTz() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function getStoredUnlockToken(planId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const storedPlan = localStorage.getItem(UNLOCK_PLAN_KEY);
    if (storedPlan !== planId) return null;
    return localStorage.getItem(UNLOCK_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeUnlockToken(planId: string, token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UNLOCK_STORAGE_KEY, token);
    localStorage.setItem(UNLOCK_PLAN_KEY, planId);
  } catch {
    // ignore
  }
}

function buildPdfUrl(
  basePath: string,
  planId: string,
  mode: Mode,
  downloadToken: string
) {
  const u = new URL(basePath, window.location.origin);
  u.searchParams.set("planId", planId);
  u.searchParams.set("mode", mode);
  u.searchParams.set("downloadToken", downloadToken);
  u.searchParams.set("tz", getBrowserTz());
  u.searchParams.set("download", "1");
  u.searchParams.set("variant", "sales");
  return u.toString();
}

async function getDownloadToken(
  planId: string,
  mode: Mode,
  unlockToken: string | null
): Promise<string> {
  const u = new URL("/api/download-token", window.location.origin);
  u.searchParams.set("planId", planId);
  u.searchParams.set("mode", mode);
  u.searchParams.set("variant", "sales");

  if (unlockToken) {
    u.searchParams.set("unlockToken", unlockToken);
  }

  const res = await fetch(u.toString(), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const { rawText, json } = await safeReadJsonOrText(res);

  if (!res.ok) {
    const code = json?.code || `HTTP_${res.status}`;
    const message =
      json?.message || rawText || res.statusText || "Request failed";
    const err = new Error(`${code}: ${message}`);
    // @ts-expect-error meta
    err.meta = { status: res.status, code, message, rawText, json };
    throw err;
  }

  const data = (json ?? {}) as TokenResp & {
    downloadToken?: string;
    token?: string;
  };
  const token = data?.downloadToken ?? data?.token;
  if (!data || (data as any).ok !== true || !token) {
    const code = (data as any)?.code || "BAD_TOKEN_RESPONSE";
    const message = (data as any)?.message || "Invalid token response";
    const err = new Error(`${code}: ${message}`);
    // @ts-expect-error meta
    err.meta = { status: res.status, code, message, rawText, json };
    throw err;
  }

  return token as string;
}

function triggerBrowserDownload(url: string) {
  window.location.href = url;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DownloadPdfButton({
  planId,
  canDownloadNow = false,
  onResolveRiskBeforeDownload,
}: Props) {
  const blocked = !canDownloadNow;

  const [loadingMode, setLoadingMode] = useState<Mode | null>(null);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const unlockToken = useMemo(() => getStoredUnlockToken(planId), [planId]);
  useEffect(() => {
    setUnlocked(!!unlockToken);
  }, [unlockToken]);

  const canDownload = useMemo(() => Boolean(planId && planId.trim()), [planId]);

  const handleDownload = useCallback(async () => {
    if (!canDownload) {
      console.warn("[DownloadPdfButton] 缺少 planId，暂时无法下载。");
      return;
    }

    const stored = getStoredUnlockToken(planId);
    if (!stored) {
      setUnlockOpen(true);
      setLeadMessage("需要先解锁才能下载完整版。");
      return;
    }

    setLoadingMode("full");
    try {
      const token = await getDownloadToken(planId, "full", stored);
      const pdfUrl = buildPdfUrl("/api/pdf", planId, "full", token);
      triggerBrowserDownload(pdfUrl);
    } catch (e: any) {
      const meta = e?.meta || {};
      if (meta.code === "DOWNLOAD_LOCKED") {
        setUnlockOpen(true);
        setLeadMessage("解锁凭证已过期，请重新提交邮箱。");
        return;
      }
      console.error(
        "[DownloadPdfButton] full download failed",
        meta.message || e?.message || "下载失败",
        e
      );
    } finally {
      setLoadingMode(null);
    }
  }, [canDownload, planId]);

  const submitLead = useCallback(async () => {
    const v = email.trim().toLowerCase();

    if (!v) {
      setLeadMessage("请输入邮箱");
      return;
    }

    if (!isValidEmail(v)) {
      setLeadMessage("请输入正确的邮箱格式");
      return;
    }

    setSubmittingLead(true);
    setLeadMessage("正在提交并生成下载链接...");

    try {
      const res = await fetch("/api/lead/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: v,
          planId,
          intent: "unlock_pro",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "提交失败");
      }

      const unlockTok = String(data?.unlockToken || "").trim();
      if (unlockTok) {
        storeUnlockToken(planId, unlockTok);
        setUnlocked(true);
      }

      const downloadUrl = String(data?.downloadUrl || "").trim();
      if (downloadUrl) {
        if (blocked) {
          onResolveRiskBeforeDownload?.();
          return;
        }
        setLeadMessage("已提交，正在开始下载...");
        triggerBrowserDownload(
          new URL(downloadUrl, window.location.origin).toString()
        );
      } else {
        setLeadMessage("已提交成功，可下载完整版。");
      }
      setUnlockOpen(false);
    } catch (e: any) {
      setLeadMessage(e?.message || "提交失败，请稍后重试");
    } finally {
      setSubmittingLead(false);
    }
  }, [blocked, email, onResolveRiskBeforeDownload, planId]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => {
          if (blocked) {
            onResolveRiskBeforeDownload?.();
            return;
          }

          if (!unlocked) {
            setLeadMessage("");
            setUnlockOpen(true);
            return;
          }

          void handleDownload();
        }}
        disabled={!canDownload || loadingMode !== null}
        className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          blocked
            ? "bg-amber-500 text-black hover:bg-amber-400"
            : "bg-white text-black hover:bg-white/90"
        }`}
      >
        {loadingMode === "full"
          ? "正在生成..."
          : blocked
            ? "先处理风险后下载 PDF"
            : "下载 PDF"}
      </button>

      <p className="text-xs leading-5 text-white/65">
        完整版需先解锁（留资）。解锁后可下载 PDF。
      </p>

      {unlockOpen && (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
          <div className="mb-2 text-sm font-medium text-white">
            解锁 Pro 完整版
          </div>
          <div className="mb-3 text-sm text-zinc-300">
            留下邮箱后将立即生成可下载的 Pro 版本，同时用于后续商务沟通。
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35"
            />

            <button
              type="button"
              onClick={submitLead}
              disabled={submittingLead}
              className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {submittingLead ? "处理中..." : "提交解锁申请"}
            </button>
          </div>

          {leadMessage ? (
            <div className="mt-3 text-sm text-zinc-300">{leadMessage}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
