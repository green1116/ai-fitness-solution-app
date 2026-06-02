// @ts-nocheck
"use client";

import { useCallback, useState } from "react";
import BidDecisionGatePanel from "@/components/BidDecisionGatePanel";
import type {
  BidDecisionGateResult,
  BidRiskItem,
} from "@/lib/tender/gate/types";
import { jumpToRiskTarget } from "@/lib/tender/gate/jumpToRiskTarget";
import { mapScoreGateToPanelGate } from "@/lib/tender/gate/mapScoreGateToPanelGate";
import type { BidDecisionGateResult as ScoreBidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";

const UNLOCK_ENTERPRISE_KEY = "attaguy_unlockEnterprise";
const UNLOCK_ENTERPRISE_PLAN_KEY = "attaguy_unlockEnterprisePlanId";

function getStoredEnterpriseUnlockToken(planId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const storedPlan = localStorage.getItem(UNLOCK_ENTERPRISE_PLAN_KEY);
    if (storedPlan !== planId) return null;
    return localStorage.getItem(UNLOCK_ENTERPRISE_KEY);
  } catch {
    return null;
  }
}

function storeEnterpriseUnlockToken(planId: string, token: string) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(UNLOCK_ENTERPRISE_KEY, token);
    localStorage.setItem(UNLOCK_ENTERPRISE_PLAN_KEY, planId);

    // 同时写通用 key，和 DownloadPdfButton 那边保持一致
    localStorage.setItem(UNLOCK_STORAGE_KEY, token);
    localStorage.setItem(UNLOCK_PLAN_KEY, planId);
  } catch {
    // ignore
  }
}

function clearEnterpriseUnlockToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(UNLOCK_ENTERPRISE_KEY);
    localStorage.removeItem(UNLOCK_ENTERPRISE_PLAN_KEY);
  } catch {}
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DownloadEnterprisePackButton({
  planId,
}: {
  planId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [gate, setGate] = useState<BidDecisionGateResult | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [activeRiskId, setActiveRiskId] = useState<string | null>(null);
  const [fixingRiskId, setFixingRiskId] = useState<string | null>(null);
  const [riskFixResults, setRiskFixResults] = useState<Record<string, string>>(
    {}
  );

  const closeGate = useCallback(() => {
    setShowGate(false);
    setActiveRiskId(null);
    setFixingRiskId(null);
  }, []);

  /**
   * ✅ 预检查
   */
  const runTenderPackPrecheck = useCallback(async () => {
    const res = await fetch("/api/tender-pack/precheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, mode: "enterprise" }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok || !data?.gate) {
      throw new Error(data?.message || "投标包预检查失败");
    }

    return data as { gate: ScoreBidDecisionGateResult };
  }, [planId]);

  /**
   * ✅ 真正下载（关键修复点）
   */
  const proceedTenderPackDownload = useCallback(
    async (forceAllow = false) => {
      const unlockToken = getStoredEnterpriseUnlockToken(planId);

      if (!unlockToken) {
        setMessage("");
        setUnlockOpen(true);
        setMessage("下载企业投标包前，请先提交邮箱完成解锁。");
        return;
      }

      const tokenRes = await fetch(
        `/api/download-token?planId=${planId}&mode=pack&variant=enterprise&unlockToken=${unlockToken}`
      );

      const data = await tokenRes.json().catch(() => ({}));

      if (!tokenRes.ok || !data?.ok) {
        if (tokenRes.status === 403) {
          clearEnterpriseUnlockToken();
          setUnlockOpen(true);
          setMessage("解锁凭证已失效，请重新提交邮箱获取新的下载凭证。");
          return;
        }
        throw new Error(data?.message || "TOKEN_FAILED");
      }

      const downloadToken = data.downloadToken;

      const apiUrl = new URL("/api/tender-pack", window.location.origin);
      apiUrl.searchParams.set("planId", planId);
      apiUrl.searchParams.set("format", "zip");
      apiUrl.searchParams.set("level", "enterprise");
      apiUrl.searchParams.set("theme", "brand");
      apiUrl.searchParams.set("variant", "enterprise");
      apiUrl.searchParams.set("includeCover", "1");
      apiUrl.searchParams.set("downloadToken", downloadToken);

      if (forceAllow) {
        apiUrl.searchParams.set("forceAllow", "1");
      }

      /**
       * ✅ 核心修复：强制 POST + header
       */
      const res = await fetch(apiUrl.toString(), {
        method: "POST",
        headers: forceAllow
          ? {
              "Content-Type": "application/json",
              "x-force-allow": "1",
            }
          : {
              "Content-Type": "application/json",
            },
        body: JSON.stringify({
          planId,
        }),
      });

      const errData = await res.clone().json().catch(() => null);

      if (!res.ok) {
        if (
          res.status === 409 &&
          errData?.code === "TENDER_PACK_BLOCKED_BY_RISK_GATE" &&
          errData?.gate
        ) {
          setGate(
            mapScoreGateToPanelGate(
              errData.gate as ScoreBidDecisionGateResult
            )
          );
          setActiveRiskId(null);
          setRiskFixResults({});
          setShowGate(true);
          return;
        }

        throw new Error(errData?.message || "DOWNLOAD_FAILED");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `enterprise_pack_${planId}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    [planId]
  );

  /**
   * ✅ 点击下载
   */
  const handleDownload = useCallback(async () => {
    if (!planId || loading || gateLoading) return;

    setLoading(true);

    try {
      setGateLoading(true);

      const data = await runTenderPackPrecheck();
      const nextGate = mapScoreGateToPanelGate(data.gate);

      setGate(nextGate);

      /**
       * ✅ 核心修复：allow 直接 forceAllow
       */
      if (nextGate.action === "allow") {
        await proceedTenderPackDownload(true);
        return;
      }

      setActiveRiskId(null);
      setRiskFixResults({});
      setShowGate(true);
    } catch (err: any) {
      console.error("DOWNLOAD_ENTERPRISE_PACK_FAILED", err);
    } finally {
      setGateLoading(false);
      setLoading(false);
    }
  }, [planId, loading, gateLoading, proceedTenderPackDownload, runTenderPackPrecheck]);

  const handleForceProceed = useCallback(async () => {
    try {
      setLoading(true);
      await proceedTenderPackDownload(true);
      closeGate();
    } finally {
      setLoading(false);
    }
  }, [proceedTenderPackDownload, closeGate]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading || gateLoading}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-50"
      >
        {gateLoading
          ? "检查风险中..."
          : loading
          ? "正在生成企业投标包 ZIP..."
          : "下载企业投标包 ZIP（结构版）"}
      </button>

      {showGate && gate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[960px] max-w-[96vw] max-h-[90vh] overflow-y-auto">
            <BidDecisionGatePanel
              gate={gate}
              loading={loading}
              activeRiskId={activeRiskId}
              fixingRiskId={fixingRiskId}
              fixResult={
                activeRiskId ? riskFixResults[activeRiskId] ?? null : null
              }
              onForceProceed={handleForceProceed}
              onClose={closeGate}
            />
          </div>
        </div>
      )}
    </div>
  );
}