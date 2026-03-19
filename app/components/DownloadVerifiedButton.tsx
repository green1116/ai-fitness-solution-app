"use client";

import React, { useState } from "react";

type Props = {
  planId: string;
  mode?: "full" | "budget";
  requestOtpUrl?: string; // POST { email, planId? } -> { ok: true }
  verifyOtpUrl?: string;  // POST { email, code, planId?, mode? } -> { ok: true, downloadToken }
};

export default function DownloadVerifiedButton({
  planId,
  mode = "full",
  requestOtpUrl = "/api/auth/otp/request",
  verifyOtpUrl = "/api/auth/otp/verify",
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp() {
    if (!email.trim()) {
      setError("请输入邮箱地址");
      return;
    }

    setError(null);
    setSending(true);

    try {
      const res = await fetch(requestOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), planId }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok || !j?.ok) {
        setError(j?.message || "验证码发送失败");
        return;
      }

      setCountdown(60);
      const t = setInterval(() => {
        setCountdown((s) => {
          if (s <= 1) {
            clearInterval(t);
            return 0;
          }
          return s - 1;
        });
      }, 1000);

      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "请求发送验证码失败");
    } finally {
      setSending(false);
    }
  }

  async function verifyAndDownload() {
    if (!email.trim() || !code.trim()) {
      setError("请输入邮箱和验证码");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const r = await fetch(verifyOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          planId,
          mode,
        }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || !data?.ok) {
        throw new Error(data?.message || "验证码校验失败");
      }

      const downloadToken = String(data?.downloadToken || "").trim();
      if (!downloadToken) {
        throw new Error("未获取到 downloadToken");
      }

      const pdfUrl =
        `/api/pdf?planId=${encodeURIComponent(planId)}` +
        `&mode=${encodeURIComponent(mode)}` +
        `&download=1` +
        `&downloadToken=${encodeURIComponent(downloadToken)}`;

      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `${planId}-${mode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setOpen(false);
      setCode("");
      setError(null);
    } catch (e: any) {
      setError(e?.message || "验证或下载失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
      >
        验证后下载 PDF
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[520px] rounded-2xl bg-white p-6 text-gray-900 shadow-2xl">
            <h3 className="mb-4 text-xl font-semibold">邮箱验证后下载 PDF</h3>

            <div className="mb-3">
              <label className="mb-2 block text-sm font-medium">邮箱</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="mb-2 block text-sm font-medium">验证码</label>
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入验证码"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
                  disabled={loading}
                />
                {(() => {
                  const canSend =
                    email.trim().length > 0 && countdown === 0 && !sending;

                  return (
                    <button
                      type="button"
                      disabled={!canSend}
                      onClick={sendOtp}
                      className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-900 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {countdown > 0 ? `${countdown}s` : "发送验证码"}
                    </button>
                  );
                })()}
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={verifyAndDownload}
                disabled={loading}
                className="flex-1 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "处理中..." : "验证并下载"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-900 hover:bg-gray-200 disabled:opacity-50"
                disabled={loading}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}