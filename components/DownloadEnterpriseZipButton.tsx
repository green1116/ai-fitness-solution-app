"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { BidDecisionGateResult } from "@/lib/tender/gate/types";
import { mapScoreGateToPanelGate } from "@/lib/tender/gate/mapScoreGateToPanelGate";
import type { BidDecisionGateResult as ScoreBidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";

const PACK_RISK_BLOCK_CODE = "TENDER_PACK_BLOCKED_BY_RISK_GATE";

type Props = {
  planId: string;
  tenderRawText?: string;
  tenderFileName?: string;
  internalDebug?: boolean;
  className?: string;
  children?: React.ReactNode;
  /** 仅 `false` 中止下载；`true` / `undefined` 均继续 */
  beforeDownload?: () =>
    | boolean
    | undefined
    | Promise<boolean | undefined>;
  onPackRiskBlocked?: (gate: BidDecisionGateResult) => void;
  canDownloadNow?: boolean;
  onResolveRiskBeforeDownload?: () => void;
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
  beforeDownload,
  onPackRiskBlocked,
  canDownloadNow = false,
  onResolveRiskBeforeDownload,
}: Props) {
  const blocked = !canDownloadNow;

  const [loading, setLoading] = useState(false);

  const hasTenderText = useMemo(
    () => !!String(tenderRawText || "").trim(),
    [tenderRawText]
  );

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
      if (
        res.status === 409 &&
        json?.code === PACK_RISK_BLOCK_CODE &&
        json?.gate &&
        onPackRiskBlocked
      ) {
        onPackRiskBlocked(
          mapScoreGateToPanelGate(json.gate as ScoreBidDecisionGateResult)
        );
        return;
      }
      throw new Error(
        json?.message ||
          json?.code ||
          errText ||
          `zip download failed: ${res.status}`
      );
    }

    const blob = await res.blob();
    triggerDownload(blob, buildZipFilename(planId));
  }, [internalDebug, onPackRiskBlocked, planId, tenderFileName, tenderRawText]);

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
      const { rawText: errText, json: errJson } = await safeReadJsonOrText(res);
      if (
        res.status === 409 &&
        errJson?.code === PACK_RISK_BLOCK_CODE &&
        errJson?.gate &&
        onPackRiskBlocked
      ) {
        onPackRiskBlocked(
          mapScoreGateToPanelGate(errJson.gate as ScoreBidDecisionGateResult)
        );
        return;
      }
      throw new Error(
        errJson?.message || errJson?.code || errText || "zip failed"
      );
    }

    const blob = await res.blob();
    triggerDownload(blob, buildZipFilename(planId));
  }, [onPackRiskBlocked, planId]);

  const handleDownload = useCallback(async () => {
    if (!planId || loading) return;
    if (beforeDownload) {
      const ok = await beforeDownload();
      if (ok === false) {
        return;
      }
    }

    try {
      setLoading(true);

      if (hasTenderText) {
        await handleParsedZip();
      } else {
        await handleLegacyZip();
      }
    } catch (e: any) {
      const msg = e?.message || "下载失败";
      console.error("[DownloadEnterpriseZipButton]", msg, e);
    } finally {
      setLoading(false);
    }
  }, [
    beforeDownload,
    planId,
    loading,
    hasTenderText,
    handleParsedZip,
    handleLegacyZip,
  ]);

  const label = loading
    ? "打包中..."
    : children ?? (blocked ? "先处理风险后下载 ZIP" : "下载 ZIP");

  return (
    <button
      type="button"
      onClick={() => {
        if (blocked) {
          onResolveRiskBeforeDownload?.();
          return;
        }
        void handleDownload();
      }}
      disabled={loading}
      className={
        className ??
        `inline-flex w-full items-center justify-center rounded-xl px-5 py-4 text-base font-semibold transition disabled:opacity-50 ${
          blocked
            ? "border border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15"
            : "border border-white/15 bg-transparent text-white hover:bg-white/10"
        }`
      }
    >
      {label}
    </button>
  );
}
