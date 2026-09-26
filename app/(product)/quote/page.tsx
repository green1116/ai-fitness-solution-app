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

type QuoteHistoryItem = {
  id: string;
  createdAt: string;
  isLatest: boolean;
  areaM2?: number;
  notes?: string;
  selectionCount?: number;
  summary: string;
};

type RequirementStatus =
  | "IN_SCOPE"
  | "CONDITIONAL"
  | "NEEDS_CLARIFICATION"
  | "CONFLICT"
  | "NEW_SCOPE";

type RequirementStatusItem = {
  id: string;
  text: string;
  status: RequirementStatus;
  basis: string;
  question?: string;
};

type ProductCandidateView = {
  candidateId: string;
  brand: string;
  model: string;
  category: string;
  keySpecs: string[];
  fitReason: string;
  source: string;
  verificationStatus: string;
  openQuestions: string[];
};

type ProductCandidateSlotView = {
  slotKey: string;
  category: string;
  subCategory: string;
  templateQuantity: number;
  candidates: ProductCandidateView[];
  emptyMessage?: string;
};

type ProductSelectionView = {
  slotKey: string;
  action: "confirm" | "replace" | "remove";
  candidate: ProductCandidateView | null;
  quantity?: number;
};

type ProductIntelligenceView = {
  quoteId: string;
  requirements: RequirementStatusItem[];
  slots: ProductCandidateSlotView[];
  selections: ProductSelectionView[];
  warnings: string[];
};

type SlotDraft = {
  mode: "template" | "candidate" | "remove";
  candidateId?: string;
  quantity: string;
};

type SelectionPayloadItem = {
  slotKey: string;
  action: "confirm" | "replace" | "remove";
  candidateId?: string | null;
  quantity?: number;
};

const REQUIREMENT_STATUS_LABEL: Record<RequirementStatus, string> = {
  IN_SCOPE: "已纳入方案",
  CONDITIONAL: "有条件纳入",
  NEEDS_CLARIFICATION: "待澄清",
  CONFLICT: "存在冲突",
  NEW_SCOPE: "超出当前范围",
};

const REQUIREMENT_STATUS_CLASS: Record<RequirementStatus, string> = {
  IN_SCOPE: "border-emerald-700 text-emerald-300",
  CONDITIONAL: "border-sky-700 text-sky-300",
  NEEDS_CLARIFICATION: "border-amber-700 text-amber-300",
  CONFLICT: "border-rose-700 text-rose-300",
  NEW_SCOPE: "border-violet-700 text-violet-300",
};

const REFERENCE_CANDIDATE_BADGE = "参考候选 / 未核实";
const NO_CANDIDATE_TEXT = "暂无已验证候选，保留当前模板配置";

async function fetchProductIntelligence(
  quoteId: string,
  organizationId: string,
): Promise<ProductIntelligenceView | null> {
  const qid = quoteId.trim();
  const oid = organizationId.trim();
  if (!qid || !oid) return null;
  try {
    const res = await fetch(
      `/api/quote/product-intelligence?quoteId=${encodeURIComponent(qid)}&organizationId=${encodeURIComponent(oid)}`,
      { headers: { "x-organization-id": oid } },
    );
    const data = (await res.json()) as { ok?: boolean } & Partial<ProductIntelligenceView>;
    if (data.ok !== true) return null;
    return {
      quoteId: data.quoteId ?? qid,
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      slots: Array.isArray(data.slots) ? data.slots : [],
      selections: Array.isArray(data.selections) ? data.selections : [],
      warnings: Array.isArray(data.warnings) ? data.warnings : [],
    };
  } catch {
    return null;
  }
}

function initialSlotDrafts(view: ProductIntelligenceView): {
  drafts: Record<string, SlotDraft>;
  warnings: string[];
} {
  const drafts: Record<string, SlotDraft> = {};
  const warnings: string[] = [];
  for (const slot of view.slots) {
    const selection = view.selections.find((s) => s.slotKey === slot.slotKey);
    const quantity = selection?.quantity != null ? String(selection.quantity) : "";
    if (!selection) {
      drafts[slot.slotKey] = { mode: "template", quantity: "" };
    } else if (selection.action === "remove") {
      drafts[slot.slotKey] = { mode: "remove", quantity: "" };
    } else if (selection.candidate) {
      const exists = slot.candidates.some(
        (c) => c.candidateId === selection.candidate?.candidateId,
      );
      if (exists) {
        drafts[slot.slotKey] = {
          mode: "candidate",
          candidateId: selection.candidate.candidateId,
          quantity,
        };
      } else {
        warnings.push(
          `${slot.subCategory}：已选候选「${selection.candidate.brand} ${selection.candidate.model}」不在当前候选列表中，编辑时按模板配置处理`,
        );
        drafts[slot.slotKey] = { mode: "template", quantity };
      }
    } else {
      drafts[slot.slotKey] = { mode: "template", quantity };
    }
  }
  return { drafts, warnings };
}

