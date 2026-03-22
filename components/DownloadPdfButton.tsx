"use client";

import React, { useCallback, useMemo, useState } from "react";

type Mode = "full" | "preview" | "budget";

type Props = {
  planId: string;
  defaultMode?: Mode;
  showBudgetButton?: boolean;
};

type TokenResp =
  | { ok: true; downloadToken: string }
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
  return u.toString();
}

const ACCESS_LEVEL: "free" | "pro" = "free";

async function getDownloadToken(planId: string, mode: Mode) {
  const u = new URL("/api/download-token", window.location.origin);
  u.searchParams.set("planId", planId);
  u.searchParams.set("mode", mode);
  u.searchParams.set("level", ACCESS_LEVEL);

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

  const data: TokenResp = (json ?? {}) as any;
  if (!data || (data as any).ok !== true || !(data as any).downloadToken) {
    const code = (data as any)?.code || "BAD_TOKEN_RESPONSE";
    const message = (data as any)?.message || "Invalid token response";
    const err = new Error(`${code}: ${message}`);
    // @ts-expect-error meta
    err.meta = { status: res.status, code, message, rawText, json };
    throw err;
  }

  return (data as any).downloadToken as string;
}

function triggerBrowserDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
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

  const canDownload = useMemo(() => Boolean(planId && planId.trim()), [planId]);

  const handlePreviewDownload = useCallback(async () => {
    if (!canDownload) {
      alert("缺少 planId，暂时无法下载。");
      return;
    }

    setLoadingMode(defaultMode === "budget" ? "budget" : "full");

    try {
      const mode: Mode = defaultMode === "budget" ? "budget" : "full";
      const token = await getDownloadToken(planId, mode);
      const pdfUrl = buildPdfUrl("/api/pdf", planId, mode, token);
      triggerBrowserDownload(pdfUrl);
    } catch (e: any) {
      const meta = e?.meta || {};
      console.error("[DownloadPdfButton] preview download failed:", e, meta);

      const status = meta.status ? `HTTP ${meta.status}` : "";
      const code = meta.code || "";
      const message = meta.message || e?.message || "Unknown error";

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

    setLoadingMode("budget");

    try {
      const token = await getDownloadToken(planId, "budget");
      const pdfUrl = buildPdfUrl("/api/pdf", planId, "budget", token);
      triggerBrowserDownload(pdfUrl);
    } catch (e: any) {
      const meta = e?.meta || {};
      console.error("[DownloadPdfButton] budget download failed:", e, meta);

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
    setLeadMessage("正在提交并生成下载...");

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

      const downloadUrl = String(data?.downloadUrl || "").trim();
      if (!downloadUrl) {
        throw new Error("后端未返回下载地址");
      }

      setLeadMessage("已提交，正在开始下载...");
      triggerBrowserDownload(new URL(downloadUrl, window.location.origin).toString());
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
          {loadingMode === "full"
            ? "正在生成预览..."
            : defaultMode === "budget"
              ? "下载预算预览版"
              : "下载预览版"}
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canDownload || loadingMode !== null}
          onClick={handleUnlockPro}
        >
          解锁 Pro 完整版
        </button>

        {showBudgetButton && defaultMode !== "budget" && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canDownload || loadingMode !== null}
            onClick={handleBudgetPreview}
          >
            {loadingMode === "budget" ? "正在生成预算预览..." : "下载预算预览版"}
          </button>
        )}
      </div>

      <p className="text-xs leading-5 text-white/65">
        预览版用于快速查看核心内容。完整版将提供完整方案、完整预算信息、无预览限制的正式 PDF 文档。
      </p>

      {unlockOpen && (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
          <div className="mb-2 text-sm font-medium text-white">解锁 Pro 完整版</div>
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