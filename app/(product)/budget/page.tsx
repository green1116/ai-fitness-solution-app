"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  isProductContextCrmHandoff,
  parseProductContextSearch,
  pickOwnedProjectId,
  productHref,
  readStoredQuoteIdForProject,
  resolveClientProductContext,
  writeStoredProductContext,
} from "@/app/(product)/commercial-context";
import {
  loadTenderClientEntitlement,
  type TenderClientEntitlement,
} from "@/app/(product)/tender-entitlement-client";
import { TenderEnterpriseUpgradeCta } from "@/app/(product)/TenderEnterpriseUpgradeCta";
import { buildTenderUpgradeHref } from "@/app/(product)/tender-entitlement";
import {
  isBudgetOverLabelUpperBound,
  resolveProjectBudgetLabel,
} from "@/lib/project/project-intake";

type OrgMe = { organizationId?: string | null };
type ProjectList = { ok?: boolean; projects?: Array<{ id: string }> };
type CalculateBudgetResponse = {
  ok?: boolean;
  budgetId?: string;
  projectId?: string;
  quoteId?: string;
  structure?: {
    totalEstimateMin?: number;
    totalEstimateMax?: number;
    totalMin?: number;
    totalMax?: number;
    currency?: string;
  };
  basis?: {
    quoteId?: string;
    targetUsers?: number;
    areaM2?: number;
    notes?: string;
    budgetTier?: "low" | "mid" | "high";
    headcountSource?: "quote" | "fallback";
  };
  message?: string;
};

type BudgetSummaryState = {
  companySize: number;
  budgetTier: "low" | "mid" | "high";
  totalEstimateMin?: number;
  totalEstimateMax?: number;
  currency?: string;
  areaM2?: number;
  notes?: string;
  headcountSource?: "quote" | "fallback";
};

type QuoteBasisState = {
  targetUsers?: number;
  areaM2?: number;
  notes?: string;
};

type BudgetSummaryBinding = {
  projectId: string;
  quoteId?: string;
};

const BUDGET_SUMMARY_STORAGE_KEY = "product-budget-summary";

function trimBindingId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function budgetSummaryMatchesBinding(
  parsed: BudgetSummaryState & {
    budgetId?: string;
    projectId?: string;
    quoteId?: string;
  },
  binding: BudgetSummaryBinding,
): boolean {
  const projectId = trimBindingId(binding.projectId);
  const storedProjectId = trimBindingId(parsed.projectId);
  if (!projectId || storedProjectId !== projectId) return false;
  const quoteId = trimBindingId(binding.quoteId);
  const storedQuoteId = trimBindingId(parsed.quoteId);
  if (quoteId && storedQuoteId && storedQuoteId !== quoteId) return false;
  return true;
}

function readStoredBudgetSummary(
  budgetId: string,
  binding?: BudgetSummaryBinding,
): BudgetSummaryState | null {
  if (typeof window === "undefined") return null;
  const id = budgetId.trim();
  if (!id) return null;
  try {
    const raw = window.sessionStorage.getItem(BUDGET_SUMMARY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BudgetSummaryState & {
      budgetId?: string;
      projectId?: string;
      quoteId?: string;
    };
    if (parsed.budgetId !== id) return null;
    if (typeof parsed.companySize !== "number" || !parsed.budgetTier) return null;
    if (binding && !budgetSummaryMatchesBinding(parsed, binding)) return null;
    return {
      companySize: parsed.companySize,
      budgetTier: parsed.budgetTier,
      ...(typeof parsed.totalEstimateMin === "number"
        ? { totalEstimateMin: parsed.totalEstimateMin }
        : {}),
      ...(typeof parsed.totalEstimateMax === "number"
        ? { totalEstimateMax: parsed.totalEstimateMax }
        : {}),
      ...(parsed.currency ? { currency: parsed.currency } : {}),
      ...(typeof parsed.areaM2 === "number" ? { areaM2: parsed.areaM2 } : {}),
      ...(parsed.notes ? { notes: parsed.notes } : {}),
      ...(parsed.headcountSource ? { headcountSource: parsed.headcountSource } : {}),
    };
  } catch {
    return null;
  }
}

function writeStoredBudgetSummary(
  budgetId: string,
  summary: BudgetSummaryState,
  binding?: BudgetSummaryBinding,
): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    BUDGET_SUMMARY_STORAGE_KEY,
    JSON.stringify({
      budgetId,
      ...summary,
      ...(binding?.projectId ? { projectId: binding.projectId } : {}),
      ...(binding?.quoteId ? { quoteId: binding.quoteId } : {}),
    }),
  );
}

