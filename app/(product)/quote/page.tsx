"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  companyNameFromProject,
  isProductContextCrmHandoff,
  parseProductContextSearch,
  pickOwnedProjectId,
  productHref,
  QUOTE_BY_PROJECT_STORAGE_KEY,
  readStoredQuoteIdForProject,
  resolveClientProductContext,
  writeStoredProductContext,
} from "@/app/(product)/commercial-context";
import {
  projectIntakeToCreatePayload,
  quotePayloadFromProjectIntake,
  type StoredProjectIntake,
} from "@/lib/project/project-intake";
import { ProUpgradePaymentCta } from "@/app/(product)/ProUpgradePaymentCta";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

type OrgMe = { organizationId?: string | null };
type SubscriptionResponse = {
  ok?: boolean;
  featureFlags?: { canGenerateBudget?: boolean };
};
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

const QUOTE_PROPOSAL_KEY = "product-quote-proposal";

function trimQuoteId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
    const raw = window.sessionStorage.getItem(QUOTE_BY_PROJECT_STORAGE_KEY);
    const byProject = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    byProject[project] = quote;
    window.sessionStorage.setItem(QUOTE_BY_PROJECT_STORAGE_KEY, JSON.stringify(byProject));

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
    return `${base} 共 ${sectionCount} 个章节，完整正文请下载方案 PDF 查看。`;
  }
  return `${base} 完整正文请下载方案 PDF 查看。`;
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

