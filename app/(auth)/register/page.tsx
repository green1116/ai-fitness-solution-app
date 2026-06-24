"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { trackSignupClick, trackConversion } from "@/lib/landing/conversion/conversion.tracker";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const source = params.get("source") ?? "landing";
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    trackSignupClick({ source, cta: "register_submit" });
    trackConversion({ stage: "signup" });

    const resolvedEmail = email.trim() || `demo+${Date.now()}@example.com`;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resolvedEmail,
          companyName: company.trim() || "Demo Company",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "注册失败");
        return;
      }

      trackConversion({ stage: "activation" });
      router.push(data.nextPath || "/onboarding");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-zinc-200 p-8">
      <h1 className="text-2xl font-bold">创建账号</h1>
      <p className="text-sm text-zinc-600">来源：{source} · 注册 → Onboarding → Quote → 工作台</p>
      <label className="block text-sm">
        工作邮箱
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="you@company.com"
        />
      </label>
      <label className="block text-sm">
        企业名称
        <input
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "注册中…" : "注册并开始"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        已有账号？<Link href="/login" className="text-emerald-600 hover:underline">登录</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16">
      <Suspense fallback={<p className="text-center">加载中…</p>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
