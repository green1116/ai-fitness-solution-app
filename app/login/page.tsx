"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Step = "phone" | "code";

export default function LoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendCode() {
    if (!phone.trim()) {
      alert("请输入手机号");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const r = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(j?.error || "发送验证码失败");
      }

      setStep("code");
      setMsg("验证码已发送，请查看您的短信");
      setCooldown(60);
    } catch (err: any) {
      alert(err?.message || "发送验证码失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!phone.trim()) {
      alert("请输入手机号");
      return;
    }

    if (!code.trim()) {
      alert("请输入验证码");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          code: code.trim(),
        }),
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(j?.error || "登录失败");
      }

      setMsg("登录成功，正在跳转...");
      router.push("/dashboard");
    } catch (err: any) {
      alert(err?.message || "登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 12px 36px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          登录
        </h1>

        <p
          style={{
            marginTop: 8,
            marginBottom: 20,
            color: "#6b7280",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          请输入手机号并完成验证码验证。
        </p>

        <form onSubmit={submitLogin}>
          <label
            htmlFor="phone"
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 8,
            }}
          >
            手机号
          </label>
          <input
            id="phone"
            type="text"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 16,
            }}
          />

          {step === "code" && (
            <>
              <label
                htmlFor="code"
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                验证码
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入验证码"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 16,
                }}
              />
            </>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={sendCode}
              disabled={loading || cooldown > 0}
              style={{
                flex: 1,
                height: 44,
                border: "none",
                borderRadius: 10,
                background: "#2563eb",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || cooldown > 0 ? "not-allowed" : "pointer",
                opacity: loading || cooldown > 0 ? 0.6 : 1,
              }}
            >
              {cooldown > 0 ? `验证码已发送，请 ${cooldown}s 后重试` : "获取验证码"}
            </button>

            <button
              type="submit"
              disabled={loading || step !== "code"}
              style={{
                flex: 1,
                height: 44,
                border: "none",
                borderRadius: 10,
                background: "#111827",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || step !== "code" ? "not-allowed" : "pointer",
                opacity: loading || step !== "code" ? 0.6 : 1,
              }}
            >
              {loading ? "处理中..." : "登录"}
            </button>
          </div>
        </form>

        {msg ? (
          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              color: "#2563eb",
              lineHeight: 1.6,
            }}
          >
            {msg}
          </div>
        ) : null}
      </div>
    </div>
  );
}