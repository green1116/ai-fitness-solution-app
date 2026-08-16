"use client";

import { useState } from "react";
import { ProductIntelligenceExperience } from "@/app/(product)/ProductIntelligenceExperience";

type OrgMe = { organizationId?: string | null };
type ProjectList = { ok?: boolean; projects?: Array<{ id: string }> };
type ProjectCreate = { ok?: boolean; project?: { id: string }; message?: string };
type QuoteProposalView = {
  summary?: string;
  generatedAt?: string;
  sections?: Array<{ title?: string; body?: string }>;
};
type GenerateQuoteResponse = {
  ok?: boolean;
  status?: string;
  quoteId?: string;
  proposal?: QuoteProposalView;
  message?: string;
};

function orgHeaders(organizationId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-organization-id": organizationId,
  };
}

async function resolveOrganizationId(): Promise<string> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as OrgMe;
  return typeof me.organizationId === "string" ? me.organizationId.trim() : "";
}

async function resolveOrgProject(
  organizationId: string,
  companyName: string,
): Promise<string> {
  const listRes = await fetch("/api/project/list", {
    headers: { "x-organization-id": organizationId },
  });
  const list = (await listRes.json()) as ProjectList;
  const existingId = list.projects?.[0]?.id?.trim();
  if (existingId) return existingId;

  const createRes = await fetch("/api/project/create", {
    method: "POST",
    headers: orgHeaders(organizationId),
    body: JSON.stringify({
      name: companyName,
      clientName: companyName,
      organizationId,
    }),
  });
  const created = (await createRes.json()) as ProjectCreate;
  const createdId = created.project?.id?.trim();
  if (!created.ok || !createdId) {
    throw new Error(created.message || "项目创建失败");
  }
  return createdId;
}

export default function QuotePage() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [proposal, setProposal] = useState<QuoteProposalView | null>(null);
  const [quoteId, setQuoteId] = useState("");
  const [organizationId, setOrganizationId] = useState("");

  async function handleGenerate() {
    if (!companyName) {
      alert("请填写企业名称");
      return;
    }

    setLoading(true);
    setResult("");
    setProposal(null);
    setQuoteId("");

    try {
      const organizationId = await resolveOrganizationId();
      setOrganizationId(organizationId);
      const projectId = organizationId
        ? await resolveOrgProject(organizationId, companyName)
        : "";

      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(organizationId ? { "x-organization-id": organizationId } : {}),
        },
        body: JSON.stringify({
          projectId,
          companyName,
          workspaceId: "ws-default",
          ...(organizationId ? { organizationId } : {}),
        }),
      });
      const data = (await res.json()) as GenerateQuoteResponse;
      const readyProposal =
        data.ok === true && data.status === "READY" && data.proposal
          ? data.proposal
          : null;
      setProposal(readyProposal);
      setQuoteId(readyProposal && data.quoteId ? data.quoteId : "");
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setProposal(null);
      setQuoteId("");
      setResult("请求失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!quoteId) return;
    const res = await fetch(`/api/quote/pdf?quoteId=${encodeURIComponent(quoteId)}`, {
      headers: organizationId ? { "x-organization-id": organizationId } : {},
    });
    if (!res.ok) {
      alert("PDF 下载失败");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quote-${quoteId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">方案生成 Quote</h1>
      <p className="text-sm text-zinc-400">输入企业信息 → 调用 V58 Orchestrator → 返回 AI 方案</p>
      <ProductIntelligenceExperience />

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
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
          {loading ? "生成中…" : "生成方案"}
        </button>
      </section>

      {proposal ? (
        <article className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold text-zinc-100">
            {proposal.summary || "生成方案"}
          </h2>
          {proposal.generatedAt ? (
            <p className="text-xs text-zinc-500">{proposal.generatedAt}</p>
          ) : null}
          {quoteId ? (
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400"
            >
              下载 PDF
            </button>
          ) : null}
          {proposal.sections?.map((section, index) => (
            <section key={`${section.title ?? "section"}-${index}`} className="space-y-1">
              {section.title ? (
                <h3 className="text-sm font-medium text-zinc-200">{section.title}</h3>
              ) : null}
              {section.body ? (
                <p className="text-sm leading-6 text-zinc-300">{section.body}</p>
              ) : null}
            </section>
          ))}
          <details className="pt-2">
            <summary className="cursor-pointer text-xs text-zinc-500">调试 JSON</summary>
            <pre className="mt-2 overflow-auto rounded-lg border border-zinc-800 bg-black p-3 text-xs text-zinc-400">
              {result}
            </pre>
          </details>
        </article>
      ) : result ? (
        <pre className="overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
          {result}
        </pre>
      ) : null}
    </div>
  );
}
