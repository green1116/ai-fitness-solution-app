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
    }
  | {
      ok: false;
      code?: string;
      message?: string;
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

function buildZipFilename(planId: string) {
  return `AI_Fitness_Solution_Tender_Pack-enterprise-${planId}.zip`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DownloadEnterpriseZipButton({
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

  // ========= POST（有解析文本） =========
  const handleParsedZip = useCallback(async () => {
    const rawText = String(tenderRawText || "").trim();
    if (!rawText) throw new Error("tenderRawText is empty");

    const qs = new URLSearchParams({
      planId,
      format: "zip",
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourceName: tenderFileName || "tender.txt",
        rawText,
      }),
    });

    if (!res.ok) {
      const { rawText: errText, json } = await safeReadJsonOrText(res);
      throw new Error(
        json?.message ||
          json?.code ||
          errText ||
          `zip download failed: ${res.status}`
      );
    }

    const blob = await res.blob();
    triggerDownload(blob, buildZipFilename(planId));
  }, [planId, tenderRawText, tenderFileName, internalDebug]);

  // ========= GET（旧 token 流） =========
  const handleLegacyZip = useCallback(async () => {
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
      throw new Error(json?.message || json?.code || rawText || "token failed");
    }

    const tokenData = json as TokenResp;
    const token =
      (tokenData as any).downloadToken || (tokenData as any).token || "";

    if (!token) throw new Error("download token missing");

    const apiUrl = new URL("/api/tender-pack", window.location.origin);
    apiUrl.searchParams.set("planId", planId);
    apiUrl.searchParams.set("format", "zip");
    apiUrl.searchParams.set("level", "enterprise");
    apiUrl.searchParams.set("theme", "brand");
    apiUrl.searchParams.set("variant", "enterprise");
    apiUrl.searchParams.set("includeCover", "1");
    apiUrl.searchParams.set("downloadToken", token);

    const res = await fetch(apiUrl.toString());

    if (!res.ok) {
      const { rawText: errText, json } = await safeReadJsonOrText(res);
      throw new Error(json?.message || json?.code || errText || "zip failed");
    }

    const blob = await res.blob();
    triggerDownload(blob, buildZipFilename(planId));
  }, [planId]);

  const handleClick = useCallback(async () => {
    if (!planId || loading) return;

    try {
      setLoading(true);

      if (hasTenderText) {
        await handleParsedZip();
      } else {
        await handleLegacyZip();
      }
    } catch (e: any) {
      console.error("[DownloadEnterpriseZipButton]", e);
      alert(e?.message || "下载失败");
    } finally {
      setLoading(false);
    }
  }, [planId, loading, hasTenderText, handleParsedZip, handleLegacyZip]);

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "打包中..." : children || "下载企业投标包 ZIP"}
    </button>
  );
}
