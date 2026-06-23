"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { resolvePostQuotePath } from "@/lib/portal/v57/journey.redirect";

type MeResponse = {
  authenticated: boolean;
  organizationId?: string | null;
  user?: { name: string | null };
  projectId?: string | null;
};

function QuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("projectId") ?? "";

  const [projectId, setProjectId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: MeResponse) => {
        if (!data.authenticated) {
          router.replace("/register");
          return;
        }
        if (!data.organizationId) {
          router.replace("/onboarding");
          return;
        }
        setOrganizationId(data.organizationId);
        if (data.user?.name) setCompanyName(data.user.name);
        const pid = urlProjectId || data.projectId || "";
        if (pid) setProjectId(pid);
        else router.replace("/onboarding");
      })
      .finally(() => setChecking(false));
  }, [router, urlProjectId]);

  async function handleGenerate() {
    if (!projectId || !companyName || !organizationId) {
      alert("缺少项目或组织信息，请返回 Onboarding 重试");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          companyName,
          organizationId,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "方案生成失败");
        return;
      }

      void fetch("/api/workspace/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "quote_generated",
          projectId,
          quoteId: data.quoteId,
        }),
      });

      router.push(resolvePostQuotePath(data.quoteId));
    } catch {
      setError("请求失败");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <p className="text-zinc-400">加载会话与项目…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">方案生成 Quote</h1>
      <p className="text-sm text-zinc-400">Onboarding 项目 → V58 Orchestrator → 进入工作台</p>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-400">
          <div>Organization: {organizationId.slice(0, 12)}…</div>
          <div>Project: {projectId.slice(0, 12)}…</div>
        </div>
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="企业名称"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "生成中…" : "生成方案并进入工作台"}
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </section>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<p className="text-zinc-400">加载中…</p>}>
      <QuoteForm />
    </Suspense>
  );
}
