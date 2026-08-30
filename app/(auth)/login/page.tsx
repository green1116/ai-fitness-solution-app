"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const submitLockRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function sendCode() {
    if (!email.trim()) {
      alert("请输入邮箱");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || "发送验证码失败");
      setStep("code");
      setMsg("验证码已发送至邮箱");
      setCooldown(60);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "发送失败");
    } finally {
      setLoading(false);
    }
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setLoading(true);
    try {
      const r = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.message || "登录失败");
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json().catch(() => ({}));
      router.push(me?.isPlatformAdmin ? "/overview" : "/projects");
      return;
    } catch (err: unknown) {
      submitLockRef.current = false;
      setLoading(false);
      alert(err instanceof Error ? err.message : "登录失败");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">登录</h1>
        <p className="mt-2 text-sm text-zinc-600">邮箱验证码登录</p>
        <form onSubmit={submitLogin} className="mt-6 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          {step === "code" ? (
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="验证码"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={sendCode}
              disabled={loading || cooldown > 0}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
            </button>
            <button
              type="submit"
              disabled={loading || step !== "code"}
              className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              登录
            </button>
          </div>
        </form>
        {msg ? <p className="mt-3 text-sm text-blue-600">{msg}</p> : null}
        <p className="mt-4 text-center text-sm text-zinc-500">
          没有账号？<Link href="/register" className="text-emerald-600">注册</Link>
        </p>
      </div>
    </div>
  );
}
