"use client";

import React, { useCallback, useMemo, useState } from "react";

type Props = {
  planId: string;
  tenderRawText?: string;
  tenderFileName?: string;
  internalDebug?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type TokenResp =
  | {
      ok: true;
      downloadToken?: string;
      token?: string;
      planId?: string;
      mode?: string;
      variant?: string;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
      extra?: any;
    };

async function safeReadJsonOrText(
  res: Response
): Promise<{ rawText: string; json: any | null }> {
  const rawText = await res.text().catch(() => "");
  if (!rawText) return { rawText: "", json: null };

  try {
    return {
      rawText,
      json: JSON.parse(rawText),
    };
  } catch {
    return {
      rawText,
      json: null,
    };
  }
}

function buildMergedFilename(planId: string) {
  return `AI_Fitness_Solution_Tender_Merged-enterprise-${planId}.pdf`;
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DownloadEnterpriseMergedButton({
  planId,
  tenderRawText,
  tenderFileName,
  internalDebug = false,
  className,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);

  const hasTenderText = useMemo(
    () => !!String(tenderRawText || "").trim(),
    [tenderRawText]
  );

  const handleParsedPostDownload = useCallback(async () => {
    const rawText = String(tenderRawText || "").trim();
    if (!rawText) {
      throw new Error("tenderRawText is empty");
    }

    const qs = new URLSearchParams({
      planId,
      format: "merged",
      level: "enterprise",
      theme: "brand",
      variant: "enterprise",
      includeCover: "1",
    });

    if (internalDebug) {
      qs.set("internal", "1");
    }

    const res = await fetch(`/api/tender-pack?${qs.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        sourceName: tenderFileName || "tender-source.txt",
        rawText,
      }),
    });

    if (!res.ok) {
      const { rawText: errText, json } = await safeReadJsonOrText(res);
      throw new Error(
        json?.message ||
          json?.code ||
          errText ||
          `parsed merged download failed: ${res.status}`
      );
    }

    const blob = await res.blob();
    triggerBrowserDownload(blob, buildMergedFilename(planId));
  }, [internalDebug, planId, tenderFileName, tenderRawText]);

  const handleLegacyGetDownload = useCallback(async () => {
    const tokenUrl = new URL("/api/download-token", window.location.origin);
    tokenUrl.searchParams.set("planId", planId);
    tokenUrl.searchParams.set("mode", "pack");
    tokenUrl.searchParams.set("variant", "enterprise");

    const tokenRes = await fetch(tokenUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const { json, rawText } = await safeReadJsonOrText(tokenRes);
    if (!tokenRes.ok || !json?.ok) {
      throw new Error(
        json?.message ||
          json?.code ||
          rawText ||
          `download token failed: ${tokenRes.status}`
      );
    }

    const tokenData = json as TokenResp;
    const downloadToken =
      (tokenData as any).downloadToken || (tokenData as any).token || "";

    if (!downloadToken) {
      throw new Error("download token missing");
    }

    const apiUrl = new URL("/api/tender-pack", window.location.origin);
    apiUrl.searchParams.set("planId", planId);
    apiUrl.searchParams.set("format", "merged");
    apiUrl.searchParams.set("level", "enterprise");
    apiUrl.searchParams.set("theme", "brand");
    apiUrl.searchParams.set("variant", "enterprise");
    apiUrl.searchParams.set("includeCover", "1");
    apiUrl.searchParams.set("downloadToken", downloadToken);

    const res = await fetch(apiUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const { rawText: errText, json: errJson } = await safeReadJsonOrText(res);
      throw new Error(
        errJson?.message ||
          errJson?.code ||
          errText ||
          `legacy merged download failed: ${res.status}`
      );
    }

    const blob = await res.blob();
    triggerBrowserDownload(blob, buildMergedFilename(planId));
  }, [planId]);

  const handleClick = useCallback(async () => {
    if (!planId || loading) return;

    try {
      setLoading(true);

      if (hasTenderText) {
        await handleParsedPostDownload();
        return;
      }

      await handleLegacyGetDownload();
    } catch (err: any) {
      console.error("[DownloadEnterpriseMergedButton] failed", err);
      alert(err?.message || "下载失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [
    hasTenderText,
    handleLegacyGetDownload,
    handleParsedPostDownload,
    loading,
    planId,
  ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || !planId}
      className={className}
    >
      {loading ? "生成中..." : children || "下载企业投标版"}
    </button>
  );
}