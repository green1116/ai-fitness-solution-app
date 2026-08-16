"use client";

import { useState } from "react";
import { ProductIntelligenceExperience } from "@/app/(product)/ProductIntelligenceExperience";

type OrgMe = { organizationId?: string | null };
type ProjectList = { ok?: boolean; projects?: Array<{ id: string }> };
type CalculateBudgetResponse = { ok?: boolean; budgetId?: string };

async function resolveOrganizationId(): Promise<string> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as OrgMe;
  return typeof me.organizationId === "string" ? me.organizationId.trim() : "";
}

async function resolveOrgProjectId(organizationId: string): Promise<string> {
  const listRes = await fetch("/api/project/list", {
    headers: { "x-organization-id": organizationId },
  });
  const list = (await listRes.json()) as ProjectList;
  return list.projects?.[0]?.id?.trim() ?? "";
}

export default function BudgetPage() {
  const [quoteId, setQuoteId] = useState("");
  const [companySize, setCompanySize] = useState("100");
  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">("mid");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [projectId, setProjectId] = useState("");

  async function handleCalculate() {
    if (!quoteId) {
      alert("请填写 Quote ID");
      return;
    }

    setLoading(true);
    setResult("");
    setProjectId("");

    try {
      const organizationId = await resolveOrganizationId();

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
      setResult(JSON.stringify(data, null, 2));
      if (data.ok === true && data.budgetId && organizationId) {
        const resolvedProjectId = await resolveOrgProjectId(organizationId);
        setProjectId(resolvedProjectId);
      }
    } catch {
      setResult("请求失败");
      setProjectId("");
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
      body: JSON.stringify({ projectId, planId: projectId }),
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
      <ProductIntelligenceExperience />

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="Quote ID"
          value={quoteId}
          onChange={(e) => setQuoteId(e.target.value)}
        />
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
        {projectId ? (
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400"
          >
            下载 PDF
          </button>
        ) : null}
      </section>

      {result ? (
        <pre className="overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
          {result}
        </pre>
      ) : null}
    </div>
  );
}
