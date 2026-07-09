"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PilotFlowStatus } from "@/components/pilot/PilotFlowStatus";
import { PilotFlowSuccessPanel } from "@/components/pilot/PilotFlowSuccessPanel";

function TenderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [budgetId, setBudgetId] = useState("");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlProjectId = searchParams.get("projectId")?.trim() ?? "";
    const urlQuoteId = searchParams.get("quoteId")?.trim() ?? "";
    const urlBudgetId = searchParams.get("budgetId")?.trim() ?? "";
    if (urlProjectId) setProjectId(urlProjectId);
    if (urlQuoteId) setQuoteId(urlQuoteId);
    if (urlBudgetId) setBudgetId(urlBudgetId);
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

  async function handleGenerate() {
    if (!organizationId) return;
    const trimmedProjectId = projectId.trim();
    if (!trimmedProjectId) {
      setError("请填写 Project ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tender/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectId: trimmedProjectId,
          ...(quoteId.trim() ? { quoteId: quoteId.trim() } : {}),
          ...(budgetId.trim() ? { budgetId: budgetId.trim() } : {}),
          organizationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "标书生成失败");
      setResult(
        `标书已生成：${data.tenderId}${data.fileName ? ` · ${data.fileName}` : ""}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
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
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">交付区 · Tender</p>
        <h1 className="mt-1 text-2xl font-bold">标书生成 Tender</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Budget + Quote → PDF Engine → 生成标书并进入 Document Center 归档
        </p>
      </div>

      <PilotFlowStatus status={result ? "delivered" : "generated"} />

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="Project ID（必填）"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="Quote ID（可选，默认取项目最新）"
          value={quoteId}
          onChange={(e) => setQuoteId(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="Budget ID（可选，默认取项目最新）"
          value={budgetId}
          onChange={(e) => setBudgetId(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading || !projectId.trim()}
          className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "生成中…" : "生成标书 PDF"}
        </button>
      </section>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {result ? (
        <PilotFlowSuccessPanel
          title="标书生成成功"
          message={result}
          status="delivered"
          projectId={projectId.trim() || undefined}
          quoteId={quoteId.trim() || undefined}
          budgetId={budgetId.trim() || undefined}
        />
      ) : (
        <section className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          完成预算计算后，在此生成标书 PDF。成功后可直接进入 Document Center 查看交付物。
          {!budgetId.trim() ? (
            <Link href="/budget" className="ml-2 text-sky-400 underline">
              先去计算预算
            </Link>
          ) : null}
        </section>
      )}
    </div>
  );
}

export default function TenderPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <p className="text-sm text-zinc-500">加载中…</p>
        </div>
      }
    >
      <TenderPageContent />
    </Suspense>
  );
}
