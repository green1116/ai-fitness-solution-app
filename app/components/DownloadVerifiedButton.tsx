"use client";
import React, { useState } from "react";

type Props = {
  planId: string;
  // endpoints — 根据你项目调整 URL
  requestOtpUrl?: string;        // POST { email, planId? } -> { ok: true }
  verifyOtpUrl?: string;         // POST { email, code, planId? } -> { ok: true, downloadToken }
  downloadTokenUrl?: string;     // optional: GET /api/download-token?plan_id=..  -> { downloadToken }
};

export default function DownloadVerifiedButton({
  planId,
  requestOtpUrl = "/api/auth/otp/request",
  verifyOtpUrl = "/api/auth/otp/verify",
  downloadTokenUrl = "/api/download-token",
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // request OTP
  async function sendOtp() {
    if (!email) {
      setError("请输入邮箱");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch(requestOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j?.message || "获取验证码失败");
        return;
      }
      // start countdown
      setCountdown(60);
      const t = setInterval(() => {
        setCountdown((s) => {
          if (s <= 1) { clearInterval(t); return 0; }
          return s - 1;
        });
      }, 1000);
      // 成功提示可以显示在 UI 中，这里先清空错误
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "请求出错，请稍后再试");
    } finally {
      setSending(false);
    }
  }

  // verify OTP and download
  async function verifyAndDownload() {
    if (!email || !code) {
      setError("请输入邮箱与验证码");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const r = await fetch(verifyOtpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, planId }),
      });
      const data = await r.json();

      if (!r.ok) throw new Error(data?.message || "验证失败");

      const downloadToken = data?.downloadToken;
      if (!downloadToken) throw new Error("后端未返回 downloadToken");

      // ✅ 成功：使用 downloadToken 下载 PDF
      const pdfUrl =
        `/api/pdf?planId=${encodeURIComponent(planId)}` +
        `&downloadToken=${encodeURIComponent(downloadToken)}` +
        `&mode=full`;

      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `${planId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // 关闭弹窗
      setOpen(false);
    } catch (e: any) {
      setError(e?.message || "网络异常，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-white bg-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
      >
        下载完整版方案 PDF
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[520px] rounded-2xl bg-white text-gray-900 shadow-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">验证邮箱以下载完整版 PDF</h3>
            <div style={{ marginBottom: 12 }}>
              <label className="block mb-2 text-sm font-medium">邮箱</label>
              <input 
                value={email} 
                onChange={(e)=>setEmail(e.target.value)} 
                placeholder="your@email.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
                disabled={loading}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="block mb-2 text-sm font-medium">验证码</label>
              <div className="flex gap-2">
                <input 
                  value={code} 
                  onChange={(e)=>setCode(e.target.value)} 
                  placeholder="请输入验证码"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none"
                  disabled={loading}
                />
                {(() => {
                  const canSend = email.trim().length > 0 && countdown === 0 && !sending;
                  return (
                    <button 
                      disabled={!canSend} 
                      onClick={sendOtp}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-gray-900 border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {countdown>0 ? `${countdown}s` : "获取验证码"}
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

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button 
                onClick={verifyAndDownload} 
                disabled={loading} 
                className="flex-1 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "验证中..." : "验证并下载"}
              </button>
              <button 
                onClick={()=>{
                  setOpen(false);
                  setError(null);
                }} 
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-900 border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
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

