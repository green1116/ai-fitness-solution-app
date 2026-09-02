"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  companyNameFromProject,
  parseProductContextSearch,
  pickOwnedProjectId,
  productHref,
  resolveClientProductContext,
  writeStoredProductContext,
} from "@/app/(product)/commercial-context";
import {
  projectIntakeToCreatePayload,
  quotePayloadFromProjectIntake,
  type StoredProjectIntake,
} from "@/lib/project/project-intake";

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

const QUOTE_BY_PROJECT_KEY = "product-quote-by-project";
const QUOTE_PROPOSAL_KEY = "product-quote-proposal";

function trimQuoteId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readStoredQuoteIdForProject(projectId: string): string {
  if (typeof window === "undefined") return "";
  const id = projectId.trim();
  if (!id) return "";
  try {
    const raw = window.sessionStorage.getItem(QUOTE_BY_PROJECT_KEY);
    if (!raw) return "";
    const map = JSON.parse(raw) as Record<string, string>;
    return trimQuoteId(map[id]);
  } catch {
    return "";
  }
}

function readStoredQuoteProposal(quoteId: string): QuoteProposalView | null {
  if (typeof window === "undefined") return null;
  const id = trimQuoteId(quoteId);
  if (!id) return null;
  try {
    const raw = window.sessionStorage.getItem(QUOTE_PROPOSAL_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, QuoteProposalView>;
    const proposal = map[id];
    return proposal && typeof proposal === "object" ? proposal : null;
  } catch {
    return null;
  }
}

function writeStoredQuoteForProject(
  projectId: string,
  quoteId: string,
  proposal: QuoteProposalView,
): void {
  if (typeof window === "undefined") return;
  const project = projectId.trim();
  const quote = trimQuoteId(quoteId);
  if (!project || !quote) return;
  try {
    const raw = window.sessionStorage.getItem(QUOTE_BY_PROJECT_KEY);
    const byProject = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    byProject[project] = quote;
    window.sessionStorage.setItem(QUOTE_BY_PROJECT_KEY, JSON.stringify(byProject));

    const proposalRaw = window.sessionStorage.getItem(QUOTE_PROPOSAL_KEY);
    const byQuote = proposalRaw ? (JSON.parse(proposalRaw) as Record<string, QuoteProposalView>) : {};
    byQuote[quote] = proposal;
    window.sessionStorage.setItem(QUOTE_PROPOSAL_KEY, JSON.stringify(byQuote));
  } catch {
    // ignore
  }
}

function stubProposalForRestore(companyName: string): QuoteProposalView {
  const name = companyName.trim() || "您的企业";
  return { summary: `已为 ${name} 生成健身空间方案建议。` };
}

function buildCustomerSummary(
  proposal: QuoteProposalView,
  companyName: string,
): string {
  const sectionCount = proposal.sections?.length ?? 0;
  const base =
    proposal.summary?.trim() ||
    `已为 ${companyName.trim() || "您的企业"} 生成健身空间方案建议。`;
  if (sectionCount > 0) {
    return `${base} 共 ${sectionCount} 个章节，完整正文请下载 Plan PDF 查看。`;
  }
  return `${base} 完整正文请下载 Plan PDF 查看。`;
}

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

async function fetchProjectIntake(
  projectId: string,
  organizationId: string,
): Promise<StoredProjectIntake | null> {
  const res = await fetch(`/api/project/${encodeURIComponent(projectId)}`, {
    headers: { "x-organization-id": organizationId },
  });
  const data = (await res.json()) as {
    ok?: boolean;
    project?: StoredProjectIntake & { exists?: boolean };
  };
  if (!data.ok || !data.project?.exists) return null;
  return data.project;
}

async function createOrgProject(
  organizationId: string,
  companyName: string,
): Promise<string> {
  const createRes = await fetch("/api/project/create", {
    method: "POST",
    headers: orgHeaders(organizationId),
    body: JSON.stringify({
      ...projectIntakeToCreatePayload({
        name: companyName,
        clientName: companyName,
        scenario: "企业办公楼",
        goal: "提升员工健康",
        companySize: "",
        area: "",
        budget: "5-10万",
        city: "",
        industry: "",
        notes: "",
      }),
      organizationId,
    }),
  });
  const created = (await createRes.json()) as ProjectCreate;
  const createdId = created.project?.id?.trim();
  if (!created.ok || !createdId) {
    throw new Error("项目创建失败");
  }
  return createdId;
}

function QuoteForm() {
  const searchParams = useSearchParams();
  const [companyName, setCompanyName] = useState("");
  const [companyLocked, setCompanyLocked] = useState(false);
  const [contextReady, setContextReady] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState<QuoteProposalView | null>(null);
  const [quoteId, setQuoteId] = useState("");
  const [projectIntake, setProjectIntake] = useState<StoredProjectIntake | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const urlCtx = parseProductContextSearch(searchParams);
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
      const urlProjectId = urlCtx.projectId?.trim() ?? "";
      const ownedProjectId = pickOwnedProjectId(
        urlProjectId || ctx.projectId,
        owned.map((p) => p.id),
      );
      const ownedProject = owned.find((p) => p.id === ownedProjectId);
      const storedIntake =
        ownedProjectId && organizationId
          ? await fetchProjectIntake(ownedProjectId, organizationId)
          : null;
      if (cancelled) return;
      const resolvedName =
        companyNameFromProject(storedIntake ?? ownedProject) ||
        companyNameFromProject(ownedProject);
      setProjectId(ownedProjectId);
      setProjectIntake(storedIntake);
      if (ownedProjectId) {
        const resolvedQuoteId =
          trimQuoteId(urlCtx.quoteId) ||
          trimQuoteId(ctx.quoteId) ||
          readStoredQuoteIdForProject(ownedProjectId);
        if (resolvedQuoteId) {
          const storedProposal = readStoredQuoteProposal(resolvedQuoteId);
          setQuoteId(resolvedQuoteId);
          setProposal(
            storedProposal ?? stubProposalForRestore(resolvedName || companyName),
          );
        }
        writeStoredProductContext({
          organizationId,
          projectId: ownedProjectId,
          ...(resolvedQuoteId ? { quoteId: resolvedQuoteId } : {}),
        });
      } else {
        writeStoredProductContext({
          ...ctx,
          organizationId,
        });
      }
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
    if (quoteId.trim()) {
      return;
    }

    setLoading(true);
    setError("");
    setProposal(null);
    setQuoteId("");

    try {
      const organizationId = await resolveOrganizationId();
      setOrganizationId(organizationId);
      if (!organizationId) {
        setError("请先登录后再生成方案");
        return;
      }

      const owned = await listOwnedProjects(organizationId);
      let nextProjectId = pickOwnedProjectId(
        projectId,
        owned.map((p) => p.id),
      );
      let intake = projectIntake;
      if (nextProjectId) {
        intake = (await fetchProjectIntake(nextProjectId, organizationId)) ?? intake;
        setProjectIntake(intake);
      }
      if (!nextProjectId) {
        nextProjectId = await createOrgProject(organizationId, companyName.trim());
        intake = (await fetchProjectIntake(nextProjectId, organizationId)) ?? intake;
        setProjectIntake(intake);
      }

      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: orgHeaders(organizationId),
        body: JSON.stringify(
          quotePayloadFromProjectIntake({
            projectId: nextProjectId,
            organizationId,
            companyName: companyName.trim(),
            project: intake,
          }),
        ),
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

      if (readyProposal && nextQuoteId) {
        writeStoredQuoteForProject(boundProjectId, nextQuoteId, readyProposal);
        writeStoredProductContext({
          organizationId,
          projectId: boundProjectId,
          quoteId: nextQuoteId,
        });
      } else {
        setError("方案生成失败，请稍后重试");
      }
    } catch {
      setProposal(null);
      setQuoteId("");
      setError("方案生成失败，请稍后重试");
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
    link.download = "quote.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">方案生成</h1>
      <p className="text-sm text-zinc-400">填写企业信息，生成专业健身空间方案</p>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        {!contextReady ? (
          <p className="rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-500">
            加载中…
          </p>
        ) : companyLocked ? (
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-300">
            <p>企业：{companyName}</p>
            {projectIntake ? (
              <p className="text-xs text-zinc-500">
                {[
                  projectIntake.targetUsers ? `${projectIntake.targetUsers} 人` : null,
                  projectIntake.areaM2 ? `${projectIntake.areaM2} ㎡` : null,
                  projectIntake.city?.trim() || null,
                  projectIntake.industry?.trim() || null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "项目参数已绑定"}
              </p>
            ) : null}
          </div>
        ) : (
          <input
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
            placeholder="企业名称"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        )}
        {!quoteId ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !contextReady}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "生成中…" : "生成方案"}
          </button>
        ) : null}
      </section>

      {proposal ? (
        <article className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-semibold text-zinc-100">方案结果摘要</h2>
          {proposal.generatedAt ? (
            <p className="text-xs text-zinc-500">{proposal.generatedAt}</p>
          ) : null}
          <p className="text-sm leading-relaxed text-zinc-300">
            {buildCustomerSummary(proposal, companyName)}
          </p>
          {quoteId ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={productHref("/budget", {
                  organizationId,
                  projectId,
                  quoteId,
                })}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black"
              >
                继续预算
              </Link>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400"
              >
                下载 PDF
              </button>
            </div>
          ) : null}
        </article>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">加载中…</p>}>
      <QuoteForm />
    </Suspense>
  );
}
