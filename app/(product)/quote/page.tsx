"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  companyNameFromProject,
  pickOwnedProjectId,
  productHref,
  resolveClientProductContext,
  writeStoredProductContext,
} from "@/app/(product)/commercial-context";

type OrgMe = { organizationId?: string | null };
type ProjectListItem = { id: string; name?: string; clientName?: string | null };
type ProjectList = { ok?: boolean; projects?: ProjectListItem[] };
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
  projectId?: string;
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

async function listOwnedProjects(organizationId: string): Promise<ProjectListItem[]> {
  const listRes = await fetch("/api/project/list", {
    headers: { "x-organization-id": organizationId },
  });
  const list = (await listRes.json()) as ProjectList;
  return list.ok === true ? list.projects ?? [] : [];
}

async function createOrgProject(
  organizationId: string,
  companyName: string,
): Promise<string> {
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

function QuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState("");
  const [companyLocked, setCompanyLocked] = useState(false);
  const [contextReady, setContextReady] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [proposal, setProposal] = useState<QuoteProposalView | null>(null);
  const [quoteId, setQuoteId] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const ctx = resolveClientProductContext(searchParams);
      const organizationId = await resolveOrganizationId();
      if (cancelled) return;
      setOrganizationId(organizationId);
      if (!organizationId) {
        setContextReady(true);
        return;
      }

      const owned = await listOwnedProjects(organizationId);
      if (cancelled) return;
      const ownedProjectId = pickOwnedProjectId(
        ctx.projectId,
        owned.map((p) => p.id),
      );
      const ownedProject = owned.find((p) => p.id === ownedProjectId);
      const resolvedName = companyNameFromProject(ownedProject);
      setProjectId(ownedProjectId);
      writeStoredProductContext({
        ...ctx,
        organizationId,
        ...(ownedProjectId ? { projectId: ownedProjectId } : {}),
      });
      if (resolvedName) {
        setCompanyName(resolvedName);
        setCompanyLocked(true);
      }
      setContextReady(true);
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleGenerate() {
    if (!companyName.trim()) {
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
      if (!organizationId) {
        throw new Error("缺少组织上下文");
      }

      const owned = await listOwnedProjects(organizationId);
      let nextProjectId = pickOwnedProjectId(
        projectId,
        owned.map((p) => p.id),
      );
      if (!nextProjectId) {
        nextProjectId = await createOrgProject(organizationId, companyName.trim());
      }

      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: orgHeaders(organizationId),
        body: JSON.stringify({
          projectId: nextProjectId,
          companyName: companyName.trim(),
          workspaceId: organizationId,
          organizationId,
        }),
      });
      const data = (await res.json()) as GenerateQuoteResponse;
      const readyProposal =
        data.ok === true && data.status === "READY" && data.proposal
          ? data.proposal
          : null;
      const nextQuoteId = readyProposal && data.quoteId ? data.quoteId : "";
      const boundProjectId = data.projectId?.trim() || nextProjectId;
      setProposal(readyProposal);
      setQuoteId(nextQuoteId);
      setProjectId(boundProjectId);
      setResult(JSON.stringify(data, null, 2));

      if (readyProposal && nextQuoteId) {
        writeStoredProductContext({
          organizationId,
          projectId: boundProjectId,
          quoteId: nextQuoteId,
        });
        router.push(
          productHref("/budget", {
            organizationId,
            projectId: boundProjectId,
            quoteId: nextQuoteId,
          }),
        );
      }
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
      <p className="text-sm text-zinc-400">组织/项目上下文 → 调用 V58 Orchestrator → 返回 AI 方案</p>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        {!contextReady ? (
          <p className="rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-500">
            加载项目上下文…
          </p>
        ) : companyLocked ? (
          <p className="rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-300">
            企业：{companyName}
          </p>
        ) : (
          <input
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
            placeholder="企业名称"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        )}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !contextReady}
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

export default function QuotePage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">加载方案上下文…</p>}>
      <QuoteForm />
    </Suspense>
  );
}
