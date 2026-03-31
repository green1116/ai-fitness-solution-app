"use client";

import { useCallback, useState } from "react";

const UNLOCK_TENDER_KEY = "attaguy_unlockTender";
const UNLOCK_TENDER_PLAN_KEY = "attaguy_unlockTenderPlanId";

function getStoredTenderUnlockToken(planId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const storedPlan = localStorage.getItem(UNLOCK_TENDER_PLAN_KEY);
    if (storedPlan !== planId) return null;
    return localStorage.getItem(UNLOCK_TENDER_KEY);
  } catch {
    return null;
  }
}

function storeTenderUnlockToken(planId: string, token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UNLOCK_TENDER_KEY, token);
    localStorage.setItem(UNLOCK_TENDER_PLAN_KEY, planId);
  } catch {
    // ignore
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DownloadTenderPackButton({
  planId,
}: {
  planId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleDownload = useCallback(async () => {
    if (!planId || loading) return;

    const unlockToken = getStoredTenderUnlockToken(planId);
    if (!unlockToken) {
      setMessage("");
      setUnlockOpen(true);
      setMessage("下载招标包需要先解锁 Tender 版，请先留下邮箱。");
      return;
    }

    try {
      setLoading(true);

      const u = new URL("/api/download-token", window.location.origin);
      u.searchParams.set("planId", planId);
      u.searchParams.set("mode", "pack");
      u.searchParams.set("variant", "tender");
      u.searchParams.set("unlockToken", unlockToken);

      const tokenRes = await fetch(u.toString(), {
        method: "GET",
        cache: "no-store",
      });

      const raw = await tokenRes.text();
      let data: any = null;

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        throw new Error(`DOWNLOAD_TOKEN_BAD_JSON: ${raw || "(empty)"}`);
      }

      if (!tokenRes.ok) {
        if (data?.code === "DOWNLOAD_LOCKED") {
          setUnlockOpen(true);
          setMessage("解锁凭证已过期，请重新提交邮箱解锁。");
          return;
        }
        throw new Error(
          data?.message ||
            data?.error ||
            `DOWNLOAD_TOKEN_HTTP_${tokenRes.status}`
        );
      }

      const downloadToken =
        data?.token ||
        data?.downloadToken ||
        data?.data?.token ||
        data?.data?.downloadToken ||
        "";

      if (!downloadToken) {
        throw new Error(
          data?.message ||
            data?.error ||
            `DOWNLOAD_TOKEN_MISSING_FIELD: ${JSON.stringify(data)}`
        );
      }

      const url = new URL("/api/tender-pack", window.location.origin);
      url.searchParams.set("planId", planId);
      url.searchParams.set("format", "merged");
      url.searchParams.set("level", "enterprise");
      url.searchParams.set("theme", "tender");
      url.searchParams.set("variant", "tender");
      url.searchParams.set("watermark", "0");
      url.searchParams.set("includeCover", "1");
      url.searchParams.set("includeDeclaration", "1");
      url.searchParams.set("packFooter", "1");
      url.searchParams.set("downloadToken", downloadToken);

      window.location.href = url.toString();
    } catch (err: any) {
      console.error("DOWNLOAD_TENDER_PACK_FAILED", err);
      alert(err?.message || "获取企业招标版下载凭证失败");
    } finally {
      setLoading(false);
    }
  }, [planId, loading]);

  const submitLead = useCallback(async () => {
    const v = email.trim().toLowerCase();

    if (!v) {
      setMessage("请输入邮箱");
      return;
    }

    if (!isValidEmail(v)) {
      setMessage("请输入正确的邮箱格式");
      return;
    }

    setSubmitting(true);
    setMessage("正在提交并生成下载凭证...");

    try {
      const res = await fetch("/api/lead/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: v,
          planId,
          intent: "unlock_tender",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "提交失败");
      }

      const unlockTok = String(data?.unlockToken || "").trim();
      if (unlockTok) {
        storeTenderUnlockToken(planId, unlockTok);
      }

      const downloadUrl = String(data?.downloadUrl || "").trim();
      if (downloadUrl) {
        setMessage("已提交，正在开始下载...");
        window.location.href = new URL(
          downloadUrl,
          window.location.origin
        ).toString();
      } else {
        setMessage("已提交成功，请点击下方按钮下载。");
      }

      setUnlockOpen(false);
    } catch (e: any) {
      setMessage(e?.message || "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }, [email, planId]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 disabled:opacity-50"
      >
        {loading ? "正在生成企业招标版..." : "下载企业招标版（完整招标方案）"}
      </button>

      {unlockOpen && (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
          <div className="mb-2 text-sm font-medium text-white">
            解锁 Tender 招标版
          </div>
          <div className="mb-3 text-sm text-zinc-300">
            留下邮箱后即可下载企业招标包，包含封面、目录、声明、方案、预算与结论内容。
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
              disabled={submitting}
              className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "处理中..." : "提交解锁申请"}
            </button>
          </div>

          {message ? (
            <div className="mt-3 text-sm text-zinc-300">{message}</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