function buildSelectionPayload(
  slots: ProductCandidateSlotView[],
  drafts: Record<string, SlotDraft>,
): SelectionPayloadItem[] {
  const out: SelectionPayloadItem[] = [];
  for (const slot of slots) {
    const draft = drafts[slot.slotKey];
    if (!draft) continue;
    const qtyText = draft.quantity.trim();
    const quantity = qtyText ? Number(qtyText) : undefined;
    if (draft.mode === "remove") {
      out.push({ slotKey: slot.slotKey, action: "remove" });
    } else if (draft.mode === "candidate" && draft.candidateId) {
      out.push({
        slotKey: slot.slotKey,
        action:
          draft.candidateId === slot.candidates[0]?.candidateId ? "confirm" : "replace",
        candidateId: draft.candidateId,
        ...(quantity != null ? { quantity } : {}),
      });
    } else if (quantity != null && quantity !== slot.templateQuantity) {
      out.push({
        slotKey: slot.slotKey,
        action: "confirm",
        candidateId: null,
        quantity,
      });
    }
  }
  return out;
}

function isValidDraftQuantity(value: string): boolean {
  const text = value.trim();
  if (!text) return true;
  const n = Number(text);
  return Number.isInteger(n) && n >= 1 && n <= 999;
}

const QUOTE_PROPOSAL_KEY = "product-quote-proposal";

