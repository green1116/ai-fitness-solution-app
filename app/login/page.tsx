"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const returnTo = sp.get("returnTo") || "/result";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function requestCode() {
    setMsg("");
    setLoading(true);
    try {
      const r = await fetch("/api/auth/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "发送失�?);

      setStep("code");
      setMsg("验证码已发送，请查收邮箱（5分钟内有效）");

      // 60秒倒计�?
      setCooldown(60);
      const t = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(t);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (e: any) {
      setMsg(e?.message || "发送失�?);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    try {
      setError("");

      const r = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
        }),
        cache: "no-store",
      });

      const data = await r.json().catch(() => ({}));

      console.log("[verify] status=", r.status, "data=", data); // �?关键：打印服务端返回

      if (!r.ok) {
        // �?把后端返回的 stage/message 显示出来
        setError(data?.message || data?.msg || `验证失败�?{data?.stage || "unknown"}）`);
        return;
      }

      // 成功：回�?
      const returnTo = new URLSearchParams(location.search).get("returnTo");
      location.href = returnTo ? decodeURIComponent(returnTo) : "/result";
    } catch (e: any) {
      console.error("[verify] exception", e);
      setError(e?.message || "验证失败");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>登录</h1>
      <p className="text-sm text-gray-500" style={{ marginBottom: 18 }}>
        登录后将返回上一�?
      </p>

      {step === "email" && (
        <>
          <label style={{ display: "block", marginBottom: 8 }}>邮箱</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              marginBottom: 12,
            }}
          />

          <button
            onClick={requestCode}
            disabled={loading || !email}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: loading ? "#eee" : "#111",
              color: loading ? "#666" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "发送中..." : "发送验证码"}
          </button>
        </>
      )}

      {step === "code" && (
        <>
          <div style={{ marginBottom: 10, color: "#666" }}>
            已发送到�?b>{email}</b>
          </div>

          <label style={{ display: "block", marginBottom: 8 }}>验证�?/label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6位数�?
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #ddd",
              borderRadius: 10,
              marginBottom: 12,
            }}
          />

          <button
            onClick={verifyCode}
            disabled={loading || code.length < 6}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #111",
              background: loading ? "#eee" : "#111",
              color: loading ? "#666" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: 10,
            }}
          >
            {loading ? "验证�?.." : "登录"}
          </button>

          <button
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                const r = await fetch("/api/auth/email/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                const j = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(j?.message || j?.msg || "发送失�?);

                setMsg("验证码已发送，请查收邮箱（10分钟内有效）");

                // 60秒倒计�?
                setCooldown(60);
                const t = setInterval(() => {
                  setCooldown((c) => {
                    if (c <= 1) {
                      clearInterval(t);
                      return 0;
                    }
                    return c - 1;
                  });
                }, 1000);
              } catch (e: any) {
                setError(e?.message || "发送失�?);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || cooldown > 0}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: loading || cooldown > 0 ? "not-allowed" : "pointer",
            }}
          >
            {cooldown > 0 ? `重新发送（${cooldown}s）` : "重发验证�?}
          </button>
        </>
      )}

      {(msg || error) && (
        <div
          style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 10,
            background: error ? "#fee" : "#f6f6f6",
            border: `1px solid ${error ? "#fcc" : "#eee"}`,
            color: error ? "#c33" : "#333",
            whiteSpace: "pre-wrap",
          }}
        >
          {error || msg}
        </div>
      )}
    </div>
  );
}

