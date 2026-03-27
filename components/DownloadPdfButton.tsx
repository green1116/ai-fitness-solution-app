"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type Mode = "full" | "preview" | "budget";

type Props = {
  planId: string;
  defaultMode?: Mode;
  showBudgetButton?: boolean;
};

const UNLOCK_STORAGE_KEY = "attaguy_unlockToken";
const UNLOCK_PLAN_KEY = "attaguy_unlockPlanId";
const UNLOCK_TENDER_KEY = "attaguy_unlockTender";
const UNLOCK_TENDER_PLAN_KEY = "attaguy_unlockTenderPlanId";

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

/**
 * V6: 先申请 token 再下载
 * - preview: 无需 unlockToken
 * - full / budget: 需 unlockToken（留资后获得）
 */
async function getDownloadToken(
  planId: string,
  mode: Mode,
  unlockToken: string | null
): Promise<string> {
  const u = new URL("/api/download-token", window.location.origin);
  u.searchParams.set("planId", planId);
  u.searchParams.set("mode", mode);
  u.searchParams.set("variant", "sales");

  if (mode !== "preview" && unlockToken) {
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
    const message = json?.message || rawText || res.statusText || "Request failed";
    const err = new Error(`${code}: ${message}`);
    // @ts-expect-error meta
    err.meta = { status: res.status, code, message, rawText, json };
    throw err;
  }

  const data = (json ?? {}) as TokenResp & { downloadToken?: string; token?: string };
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
  defaultMode = "full",
  showBudgetButton = true,
}: Props) {
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

  const handlePreviewDownload = useCallback(async () => {
    if (!canDownload) {
      alert("缺少 planId，暂时无法下载。");
      return;
    }

    const mode: Mode = defaultMode === "budget" ? "budget" : "preview";

    // V6: budget 需要解锁，preview 免费
    if (mode === "budget") {
      const stored = getStoredUnlockToken(planId);
      if (!stored) {
        setLeadMessage("下载预算版需要先解锁，请留下邮箱。");
        setUnlockOpen(true);
        return;
      }
    }

    setLoadingMode(mode);

    try {
      const unlockTok = mode === "budget" ? getStoredUnlockToken(planId) : null;
      const token = await getDownloadToken(planId, mode, unlockTok);
      const pdfUrl = buildPdfUrl("/api/pdf", planId, mode, token);
      triggerBrowserDownload(pdfUrl);
    } catch (e: any) {
      const meta = e?.meta || {};

      if (
        mode === "budget" &&
        (meta.code === "DOWNLOAD_LOCKED" || meta.code === "UNLOCK_PLAN_MISMATCH")
      ) {
        setLeadMessage("解锁凭证已过期，请重新提交邮箱。");
        setUnlockOpen(true);
        return;
      }

      const status = meta.status ? `HTTP ${meta.status}` : "";
      const code = meta.code || "";
      const message = meta.message || e?.message || "下载失败";
      alert([status, code, message].filter(Boolean).join(" - "));
    } finally {
      setLoadingMode(null);
    }
  }, [canDownload, defaultMode, planId]);

  const handleBudgetPreview = useCallback(async () => {
    if (!canDownload) {
      alert("缺少 planId，暂时无法下载。");
      return;
    }

    const stored = getStoredUnlockToken(planId);
    if (!stored) {
      setLeadMessage("");
      setUnlockOpen(true);
      setLeadMessage("下载预算完整版需要先解锁，请留下邮箱。");
      return;
    }

    setLoadingMode("budget");

    try {
      const token = await getDownloadToken(planId, "budget", stored);
      const pdfUrl = buildPdfUrl("/api/pdf", planId, "budget", token);
      triggerBrowserDownload(pdfUrl);
    } catch (e: any) {
      const meta = e?.meta || {};
      console.error("[DownloadPdfButton] budget download failed:", e, meta);

      if (meta.code === "DOWNLOAD_LOCKED" || meta.code === "UNLOCK_PLAN_MISMATCH") {
        setUnlockOpen(true);
        setLeadMessage("解锁凭证已过期，请重新提交邮箱。");
        return;
      }

      const status = meta.status ? `HTTP ${meta.status}` : "";
      const code = meta.code || "";
      const message = meta.message || e?.message || "Unknown error";
      alert([status, code, message].filter(Boolean).join(" - "));
    } finally {
      setLoadingMode(null);
    }
  }, [canDownload, planId]);

  const handleUnlockPro = useCallback(() => {
    setLeadMessage("");
    setUnlockOpen(true);
  }, []);

  const handleFullDownload = useCallback(async () => {
    if (!canDownload) return;
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
      alert(meta.message || e?.message || "下载失败");
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
  }, [email, planId]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canDownload || loadingMode !== null}
          onClick={handlePreviewDownload}
        >
          {loadingMode === "preview"
            ? "正在生成预览..."
            : defaultMode === "budget"
              ? "下载预算预览版"
              : "下载预览版"}
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canDownload || loadingMode !== null}
          onClick={unlocked ? handleFullDownload : handleUnlockPro}
        >
          {unlocked
            ? loadingMode === "full"
              ? "正在生成..."
              : "下载完整方案"
            : "获取完整版方案"}
        </button>

        {showBudgetButton && defaultMode !== "budget" && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canDownload || loadingMode !== null}
            onClick={handleBudgetPreview}
          >
            {loadingMode === "budget"
              ? "正在生成预算..."
              : unlocked
                ? "下载预算完整版"
                : "下载预算完整版"}
          </button>
        )}
      </div>

      <p className="text-xs leading-5 text-white/65">
        预览版用于快速查看核心内容。完整版需要先解锁（留资），提供完整方案、完整预算信息。
      </p>

      {unlockOpen && (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
          <div className="mb-2 text-sm font-medium text-white">
            解锁 Pro 完整版
          </div>
          <div className="mb-3 text-sm text-zinc-300">
            留下邮箱后将立即生成可下载的 Pro 版本，同时用于后续商务沟通。解锁后可下载完整方案和预算版。
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
