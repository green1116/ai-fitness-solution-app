"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  pickOwnedProjectId,
  productHref,
  resolveClientProductContext,
  writeStoredProductContext,
} from "@/app/(product)/commercial-context";
import {
  loadTenderClientEntitlement,
  type TenderClientEntitlement,
} from "@/app/(product)/tender-entitlement-client";
import { TenderEnterpriseUpgradeCta } from "@/app/(product)/TenderEnterpriseUpgradeCta";
import { buildTenderUpgradeHref } from "@/app/(product)/tender-entitlement";

type OrgMe = { organizationId?: string | null };
type ProjectList = { ok?: boolean; projects?: Array<{ id: string }> };
type CalculateBudgetResponse = {
  ok?: boolean;
  budgetId?: string;
  projectId?: string;
  quoteId?: string;
  structure?: { totalEstimateMin?: number; totalEstimateMax?: number; currency?: string };
  message?: string;
};

async function resolveOrganizationId(): Promise<string> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as OrgMe;
  return typeof me.organizationId === "string" ? me.organizationId.trim() : "";
}

async function listOwnedProjectIds(organizationId: string): Promise<string[]> {
  const listRes = await fetch("/api/project/list", {
    headers: { "x-organization-id": organizationId },
  });
  const list = (await listRes.json()) as ProjectList;
  return list.ok === true ? (list.projects ?? []).map((p) => p.id).filter(Boolean) : [];
}

function BudgetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quoteId, setQuoteId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [companySize, setCompanySize] = useState("100");
  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">("mid");
  const [loading, setLoading] = useState(false);
  const [budgetId, setBudgetId] = useState("");
  const [error, setError] = useState("");
  const [budgetSummary, setBudgetSummary] = useState<{
    companySize: number;
    budgetTier: "low" | "mid" | "high";
    totalEstimateMin?: number;
    totalEstimateMax?: number;
    currency?: string;
  } | null>(null);
  const [tenderEntitlement, setTenderEntitlement] =
    useState<TenderClientEntitlement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const ctx = resolveClientProductContext(searchParams);
      const organizationId = await resolveOrganizationId();
      if (cancelled) return;
      setOrganizationId(organizationId);
      const ownedIds = organizationId ? await listOwnedProjectIds(organizationId) : [];
      if (cancelled) return;
      const ownedProjectId = pickOwnedProjectId(ctx.projectId, ownedIds);
      setProjectId(ownedProjectId);
      setQuoteId(ctx.quoteId ?? "");
      setBudgetId(ctx.budgetId ?? "");
      if (organizationId) {
        setTenderEntitlement(
          await loadTenderClientEntitlement(organizationId, {
            ...ctx,
            organizationId,
            ...(ownedProjectId ? { projectId: ownedProjectId } : {}),
          }, { currentPath: "/budget" }),
        );
      }
      writeStoredProductContext({
        ...ctx,
        organizationId,
        ...(ownedProjectId ? { projectId: ownedProjectId } : {}),
      });
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleCalculate() {
    if (!quoteId) {
      alert("缺少方案上下文，请先生成方案");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const organizationId = await resolveOrganizationId();
      setOrganizationId(organizationId);
      const ownedIds = organizationId ? await listOwnedProjectIds(organizationId) : [];
      const ownedProjectId = pickOwnedProjectId(projectId, ownedIds);

      const res = await fetch("/api/budget/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(organizationId ? { "x-organization-id": organizationId } : {}),
        },
        body: JSON.stringify({
          quoteId,
          companySize: Number(companySize),
          budgetTier,
          ...(organizationId ? { organizationId } : {}),
        }),
      });
      const data = (await res.json()) as CalculateBudgetResponse;
      if (!res.ok || data.ok !== true) {
        throw new Error(data.message || "预算计算失败");
      }
      if (data.ok === true && data.budgetId) {
        const quoteProjectId = data.projectId?.trim() || "";
        const boundProjectId =
          pickOwnedProjectId(quoteProjectId, ownedIds) || ownedProjectId;
        setBudgetId(data.budgetId);
        setProjectId(boundProjectId);
        setBudgetSummary({
          companySize: Number(companySize),
          budgetTier,
          totalEstimateMin: data.structure?.totalEstimateMin,
          totalEstimateMax: data.structure?.totalEstimateMax,
          currency: data.structure?.currency,
        });
        writeStoredProductContext({
          organizationId,
          projectId: boundProjectId,
          quoteId: data.quoteId?.trim() || quoteId,
          budgetId: data.budgetId,
        });
        router.replace(
          productHref("/budget", {
            organizationId,
            projectId: boundProjectId,
            quoteId: data.quoteId?.trim() || quoteId,
            budgetId: data.budgetId,
          }),
        );
        setTenderEntitlement(
          await loadTenderClientEntitlement(organizationId, {
            organizationId,
            projectId: boundProjectId,
            quoteId: data.quoteId?.trim() || quoteId,
            budgetId: data.budgetId,
          }, { currentPath: "/budget" }),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!projectId) return;
    const res = await fetch("/api/pdf/tender/budget", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        planId: projectId,
        companySize: Number(companySize),
      }),
    });
    if (!res.ok) {
      alert("PDF 下载失败");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "budget.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">预算计算 Budget</h1>
      <p className="text-sm text-zinc-400">根据 Quote → 成本模型 → 价格区间</p>

      {!quoteId ? (
        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">
          <p>当前没有方案上下文。请先生成方案，系统会自动带入 Quote。</p>
          <Link
            href={productHref("/quote", { organizationId, projectId })}
            className="inline-block text-emerald-400 hover:underline"
          >
            前往生成方案
          </Link>
        </section>
      ) : (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <input
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
            placeholder="企业规模 (人数)"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
          />
          <select
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
            value={budgetTier}
            onChange={(e) => setBudgetTier(e.target.value as "low" | "mid" | "high")}
          >
            <option value="low">低档</option>
            <option value="mid">中档</option>
            <option value="high">高档</option>
          </select>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "计算中…" : "计算预算"}
          </button>
          {projectId && budgetSummary ? (
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400"
            >
              下载 PDF
            </button>
          ) : null}
          {budgetSummary ? (
            <section className="rounded-xl border border-zinc-800 bg-black p-4 text-sm text-zinc-300">
              <p>预算已生成，可直接下载 PDF。</p>
              <p className="mt-2 text-zinc-400">
                企业规模 {budgetSummary.companySize} 人 · 档位{" "}
                {budgetSummary.budgetTier === "low"
                  ? "低档"
                  : budgetSummary.budgetTier === "mid"
                    ? "中档"
                    : "高档"}
                {typeof budgetSummary.totalEstimateMin === "number" &&
                typeof budgetSummary.totalEstimateMax === "number"
                  ? ` · 预算区间 ${budgetSummary.currency ?? "CNY"} ${budgetSummary.totalEstimateMin} - ${budgetSummary.totalEstimateMax}`
                  : ""}
              </p>
            </section>
          ) : null}
          {budgetId && tenderEntitlement && !tenderEntitlement.canGenerateTender ? (
            <section className="rounded-xl border border-amber-700/50 bg-black p-4 text-sm text-zinc-300">
              <p>
                继续到 Tender 需要 Enterprise。当前套餐：{tenderEntitlement.currentPlan}。
              </p>
              <p className="mt-1 text-zinc-500">
                升级后可继续生成完整标书，当前项目上下文会保留。
              </p>
              <div className="mt-3">
                <TenderEnterpriseUpgradeCta
                  href={
                    tenderEntitlement.upgradeHref ||
                    buildTenderUpgradeHref(
                      { organizationId, projectId, quoteId, budgetId },
                      { authenticated: Boolean(organizationId), currentPath: "/budget" },
                    )
                  }
                  label={tenderEntitlement.upgradeCta}
                  context={{ organizationId, projectId, quoteId, budgetId }}
                />
              </div>
            </section>
          ) : null}
          {budgetId && tenderEntitlement?.canGenerateTender ? (
            <Link
              href={productHref("/tender", {
                organizationId,
                projectId,
                quoteId,
                budgetId,
              })}
              className="block text-sm text-emerald-400 hover:underline"
            >
              前往生成标书
            </Link>
          ) : null}
        </section>
      )}

      {error ? (
        <p className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function BudgetPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">加载预算上下文…</p>}>
      <BudgetForm />
    </Suspense>
  );
}