function trimQuoteId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Explicit area from revision notes only (e.g. 100平米 / 100㎡). */
function parseExplicitAreaM2FromNotes(notes: string): number | undefined {
  const match = notes.match(/(\d+(?:\.\d+)?)\s*(?:平方米|平米|㎡|m²|m2)/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value);
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

async function fetchQuoteHistory(
  projectId: string,
  organizationId: string,
): Promise<QuoteHistoryItem[]> {
  const pid = projectId.trim();
  const oid = organizationId.trim();
  if (!pid || !oid) return [];
  try {
    const res = await fetch(
      `/api/quote/list?projectId=${encodeURIComponent(pid)}&organizationId=${encodeURIComponent(oid)}`,
      { headers: { "x-organization-id": oid } },
    );
    const data = (await res.json()) as {
      ok?: boolean;
      quotes?: QuoteHistoryItem[];
    };
    return data.ok === true && Array.isArray(data.quotes) ? data.quotes : [];
  } catch {
    return [];
  }
}

function formatQuoteGeneratedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", { hour12: false });
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
  const [quoteHistory, setQuoteHistory] = useState<QuoteHistoryItem[]>([]);
  const [historyPdfDownloadingId, setHistoryPdfDownloadingId] = useState("");
  const [piView, setPiView] = useState<ProductIntelligenceView | null>(null);
  const [piLoading, setPiLoading] = useState(false);
  const [piSaving, setPiSaving] = useState(false);
  const [piError, setPiError] = useState("");
  const [piLocalWarnings, setPiLocalWarnings] = useState<string[]>([]);
  const [slotDrafts, setSlotDrafts] = useState<Record<string, SlotDraft>>({});
  const [initialSelectionJson, setInitialSelectionJson] = useState("[]");
  const proTier = getPricingTier("PRO");

  useEffect(() => {
    const qid = trimQuoteId(quoteId);
    const oid = organizationId.trim();
    if (!qid || !oid) {
      setPiView(null);
      return;
    }
    let cancelled = false;
    setPiLoading(true);
    setPiError("");
    void fetchProductIntelligence(qid, oid)
      .then((view) => {
        if (cancelled) return;
        setPiView(view);
        if (view) {
          const init = initialSlotDrafts(view);
          setSlotDrafts(init.drafts);
          setPiLocalWarnings(init.warnings);
          setInitialSelectionJson(
            JSON.stringify(buildSelectionPayload(view.slots, init.drafts)),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setPiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quoteId, organizationId]);

  function updateSlotDraft(slotKey: string, patch: Partial<SlotDraft>) {
    setSlotDrafts((prev) => ({
      ...prev,
      [slotKey]: { ...(prev[slotKey] ?? { mode: "template", quantity: "" }), ...patch },
    }));
  }

  const selectionPayload = piView ? buildSelectionPayload(piView.slots, slotDrafts) : [];
  const selectionDirty = JSON.stringify(selectionPayload) !== initialSelectionJson;
  const draftQuantitiesValid = Object.values(slotDrafts).every((d) =>
    isValidDraftQuantity(d.quantity),
  );

  async function handleSaveSelections() {
    const baseQuoteId = trimQuoteId(quoteId);
    if (!baseQuoteId || !organizationId || !piView) return;
    setPiSaving(true);
    setPiError("");
    try {
      const res = await fetch("/api/quote/product-intelligence", {
        method: "POST",
        headers: orgHeaders(organizationId),
        body: JSON.stringify({
          quoteId: baseQuoteId,
          organizationId,
          selections: selectionPayload,
        }),
      });
      const data = (await res.json()) as GenerateQuoteResponse;
      const nextQuoteId =
        data.ok === true && data.status === "READY" ? trimQuoteId(data.quoteId) : "";
      if (!nextQuoteId || !data.proposal) {
        setPiError(data.message || "候选配置保存失败，请稍后重试");
        return;
      }
      const boundProjectId = data.projectId?.trim() || projectId;
      setProposal(data.proposal);
      setQuoteId(nextQuoteId);
      setPdfDownloaded(false);
      writeStoredQuoteForProject(boundProjectId, nextQuoteId, data.proposal);
      writeStoredProductContext({
        organizationId,
        projectId: boundProjectId,
        quoteId: nextQuoteId,
      });
      await refreshQuoteHistory(boundProjectId, organizationId);
    } catch {
      setPiError("候选配置保存失败，请稍后重试");
    } finally {
      setPiSaving(false);
    }
  }

  async function refreshQuoteHistory(
    nextProjectId: string,
    nextOrganizationId: string,
  ) {
    const items = await fetchQuoteHistory(nextProjectId, nextOrganizationId);
    setQuoteHistory(items);
  }

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
        void refreshQuoteHistory(ownedProjectId, organizationId);
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
        const revisedArea = parseExplicitAreaM2FromNotes(requirementNotes);
        if (revisedArea != null) {
          payload.areaM2 = revisedArea;
        }
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
        await refreshQuoteHistory(boundProjectId, organizationId);
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

  async function handleDownloadPdf(targetQuoteId?: string) {
    const id = trimQuoteId(targetQuoteId ?? quoteId);
    if (!id) return;
    const isCurrent = id === trimQuoteId(quoteId);
    if (!isCurrent) setHistoryPdfDownloadingId(id);
    try {
      const res = await fetch(`/api/quote/pdf?quoteId=${encodeURIComponent(id)}`, {
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
      link.download = isCurrent ? "方案.pdf" : `方案-${id.slice(-6)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      if (isCurrent) setPdfDownloaded(true);
    } finally {
      if (!isCurrent) setHistoryPdfDownloadingId("");
    }
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
                  onClick={() => void handleDownloadPdf()}
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

      {quoteId && (piLoading || piView) ? (
        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">需求识别与设备候选配置</h2>
          {piLoading && !piView ? (
            <p className="text-sm text-zinc-500">加载中…</p>
          ) : null}
          {piView ? (
            <>
              {piView.requirements.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-200">需求识别状态</p>
                  <p className="text-xs text-zinc-500">
                    按确定规则识别，仅供参考，不影响方案生成。
                  </p>
                  <ul className="space-y-2">
                    {piView.requirements.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-xs"
                      >
                        <span
                          className={`mr-2 inline-block rounded border px-1.5 py-0.5 ${REQUIREMENT_STATUS_CLASS[item.status] ?? "border-zinc-700 text-zinc-300"}`}
                        >
                          {REQUIREMENT_STATUS_LABEL[item.status] ?? item.status}
                        </span>
                        <span className="text-zinc-200">{item.text}</span>
                        <p className="mt-1 text-zinc-500">{item.basis}</p>
                        {item.question ? (
                          <p className="mt-1 text-amber-300">待确认：{item.question}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">设备候选配置（有氧 / 力量）</p>
                <p className="text-xs text-zinc-500">
                  候选均来自参考目录，标注为「{REFERENCE_CANDIDATE_BADGE}」，仅用于加入当前方案候选配置，不代表确认采购；预算单价仍按预算档位估算。
                </p>
              </div>

              {[...piView.warnings, ...piLocalWarnings].length > 0 ? (
                <ul className="space-y-1 rounded-lg border border-amber-800/60 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
                  {[...piView.warnings, ...piLocalWarnings].map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              ) : null}

              <ul className="space-y-3">
                {piView.slots.map((slot) => {
                  const draft = slotDrafts[slot.slotKey] ?? {
                    mode: "template" as const,
                    quantity: "",
                  };
                  const groupName = `pi-slot-${slot.slotKey}`;
                  return (
                    <li
                      key={slot.slotKey}
                      className="space-y-2 rounded-lg border border-zinc-800 bg-black px-4 py-3"
                    >
                      <p className="text-sm font-medium text-zinc-100">
                        {slot.category} · {slot.subCategory}
                        <span className="ml-2 text-xs font-normal text-zinc-500">
                          模板数量 {slot.templateQuantity} 台/套
                        </span>
                      </p>
                      <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="radio"
                          name={groupName}
                          checked={draft.mode === "template"}
                          onChange={() =>
                            updateSlotDraft(slot.slotKey, { mode: "template", candidateId: undefined })
                          }
                          disabled={piSaving}
                        />
                        保留当前模板配置
                      </label>
                      {slot.candidates.length === 0 ? (
                        <p className="text-xs text-zinc-500">{slot.emptyMessage || NO_CANDIDATE_TEXT}</p>
                      ) : (
                        slot.candidates.map((c) => (
                          <label
                            key={c.candidateId}
                            className="flex items-start gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300"
                          >
                            <input
                              type="radio"
                              className="mt-1"
                              name={groupName}
                              checked={draft.mode === "candidate" && draft.candidateId === c.candidateId}
                              onChange={() =>
                                updateSlotDraft(slot.slotKey, {
                                  mode: "candidate",
                                  candidateId: c.candidateId,
                                })
                              }
                              disabled={piSaving}
                            />
                            <span className="space-y-1">
                              <span className="block">
                                加入当前方案候选配置：{c.brand} {c.model}
                                <span className="ml-2 rounded border border-amber-700 px-1.5 py-0.5 text-xs text-amber-300">
                                  {REFERENCE_CANDIDATE_BADGE}
                                </span>
                              </span>
                              {c.keySpecs.length > 0 ? (
                                <span className="block text-xs text-zinc-500">
                                  {c.keySpecs.join(" · ")}
                                </span>
                              ) : null}
                              <span className="block text-xs text-zinc-400">{c.fitReason}</span>
                              {c.openQuestions.length > 0 ? (
                                <span className="block text-xs text-amber-300/80">
                                  待核实：{c.openQuestions.join("；")}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        ))
                      )}
                      <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="radio"
                          name={groupName}
                          checked={draft.mode === "remove"}
                          onChange={() =>
                            updateSlotDraft(slot.slotKey, {
                              mode: "remove",
                              candidateId: undefined,
                              quantity: "",
                            })
                          }
                          disabled={piSaving}
                        />
                        从当前方案候选配置中移除
                      </label>
                      {draft.mode !== "remove" ? (
                        <label className="flex items-center gap-2 text-xs text-zinc-400">
                          数量
                          <input
                            type="number"
                            min={1}
                            max={999}
                            step={1}
                            className="w-24 rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                            placeholder={String(slot.templateQuantity)}
                            value={draft.quantity}
                            onChange={(e) =>
                              updateSlotDraft(slot.slotKey, { quantity: e.target.value })
                            }
                            disabled={piSaving}
                          />
                          留空则使用模板数量
                          {!isValidDraftQuantity(draft.quantity) ? (
                            <span className="text-rose-300">需为 1-999 的整数</span>
                          ) : null}
                        </label>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => void handleSaveSelections()}
                  disabled={
                    piSaving || loading || !selectionDirty || !draftQuantitiesValid
                  }
                  className="rounded-xl border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-200 hover:border-emerald-400 disabled:opacity-50"
                >
                  {piSaving ? "保存中…" : "保存为新方案版本"}
                </button>
                <p className="text-xs text-zinc-500">
                  保存后生成新的方案版本，当前及历史版本保持不变；此操作仅调整方案候选配置，不代表确认采购。
                </p>
                {piError ? <p className="text-sm text-rose-300">{piError}</p> : null}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {quoteHistory.length > 0 ? (
        <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">方案版本历史</h2>
          <p className="text-xs text-zinc-500">
            每次重新生成都会保留历史方案；可分别下载对应 PDF 进行对比。
          </p>
          <ul className="space-y-3">
            {quoteHistory.map((item) => {
              const isLatest = item.isLatest === true;
              const isCurrent = item.id === trimQuoteId(quoteId);
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-black px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-100">
                      {isLatest
                        ? "最新方案"
                        : formatQuoteGeneratedAt(item.createdAt)}
                      {isCurrent ? (
                        <span className="ml-2 text-xs font-normal text-emerald-400">
                          当前
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-zinc-500">
                      生成时间：{formatQuoteGeneratedAt(item.createdAt)}
                    </p>
                    <p className="text-xs text-zinc-400">{item.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDownloadPdf(item.id)}
                    disabled={historyPdfDownloadingId === item.id}
                    className="shrink-0 rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400 disabled:opacity-50"
                  >
                    {historyPdfDownloadingId === item.id
                      ? "下载中…"
                      : "下载此版 PDF"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
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
