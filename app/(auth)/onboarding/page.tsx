"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

type MeResponse = {
  authenticated: boolean;
  user?: { email: string; name: string | null };
  organizationId?: string | null;
};

function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: MeResponse) => {
        if (!data.authenticated) {
          router.replace("/register");
          return;
        }
        if (data.user?.name) setCompany(data.user.name);
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, industry, teamSize, budgetRange, location }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "提交失败");
        return;
      }
      router.push(data.nextPath || `/quote?projectId=${data.projectId}`);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <p className="text-center text-zinc-500">加载中…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">完善企业信息</h1>
      <p className="text-sm text-zinc-600">完成后将自动创建首个项目并进入方案生成</p>

      <label className="block text-sm">
        企业名称
        <input
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        行业
        <input
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="例如：科技 / 金融"
        />
      </label>
      <label className="block text-sm">
        团队规模
        <input
          value={teamSize}
          onChange={(e) => setTeamSize(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="例如：50-200 人"
        />
      </label>
      <label className="block text-sm">
        预算区间
        <input
          value={budgetRange}
          onChange={(e) => setBudgetRange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          placeholder="例如：5-10 万"
        />
      </label>
      <label className="block text-sm">
        所在城市
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "创建项目中…" : "继续 → 生成方案"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        <Link href="/register" className="text-emerald-600 hover:underline">
          返回注册
        </Link>
      </p>
    </form>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16">
      <Suspense fallback={<p className="text-center">加载中…</p>}>
        <OnboardingForm />
      </Suspense>
    </div>
  );
}