/** Fail closed: only true when billing subscription confirms the flag. */
async function loadCanGenerateBudget(organizationId: string): Promise<boolean> {
  const orgId = organizationId.trim();
  if (!orgId) return false;
  try {
    const res = await fetch("/api/billing/subscription", {
      headers: {
        "Content-Type": "application/json",
        "x-organization-id": orgId,
      },
    });
    if (!res.ok) return false;
    const body = (await res.json().catch(() => ({}))) as SubscriptionResponse;
    return body.ok === true && body.featureFlags?.canGenerateBudget === true;
  } catch {
    return false;
  }
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
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [projectIntake, setProjectIntake] = useState<StoredProjectIntake | null>(null);
  const [canGenerateBudget, setCanGenerateBudget] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const proTier = getPricingTier("PRO");

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const urlCtx = parseProductContextSearch(searchParams);
      const crmHandoff = isProductContextCrmHandoff(searchParams);
      const ctx = resolveClientProductContext(searchParams);
      const organizationId = await resolveOrganizationId();
      if (cancelled) return;
      setOrganizationId(organizationId);
      if (!organizationId) {
        setCanGenerateBudget(false);
        setContextReady(true);
        return;
      }

      // Budget flag: background only — must not block first paint.
      void loadCanGenerateBudget(organizationId).then((budgetAllowed) => {
        if (cancelled) return;
        setCanGenerateBudget(budgetAllowed);
      });

      const owned = await listOwnedProjects(organizationId);
      if (cancelled) return;
      const urlProjectId = urlCtx.projectId?.trim() ?? "";
      const ownedProjectId = pickOwnedProjectId(
        urlProjectId || ctx.projectId,
        owned.map((p) => p.id),
      );
      const ownedProject = owned.find((p) => p.id === ownedProjectId);
      const resolvedName = companyNameFromProject(ownedProject);
      setProjectId(ownedProjectId);
      if (ownedProjectId) {
        const resolvedQuoteId =
          trimQuoteId(urlCtx.quoteId) ||
          trimQuoteId(ctx.quoteId) ||
          (!crmHandoff && ownedProjectId
            ? readStoredQuoteIdForProject(ownedProjectId)
            : "");
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

      // Intake enrichment: background only — must not block contextReady.
      if (ownedProjectId) {
        void fetchProjectIntake(ownedProjectId, organizationId)
          .then((storedIntake) => {
            if (cancelled || !storedIntake) return;
            setProjectIntake(storedIntake);
            const intakeName =
              companyNameFromProject(storedIntake) ||
              companyNameFromProject(ownedProject);
            if (intakeName) {
              setCompanyName(intakeName);
              setCompanyLocked(true);
            }
          })
          .catch(() => {
            // Same fail-soft as before for missing project payload; UI already ready.
          });
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleGenerate(options?: { revision?: boolean }) {
    if (!companyName.trim()) {
      alert("请填写企业名称");
      return;
    }
    const isRevision = options?.revision === true;
    if (quoteId.trim() && !isRevision) {
      return;
    }
    const requirementNotes = revisionNotes.trim();
    if (isRevision && !requirementNotes) {
      alert("请填写补充要求后再重新生成");
      return;
    }

    setLoading(true);
    setError("");
    if (!isRevision) {
      setProposal(null);
      setQuoteId("");
    }

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

      const payload = quotePayloadFromProjectIntake({
        projectId: nextProjectId,
        organizationId,
        companyName: companyName.trim(),
        project: intake,
      });
      if (requirementNotes) {
        payload.notes = requirementNotes;
      }

      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: orgHeaders(organizationId),
        body: JSON.stringify(payload),
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
      setPdfDownloaded(false);
      setProjectId(boundProjectId);

      if (readyProposal && nextQuoteId) {
        writeStoredQuoteForProject(boundProjectId, nextQuoteId, readyProposal);
        writeStoredProductContext({
          organizationId,
          projectId: boundProjectId,
          quoteId: nextQuoteId,
        });
        if (isRevision) {
          setRevisionNotes("");
        }
      } else {
        setError("方案生成失败，请稍后重试");
      }
    } catch {
      if (!isRevision) {
        setProposal(null);
        setQuoteId("");
      }
      setPdfDownloaded(false);
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
    link.download = "方案.pdf";
    link.click();
    URL.revokeObjectURL(url);
    setPdfDownloaded(true);
  }

  const hasProjectId = Boolean(projectId.trim());
  /** BASIC pay gate: visible on arrival from「升级专业版」, no quoteId/proposal required. */
  const showImmediateProPayGate =
    contextReady && !canGenerateBudget && hasProjectId;

  const refreshBudgetEntitlement = async () => {
    const allowed = await loadCanGenerateBudget(organizationId);
    setCanGenerateBudget(allowed);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-emerald-400">交付路径：项目 → 方案 → 预算 → 投标 → 下载</p>
        <h1 className="mt-1 text-2xl font-bold">当前：方案</h1>
        <p className="text-sm text-zinc-400">
          {quoteId
            ? canGenerateBudget
              ? "方案已就绪。主要下一步：继续生成预算。"
              : "方案已就绪。预算测算为专业版能力，升级后可继续。"
            : "填写企业信息，生成专业健身空间方案。"}
        </p>
      </div>

      {showImmediateProPayGate ? (
        <div className="space-y-3 rounded-xl border border-amber-700/50 bg-black p-4">
          <p className="text-sm font-medium text-zinc-100">
            {proTier.label} ¥{proTier.monthlyPriceCny}/月
          </p>
          <p className="text-sm text-zinc-300">{proTier.headline}</p>
          <ProUpgradePaymentCta
            context={{ organizationId, projectId, quoteId }}
            buttonClassName="inline-block rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black hover:bg-emerald-300"
            onPaidSuccess={refreshBudgetEntitlement}
          />
        </div>
      ) : null}

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
            onClick={() => void handleGenerate()}
            disabled={loading || !contextReady}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "生成中…" : "生成方案"}
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-200">补充要求</span>
              <textarea
                className="min-h-[6rem] w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100"
                placeholder="用自然语言补充约束或修订要求，例如：偏重有氧、控制在 15 万内、需考虑无窗地下室通风…"
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                disabled={loading}
              />
            </label>
            <button
              type="button"
              onClick={() => void handleGenerate({ revision: true })}
              disabled={loading || !contextReady || !revisionNotes.trim()}
              className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-100 hover:border-zinc-400 disabled:opacity-50"
            >
              {loading ? "重新生成中…" : "按新要求重新生成"}
            </button>
          </div>
        )}
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
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-zinc-300">完整方案详情请下载方案 PDF 查看</p>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-zinc-100"
                >
                  下载方案 PDF
                </button>
                {pdfDownloaded ? (
                  <p className="text-sm text-emerald-300">方案 PDF 已下载。</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">下一步：预算</p>
                {canGenerateBudget ? (
                  <Link
                    href={productHref("/budget", {
                      organizationId,
                      projectId,
                      quoteId,
                    })}
                    className="inline-block rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black hover:bg-emerald-300"
                  >
                    继续生成预算
                  </Link>
                ) : showImmediateProPayGate ? (
                  <p className="text-sm text-zinc-300">
                    升级{proTier.label}后可继续预算测算，请使用上方微信支付完成开通。
                  </p>
                ) : (
                  <div className="space-y-2 rounded-xl border border-amber-700/50 bg-black p-4">
                    <p className="text-sm text-zinc-300">
                      预算（{proTier.label}）· ¥{proTier.monthlyPriceCny}/月 · {proTier.headline}。当前套餐无法直接进入预算计算，请使用微信扫码自助升级。
                    </p>
                    <ProUpgradePaymentCta
                      context={{ organizationId, projectId, quoteId }}
                      buttonClassName="inline-block rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black hover:bg-emerald-300"
                      onPaidSuccess={refreshBudgetEntitlement}
                    />
                  </div>
                )}
                {pdfDownloaded && canGenerateBudget ? (
                  <p className="text-sm text-emerald-300">
                    请继续下一步生成预算。{" "}
                    <Link
                      href={productHref("/budget", {
                        organizationId,
                        projectId,
                        quoteId,
                      })}
                      className="underline hover:text-emerald-200"
                    >
                      前往预算
                    </Link>
                  </p>
                ) : null}
                {pdfDownloaded && !canGenerateBudget ? (
                  showImmediateProPayGate ? (
                    <p className="text-sm text-emerald-300">
                      升级{proTier.label}后可继续预算测算。
                    </p>
                  ) : (
                    <p className="text-sm text-emerald-300">
                      升级{proTier.label}后可继续预算测算。{" "}
                      <ProUpgradePaymentCta
                        context={{ organizationId, projectId, quoteId }}
                        buttonClassName="underline hover:text-emerald-200 text-sm font-normal bg-transparent p-0 text-emerald-300"
                        onPaidSuccess={refreshBudgetEntitlement}
                      />
                    </p>
                  )
                ) : null}
              </div>

              {projectId ? (
                <Link
                  href={`/projects/${encodeURIComponent(projectId)}`}
                  className="inline-block text-sm text-zinc-400 underline hover:text-zinc-200"
                >
                  ← 返回项目
                </Link>
              ) : null}
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
