"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PilotFlowStatus } from "@/components/pilot/PilotFlowStatus";
import { PilotFlowSuccessPanel } from "@/components/pilot/PilotFlowSuccessPanel";

function BudgetPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quoteId, setQuoteId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [companySize, setCompanySize] = useState(100);
  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">("mid");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [budgetId, setBudgetId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlQuoteId = searchParams.get("quoteId")?.trim() ?? "";
    const urlProjectId = searchParams.get("projectId")?.trim() ?? "";
    if (urlQuoteId) setQuoteId(urlQuoteId);
    if (urlProjectId) setProjectId(urlProjectId);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        const text = await r.text();
        let data: { ok?: boolean; user?: unknown; organizationId?: string | null };
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          if (!cancelled) router.replace("/register");
          return;
        }
        if (!r.ok || !data.ok || !data.user) {
          if (!cancelled) router.replace("/register");
          return;
        }
        if (!data.organizationId) {
          if (!cancelled) router.replace("/onboarding");
          return;
        }
        if (!cancelled) setOrganizationId(data.organizationId);
      } catch {
        if (!cancelled) router.replace("/register");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId) return;
    const trimmedQuoteId = quoteId.trim();
    const trimmedProjectId = projectId.trim();
    if (!trimmedQuoteId && !trimmedProjectId) {
      setError("请填写 Quote ID 或 Project ID");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setBudgetId("");
    try {
      const r = await fetch("/api/budget/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(trimmedQuoteId ? { quoteId: trimmedQuoteId } : {}),
          ...(trimmedProjectId ? { projectId: trimmedProjectId } : {}),
          companySize,
          budgetTier,
          organizationId,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message ?? "计算失败");
      if (data.budgetId) setBudgetId(String(data.budgetId));
      setResult(`预算已生成：${data.budgetId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "计算失败");
    } finally {
      setLoading(false);
    }
  }

  if (checking || !organizationId) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-zinc-500">正在验证登录与组织…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">计算区 · Budget</p>
        <h1 className="mt-1 text-2xl font-bold">预算计算</h1>
        <p className="mt-2 text-sm text-zinc-400">
          基于 Quote / Project 计算预算，生成后可立即下载 PDF 并继续标书交付。
        </p>
      </div>

      <PilotFlowStatus status={result ? "downloadable" : "parsed"} />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <label className="block">
          <span className="text-sm">Quote ID</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
            placeholder="报价单 ID（可选，若已填 Project ID）"
          />
        </label>
        <label className="block">
          <span className="text-sm">Project ID</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="项目 ID（从工作台链接带入）"
          />
        </label>
        <label className="block">
          <span className="text-sm">公司规模（人数）</span>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
            value={companySize}
            onChange={(e) => setCompanySize(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="text-sm">预算档位</span>
          <select
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
            value={budgetTier}
            onChange={(e) => setBudgetTier(e.target.value as "low" | "mid" | "high")}
          >
            <option value="low">低</option>
            <option value="mid">中</option>
            <option value="high">高</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={loading || (!quoteId.trim() && !projectId.trim())}
          className="rounded-xl bg-white px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "计算中…" : "计算预算"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {result ? (
        <PilotFlowSuccessPanel
          title="预算生成成功"
          message={result}
          status="downloadable"
          projectId={projectId.trim() || undefined}
          quoteId={quoteId.trim() || undefined}
          budgetId={budgetId.trim() || undefined}
          showBudgetDownload={Boolean(projectId.trim())}
          budgetTier={budgetTier}
        />
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          填写 Quote / Project 后点击「计算预算」。成功后此处将显示下载按钮与下一步入口。
        </section>
      )}
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <p className="text-sm text-zinc-500">加载中…</p>
        </div>
      }
    >
      <BudgetPageContent />
    </Suspense>
  );
}
