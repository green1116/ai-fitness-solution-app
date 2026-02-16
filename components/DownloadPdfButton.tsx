// components/DownloadPdfButton.tsx
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

async function safeReadJsonOrText(res: Response): Promise<{ rawText: string; json: any | null }> {
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

function buildPdfUrl(basePath: string, planId: string, mode: Mode, downloadToken: string) {
  const u = new URL(basePath, window.location.origin);
  u.searchParams.set("planId", planId);
  u.searchParams.set("mode", mode);
  u.searchParams.set("downloadToken", downloadToken);

  // ✅ 把用户时区带给后端
  u.searchParams.set("tz", getBrowserTz());

  return u.toString();
}

async function getDownloadToken(planId: string, mode: Mode) {
  const u = new URL("/api/download-token", window.location.origin);
  u.searchParams.set("planId", planId);
  u.searchParams.set("mode", mode);

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
    // @ts-expect-error attach meta
    err.meta = { status: res.status, code, message, rawText, json };
    throw err;
  }

  const data: TokenResp = (json ?? {}) as any;
  if (!data || (data as any).ok !== true || !(data as any).downloadToken) {
    const code = (data as any)?.code || "BAD_TOKEN_RESPONSE";
    const message = (data as any)?.message || "Invalid token response";
    const err = new Error(`${code}: ${message}`);
    // @ts-expect-error attach meta
    err.meta = { status: res.status, code, message, rawText, json };
    throw err;
  }

  return (data as any).downloadToken as string;
}

export default function DownloadPdfButton({
  planId,
  defaultMode = "full",
  showBudgetButton = true,
}: Props) {
  const [loadingMode, setLoadingMode] = useState<Mode | null>(null);
  const canDownload = useMemo(() => Boolean(planId && planId.trim()), [planId]);

  const download = useCallback(
    async (mode: Mode) => {
      if (!canDownload) {
        alert("缺少 planId，无法下载");
        return;
      }

      setLoadingMode(mode);
      try {
        const token = await getDownloadToken(planId, mode);
        const pdfUrl = buildPdfUrl("/api/pdf", planId, mode, token);
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
      } catch (e: any) {
        const meta = e?.meta || {};
        console.error("[DownloadPdfButton] download failed:", e, meta);
        const status = meta.status ? `HTTP ${meta.status}` : "";
        const code = meta.code || "";
        const message = meta.message || e?.message || "Unknown error";
        alert([status, code, message].filter(Boolean).join(" - "));
      } finally {
        setLoadingMode(null);
      }
    },
    [canDownload, planId]
  );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={!canDownload || loadingMode !== null}
        onClick={() => download(defaultMode)}
      >
        {loadingMode === defaultMode ? "生成中…" : "下载方案 PDF"}
      </button>

      {showBudgetButton && (
        <button
          type="button"
          className="px-4 py-2 rounded bg-zinc-200 text-black disabled:opacity-50"
          disabled={!canDownload || loadingMode !== null}
          onClick={() => download("budget")}
        >
          {loadingMode === "budget" ? "生成中…" : "下载预算 PDF"}
        </button>
      )}
    </div>
  );
}