function resolveBoundBudgetSummary(
  budgetId: string,
  binding: BudgetSummaryBinding,
): BudgetSummaryState | null {
  const id = budgetId.trim();
  return id ? readStoredBudgetSummary(id, binding) : null;
}

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

function projectBudgetLevelToTier(
  level: string | null | undefined,
): "low" | "mid" | "high" | null {
  const value = String(level ?? "").trim().toLowerCase();
  if (value === "low" || value === "mid" || value === "high") return value;
  if (value === "custom") return "high";
  return null;
}

async function fetchProjectBudgetDefaults(
  projectId: string,
  organizationId: string,
): Promise<{
  companySize?: number;
  budgetTier?: "low" | "mid" | "high";
  budgetLabel?: string;
} | null> {
  const res = await fetch(`/api/project/${encodeURIComponent(projectId)}`, {
    headers: { "x-organization-id": organizationId },
  });
  const data = (await res.json()) as {
    ok?: boolean;
    project?: {
      exists?: boolean;
      targetUsers?: number | null;
      budgetLevel?: string | null;
      budgetLabel?: string | null;
    };
  };
  if (!data.ok || !data.project?.exists) return null;

  const companySize =
    typeof data.project.targetUsers === "number" &&
    Number.isFinite(data.project.targetUsers) &&
    data.project.targetUsers > 0
      ? Math.floor(data.project.targetUsers)
      : undefined;
  const budgetTier = projectBudgetLevelToTier(data.project.budgetLevel);
  const budgetLabel = resolveProjectBudgetLabel(
    data.project.budgetLabel,
    data.project.budgetLevel,
  );

  return {
    ...(companySize ? { companySize } : {}),
    ...(budgetTier ? { budgetTier } : {}),
    budgetLabel,
  };
}

async function fetchQuoteBasis(
  projectId: string,
  quoteId: string,
  organizationId: string,
): Promise<QuoteBasisState | null> {
  const pid = projectId.trim();
  const qid = quoteId.trim();
  const oid = organizationId.trim();
  if (!pid || !qid || !oid) return null;
  try {
    const res = await fetch(
      `/api/quote/list?projectId=${encodeURIComponent(pid)}&organizationId=${encodeURIComponent(oid)}`,
      { headers: { "x-organization-id": oid } },
    );
    const data = (await res.json()) as {
      ok?: boolean;
      quotes?: Array<{
        id: string;
        areaM2?: number;
        notes?: string;
      }>;
    };
    if (data.ok !== true || !Array.isArray(data.quotes)) return null;
    const hit = data.quotes.find((q) => q.id === qid);
    if (!hit) return null;
    return {
      ...(typeof hit.areaM2 === "number" && hit.areaM2 > 0
        ? { areaM2: hit.areaM2 }
        : {}),
      ...(hit.notes?.trim() ? { notes: hit.notes.trim() } : {}),
    };
  } catch {
    return null;
  }
}

function tierLabel(tier: "low" | "mid" | "high"): string {
  if (tier === "low") return "基础（单价偏低）";
  if (tier === "high") return "高端（单价偏高）";
  return "标准（单价适中）";
}

function isBudgetDraftDirty(
  companySize: string,
  budgetTier: "low" | "mid" | "high",
  budgetSummary: BudgetSummaryState | null,
): boolean {
  if (!budgetSummary) return false;
  const size = Number(companySize);
  if (!Number.isFinite(size) || size <= 0) return true;
  return size !== budgetSummary.companySize || budgetTier !== budgetSummary.budgetTier;
}

function BudgetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [quoteId, setQuoteId] = useState(
    () => parseProductContextSearch(searchParams).quoteId?.trim() ?? "",
  );
  const [projectId, setProjectId] = useState(
    () => parseProductContextSearch(searchParams).projectId?.trim() ?? "",
  );
  const [organizationId, setOrganizationId] = useState("");
  const [contextReady, setContextReady] = useState(false);
  const [companySize, setCompanySize] = useState("100");
  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">("mid");
  const [loading, setLoading] = useState(false);
  const [budgetId, setBudgetId] = useState("");
  const [error, setError] = useState("");
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryState | null>(null);
  const [quoteBasis, setQuoteBasis] = useState<QuoteBasisState | null>(null);
  const [projectBudgetLabel, setProjectBudgetLabel] = useState("");
  const [tenderEntitlement, setTenderEntitlement] =
    useState<TenderClientEntitlement | null>(null);
  const budgetDraftDirty = isBudgetDraftDirty(companySize, budgetTier, budgetSummary);
  const canDownloadPdf =
    Boolean(projectId && budgetId && budgetSummary) && !budgetDraftDirty;
  const budgetOverLabel =
    budgetSummary &&
    projectBudgetLabel &&
    !budgetDraftDirty &&
    typeof budgetSummary.totalEstimateMax === "number" &&
    isBudgetOverLabelUpperBound(budgetSummary.totalEstimateMax, projectBudgetLabel);

  useEffect(() => {
    let cancelled = false;
    setContextReady(false);
    async function hydrate() {
      const urlCtx = parseProductContextSearch(searchParams);
      const crmHandoff = isProductContextCrmHandoff(searchParams);
      const ctx = resolveClientProductContext(searchParams);
      const urlQuoteId = urlCtx.quoteId?.trim() ?? "";
      const urlProjectId = urlCtx.projectId?.trim() ?? "";
      if (urlQuoteId) setQuoteId(urlQuoteId);
      if (urlProjectId) setProjectId(urlProjectId);
      // API/subscription identity: membership org from /api/auth/me only.
      // Sticky/URL product-context org stays on ctx for project/quote/budget navigation.
      const organizationId = await resolveOrganizationId();
      if (cancelled) return;
      setOrganizationId(organizationId);
      const ownedIds = organizationId ? await listOwnedProjectIds(organizationId) : [];
      if (cancelled) return;
      const urlBudgetId = urlCtx.budgetId?.trim() ?? "";
      const ownedProjectId = pickOwnedProjectId(
        urlProjectId || ctx.projectId,
        ownedIds,
      );
      const resolvedQuoteId =
        urlQuoteId ||
        ctx.quoteId?.trim() ||
        (!crmHandoff && ownedProjectId
          ? readStoredQuoteIdForProject(ownedProjectId)
          : "");
      setProjectId(ownedProjectId);
      setQuoteId(resolvedQuoteId);
      let entitlementBudgetId = "";

      if (ownedProjectId) {
        const binding: BudgetSummaryBinding = {
          projectId: ownedProjectId,
          ...(resolvedQuoteId ? { quoteId: resolvedQuoteId } : {}),
        };
        let projectDefaults: Awaited<ReturnType<typeof fetchProjectBudgetDefaults>> = null;
        if (organizationId) {
          projectDefaults = await fetchProjectBudgetDefaults(
            ownedProjectId,
            organizationId,
          );
          if (cancelled) return;
          if (projectDefaults?.companySize) {
            setCompanySize(String(projectDefaults.companySize));
          }
          if (projectDefaults?.budgetTier) setBudgetTier(projectDefaults.budgetTier);
          if (projectDefaults?.budgetLabel) {
            setProjectBudgetLabel(projectDefaults.budgetLabel);
          }
        }

        if (organizationId && resolvedQuoteId) {
          const basis = await fetchQuoteBasis(
            ownedProjectId,
            resolvedQuoteId,
            organizationId,
          );
          if (cancelled) return;
          setQuoteBasis(basis);
        } else {
          setQuoteBasis(null);
        }

        let acceptedBudgetId = "";
        let acceptedSummary: BudgetSummaryState | null = null;
        if (crmHandoff) {
          acceptedBudgetId = urlBudgetId;
        } else {
          const budgetCandidates: string[] = [];
          if (urlBudgetId) budgetCandidates.push(urlBudgetId);
          const ctxBudgetId = ctx.budgetId?.trim() ?? "";
          if (ctxBudgetId && ctxBudgetId !== urlBudgetId) {
            if (resolveBoundBudgetSummary(ctxBudgetId, binding)) {
              budgetCandidates.push(ctxBudgetId);
            }
          }

          for (const candidateId of budgetCandidates) {
            const stored = resolveBoundBudgetSummary(candidateId, binding);
            if (!stored) continue;
            const sizeMatches =
              !projectDefaults?.companySize ||
              stored.companySize === projectDefaults.companySize;
            const tierMatches =
              !projectDefaults?.budgetTier ||
              stored.budgetTier === projectDefaults.budgetTier;
            if (!sizeMatches || !tierMatches) continue;
            acceptedBudgetId = candidateId;
            acceptedSummary = stored;
            break;
          }
        }

        entitlementBudgetId = acceptedBudgetId;
        setBudgetId(acceptedBudgetId);
        setBudgetSummary(acceptedSummary);
        if (acceptedSummary) {
          setCompanySize(String(acceptedSummary.companySize));
          setBudgetTier(acceptedSummary.budgetTier);
        }

        writeStoredProductContext({
          organizationId,
          projectId: ownedProjectId,
          ...(resolvedQuoteId ? { quoteId: resolvedQuoteId } : {}),
          ...(acceptedBudgetId ? { budgetId: acceptedBudgetId } : {}),
        });
      } else {
        const nextBudgetId = ctx.budgetId ?? "";
        entitlementBudgetId = nextBudgetId;
        setBudgetId(nextBudgetId);
        let hydratedFromSummary = false;
        if (nextBudgetId && !crmHandoff) {
          const stored = readStoredBudgetSummary(nextBudgetId);
          if (stored) {
            setBudgetSummary(stored);
            setCompanySize(String(stored.companySize));
            setBudgetTier(stored.budgetTier);
            hydratedFromSummary = true;
          }
        }
        if (!hydratedFromSummary && ownedProjectId && organizationId) {
          const defaults = await fetchProjectBudgetDefaults(ownedProjectId, organizationId);
          if (cancelled) return;
          if (defaults?.companySize) setCompanySize(String(defaults.companySize));
          if (defaults?.budgetTier) setBudgetTier(defaults.budgetTier);
          if (defaults?.budgetLabel) setProjectBudgetLabel(defaults.budgetLabel);
        }
        writeStoredProductContext({
          ...ctx,
          organizationId,
          ...(ownedProjectId ? { projectId: ownedProjectId } : {}),
        });
      }
      if (!cancelled) setContextReady(true);
      if (organizationId) {
        const entitlement = await loadTenderClientEntitlement(
          organizationId,
          {
            organizationId,
            projectId: ownedProjectId,
            quoteId: resolvedQuoteId || ctx.quoteId,
            ...(entitlementBudgetId ? { budgetId: entitlementBudgetId } : {}),
          },
          { currentPath: "/budget" },
        );
        if (!cancelled) setTenderEntitlement(entitlement);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleCalculate() {
    if (!quoteId) {
      alert("请先生成方案");
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
        throw new Error("BUDGET_CALCULATE_FAILED");
      }
      if (data.ok === true && data.budgetId) {
        const quoteProjectId = data.projectId?.trim() || "";
        const boundProjectId =
          pickOwnedProjectId(quoteProjectId, ownedIds) || ownedProjectId;
        const totalMin =
          data.structure?.totalEstimateMin ?? data.structure?.totalMin;
        const totalMax =
          data.structure?.totalEstimateMax ?? data.structure?.totalMax;
        const basisUsers = data.basis?.targetUsers;
        const displaySize =
          typeof basisUsers === "number" && basisUsers > 0
            ? basisUsers
            : Number(companySize);
        if (typeof basisUsers === "number" && basisUsers > 0) {
          setCompanySize(String(basisUsers));
        }
        setQuoteBasis({
          ...(typeof data.basis?.targetUsers === "number"
            ? { targetUsers: data.basis.targetUsers }
            : {}),
          ...(typeof data.basis?.areaM2 === "number"
            ? { areaM2: data.basis.areaM2 }
            : {}),
          ...(data.basis?.notes ? { notes: data.basis.notes } : {}),
        });
        setBudgetId(data.budgetId);
        setProjectId(boundProjectId);
        setBudgetSummary({
          companySize: displaySize,
          budgetTier: data.basis?.budgetTier ?? budgetTier,
          totalEstimateMin: totalMin,
          totalEstimateMax: totalMax,
          currency: data.structure?.currency,
          ...(typeof data.basis?.areaM2 === "number"
            ? { areaM2: data.basis.areaM2 }
            : {}),
          ...(data.basis?.notes ? { notes: data.basis.notes } : {}),
          ...(data.basis?.headcountSource
            ? { headcountSource: data.basis.headcountSource }
            : {}),
        });
        if (boundProjectId && organizationId) {
          const defaults = await fetchProjectBudgetDefaults(boundProjectId, organizationId);
          if (defaults?.budgetLabel) setProjectBudgetLabel(defaults.budgetLabel);
        }
        writeStoredBudgetSummary(
          data.budgetId,
          {
            companySize: displaySize,
            budgetTier: data.basis?.budgetTier ?? budgetTier,
            totalEstimateMin: totalMin,
            totalEstimateMax: totalMax,
            currency: data.structure?.currency,
            ...(typeof data.basis?.areaM2 === "number"
              ? { areaM2: data.basis.areaM2 }
              : {}),
            ...(data.basis?.notes ? { notes: data.basis.notes } : {}),
            ...(data.basis?.headcountSource
              ? { headcountSource: data.basis.headcountSource }
              : {}),
          },
          {
            projectId: boundProjectId,
            quoteId: data.quoteId?.trim() || quoteId,
          },
        );
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
    } catch {
      setError("预算计算失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!canDownloadPdf || !budgetSummary) return;
    const res = await fetch("/api/pdf/tender/budget", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        planId: projectId,
        companySize: budgetSummary.companySize,
        budgetTier: budgetSummary.budgetTier,
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
    link.download = "预算.pdf";
    link.click();
    URL.revokeObjectURL(url);
    setPdfDownloaded(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-emerald-400">交付路径：项目 → 方案 → 预算 → 投标 → 下载</p>
        <h1 className="mt-1 text-2xl font-bold">当前：预算</h1>
        <p className="text-sm text-zinc-400">
          {budgetId
            ? "预算已就绪。主要下一步：生成投标文件并下载交付包。"
            : "根据方案估算投资区间。"}
        </p>
      </div>

      {!contextReady ? (
        <p className="text-sm text-zinc-500">加载项目上下文…</p>
      ) : !quoteId ? (
        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">
          <p>当前没有可用方案。请先生成方案，系统会自动带入后续步骤。</p>
          <Link
            href={productHref("/quote", { organizationId, projectId })}
            className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black"
          >
            下一步：前往生成方案
          </Link>
        </section>
      ) : (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="space-y-2 rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-300">
            <p className="font-medium text-zinc-100">预算依据（当前方案）</p>
            <p>
              方案人数：
              {quoteBasis?.targetUsers ??
                budgetSummary?.companySize ??
                (Number(companySize) > 0 ? companySize : "以方案快照为准")}
              {" 人"}
            </p>
            <p>
              方案面积：
              {quoteBasis?.areaM2 ?? budgetSummary?.areaM2
                ? `${quoteBasis?.areaM2 ?? budgetSummary?.areaM2}㎡`
                : "以方案快照为准"}
            </p>
            <p>
              当前方案要求：
              {quoteBasis?.notes?.trim() ||
                budgetSummary?.notes?.trim() ||
                "无补充要求"}
            </p>
            <p className="text-xs text-zinc-500">
              人数与面积取自当前 Quote 快照；有明确方案人数时不会被下方兼容人数覆盖。
            </p>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-200">
              兼容人数（仅方案无人数时回退）
            </span>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
              placeholder="方案无人数时的回退人数"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-zinc-200">
              设备价格/品质档位
            </span>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as "low" | "mid" | "high")}
            >
              <option value="low">基础（LOW）— 单价偏低</option>
              <option value="mid">标准（MID）— 单价适中</option>
              <option value="high">高端（HIGH）— 单价偏高</option>
            </select>
            <p className="text-xs text-zinc-500">
              LOW / MID / HIGH 仅控制器材单价区间，不改变方案器材数量与分区。
            </p>
          </label>
          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className={
              budgetId
                ? "rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400 disabled:opacity-50"
                : "rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
            }
          >
            {loading
              ? "计算中…"
              : budgetId
                ? "按当前方案与档位重新计算预算"
                : "按当前方案计算预算"}
          </button>
          {projectId && budgetId ? (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!canDownloadPdf}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下载预算 PDF
            </button>
          ) : null}
          {budgetId && budgetDraftDirty ? (
            <p className="text-sm text-amber-300">参数已修改，请按当前参数重新计算预算</p>
          ) : null}
          {budgetOverLabel ? (
            <p className="text-sm text-amber-300">
              估算上限超出所选预算区间「{projectBudgetLabel}」，请复核规模或调整档位
            </p>
          ) : null}
          {budgetId ? (
            <section className="rounded-xl border border-zinc-800 bg-black p-4 text-sm text-zinc-300">
              <p>预算已生成。可下载预算 PDF，然后继续生成投标文件。</p>
              {budgetSummary ? (
                <div className="mt-2 space-y-1 text-zinc-400">
                  <p>
                    方案人数 {budgetSummary.companySize} 人
                    {budgetSummary.areaM2
                      ? ` · 方案面积 ${budgetSummary.areaM2}㎡`
                      : ""}
                    {" · "}
                    档位 {tierLabel(budgetSummary.budgetTier)}
                  </p>
                  {budgetSummary.notes ? (
                    <p>方案要求：{budgetSummary.notes}</p>
                  ) : null}
                  {typeof budgetSummary.totalEstimateMin === "number" &&
                  typeof budgetSummary.totalEstimateMax === "number" ? (
                    <p>
                      预算区间 {budgetSummary.currency ?? "CNY"}{" "}
                      {budgetSummary.totalEstimateMin} -{" "}
                      {budgetSummary.totalEstimateMax}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
          {pdfDownloaded ? (
            <p className="text-sm text-emerald-300">
              预算 PDF 已下载。
              {tenderEntitlement?.canGenerateTender
                ? " 请继续下一步生成投标文件。"
                : " 若需投标交付，请先升级套餐。"}
            </p>
          ) : null}
          {budgetId && tenderEntitlement?.canGenerateTender ? (
            <Link
              href={productHref("/tender", {
                organizationId,
                projectId,
                quoteId,
                budgetId,
              })}
              className="inline-flex rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black"
            >
              下一步：生成投标文件
            </Link>
          ) : null}
          {budgetId && tenderEntitlement && !tenderEntitlement.canGenerateTender ? (
            <section className="rounded-xl border border-amber-700/50 bg-black p-4 text-sm text-zinc-300">
              <p>
                继续生成投标文件需要 Enterprise。当前套餐：{tenderEntitlement.currentPlan}。
              </p>
              <p className="mt-1 text-zinc-500">
                升级后可继续生成投标交付文件，当前进度会保留。
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
          {projectId ? (
            <Link
              href={`/projects/${encodeURIComponent(projectId)}`}
              className="inline-block text-sm text-zinc-400 underline hover:text-zinc-200"
            >
              ← 返回项目
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
    <Suspense fallback={<p className="text-sm text-zinc-500">加载中…</p>}>
      <BudgetForm />
    </Suspense>
  );
}
