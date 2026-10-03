"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearStoredQuoteIdForProject,
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
  describeQuoteProjectAreaConflict,
  projectIntakeToCreatePayload,
  quotePayloadFromProjectIntake,
  type StoredProjectIntake,
} from "@/lib/project/project-intake";
import { ProUpgradePaymentCta } from "@/app/(product)/ProUpgradePaymentCta";
import {
  deriveQuoteWorkflowStage,
  isPanelReachable,
  isProductConfigConfirmed,
  isQuoteReady,
  QUOTE_WORKFLOW_STEPS,
  readWorkflowAck,
  requirementsNeedingAck,
  resolveActivePanel,
  restoredWorkflowAckQuoteIds,
  withExplicitTemplateConfirmations,
  writeWorkflowAck,
  type PiLoadStatus,
  type QuoteWorkflowPanel,
  type QuoteWorkflowStage,
} from "@/app/(product)/quote/quote-workflow";
import { getPricingTier } from "@/lib/growth/conversion/pricing.strategy";

type OrgMe = { organizationId?: string | null; user?: { id?: string | null } | null };
type SubscriptionResponse = {
  ok?: boolean;
  subscription?: { plan?: string };
  featureFlags?: { canGenerateBudget?: boolean };
};
type BudgetEntitlementState = "loading" | "entitled" | "upgradeable" | "error";
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

type ClarificationKey = "headcount" | "area" | "budget";
type ClarificationItem = { key: ClarificationKey; label: string; impact: string };
type ClarificationValues = Partial<Record<ClarificationKey, number>>;
type ClarificationDraft = Record<ClarificationKey, string>;
type AnalyzeResponse = {
  ok?: boolean;
  missingCriticalInfo?: Array<{ key?: string; label?: string; impact?: string }>;
  conflicts?: string[];
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

type PriceFactSourceType = "supplier_quote" | "procurement_contract";
type PriceFactTaxStatus = "tax_included" | "tax_excluded";

type PriceFactView = {
  unitPrice: number;
  currency: "CNY";
  sourceType: PriceFactSourceType;
  sourceReference: string;
  quotedAt: string;
  supplier?: string;
  taxStatus?: PriceFactTaxStatus;
  validUntil?: string;
};

type ProductSelectionView = {
  slotKey: string;
  action: "confirm" | "replace" | "remove";
  candidate: ProductCandidateView | null;
  quantity?: number;
  priceFact?: PriceFactView;
};

type StrategyFactView =
  | { status: "known"; source?: string; value?: number; amountYuan?: number; label?: string }
  | { status: "unknown" };

/** Read-only mirror of persisted `Quote.content.configurationStrategy` (fields are optional by design). */
type ConfigurationAnalysisView = {
  analyzedAt?: string;
  missingCriticalInfo?: Array<{ key?: string; label?: string; impact?: string }>;
  configurationStrategy?: {
    facts?: {
      headcount?: StrategyFactView;
      areaM2?: StrategyFactView;
      budget?: StrategyFactView;
      siteType?: string;
      priceBand?: string;
    };
    experience?: { level?: string };
    focus?: { signals?: Array<{ focus?: string; label?: string; role?: string }> };
    zoning?: Array<{ zone?: string; sharePct?: [number, number]; areaM2?: [number, number] }>;
    guidance?: string[];
    constraints?: string[];
    conflicts?: string[];
    downstreamNotes?: string[];
  };
};

type ProductIntelligenceView = {
  quoteId: string;
  requirements: RequirementStatusItem[];
  slots: ProductCandidateSlotView[];
  selections: ProductSelectionView[];
  warnings: string[];
  configurationStrategy: ConfigurationAnalysisView | null;
};

type SlotDraft = {
  mode: "template" | "candidate" | "custom" | "remove";
  candidateId?: string;
  customBrand?: string;
  customModel?: string;
  quantity: string;
  unitPrice?: string;
  priceSourceType?: PriceFactSourceType | "";
  priceSourceReference?: string;
  priceQuotedAt?: string;
  priceSupplier?: string;
  priceTaxStatus?: PriceFactTaxStatus | "";
  priceValidUntil?: string;
};

type SelectionPayloadItem = {
  slotKey: string;
  action: "confirm" | "replace" | "remove";
  candidateId?: string | null;
  /** Customer-specified product; identity / source / verification are set by the server. */
  customProduct?: { brand: string; model: string };
  quantity?: number;
  priceFact?: PriceFactView;
};

const CUSTOMER_SPECIFIED_SOURCE = "customer-specified";
const MAX_CUSTOM_PRODUCT_FIELD_LENGTH = 100;

const PRICE_SOURCE_OPTIONS: Array<{ value: PriceFactSourceType; label: string }> = [
  { value: "supplier_quote", label: "供应商报价" },
  { value: "procurement_contract", label: "采购合同" },
];

const PRICE_TAX_STATUS_OPTIONS: Array<{ value: PriceFactTaxStatus; label: string }> = [
  { value: "tax_included", label: "含税" },
  { value: "tax_excluded", label: "不含税" },
];

const MAX_PRICE_SUPPLIER_LENGTH = 100;

const EMPTY_PRICE_DRAFT = {
  unitPrice: "",
  priceSourceType: "" as const,
  priceSourceReference: "",
  priceQuotedAt: "",
  priceSupplier: "",
  priceTaxStatus: "" as const,
  priceValidUntil: "",
};

/** Optional metadata keys appear only when the stored fact carries them (old facts hydrate unchanged). */
function priceDraftFromFact(fact: PriceFactView | undefined): Partial<SlotDraft> {
  if (!fact) return {};
  return {
    unitPrice: String(fact.unitPrice),
    priceSourceType: fact.sourceType,
    priceSourceReference: fact.sourceReference,
    priceQuotedAt: fact.quotedAt,
    ...(fact.supplier ? { priceSupplier: fact.supplier } : {}),
    ...(fact.taxStatus ? { priceTaxStatus: fact.taxStatus } : {}),
    ...(fact.validUntil ? { priceValidUntil: fact.validUntil } : {}),
  };
}

/** Same normalization as the server (NFC, collapsed whitespace, trimmed). */
function normalizePriceSupplier(value: string | undefined): string {
  return (value ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
}

function priceTaxStatusFromDraft(draft: SlotDraft): PriceFactTaxStatus | undefined {
  return draft.priceTaxStatus === "tax_included" || draft.priceTaxStatus === "tax_excluded"
    ? draft.priceTaxStatus
    : undefined;
}

/** Concrete product (reference candidate or customer-specified) that a verified price can attach to. */
function draftHasProduct(draft: SlotDraft): boolean {
  return draft.mode === "candidate" || draft.mode === "custom";
}

function customProductFromDraft(draft: SlotDraft): { brand: string; model: string } | undefined {
  if (draft.mode !== "custom") return undefined;
  const brand = draft.customBrand?.trim() ?? "";
  const model = draft.customModel?.trim() ?? "";
  if (!brand || !model) return undefined;
  if (brand.length > MAX_CUSTOM_PRODUCT_FIELD_LENGTH || model.length > MAX_CUSTOM_PRODUCT_FIELD_LENGTH) {
    return undefined;
  }
  return { brand, model };
}

function customDraftError(draft: SlotDraft): string | null {
  if (draft.mode !== "custom") return null;
  const brand = draft.customBrand?.trim() ?? "";
  const model = draft.customModel?.trim() ?? "";
  if (!brand) return "请填写客户指定产品的品牌";
  if (!model) return "请填写客户指定产品的型号";
  if (brand.length > MAX_CUSTOM_PRODUCT_FIELD_LENGTH || model.length > MAX_CUSTOM_PRODUCT_FIELD_LENGTH) {
    return `品牌与型号均不超过 ${MAX_CUSTOM_PRODUCT_FIELD_LENGTH} 字`;
  }
  return null;
}

function hasRequiredPriceDraft(draft: SlotDraft): boolean {
  return Boolean(
    draft.unitPrice?.trim() ||
      draft.priceSourceType ||
      draft.priceSourceReference?.trim() ||
      draft.priceQuotedAt?.trim(),
  );
}

function hasPriceMetadataDraft(draft: SlotDraft): boolean {
  return Boolean(
    normalizePriceSupplier(draft.priceSupplier) ||
      draft.priceTaxStatus ||
      draft.priceValidUntil?.trim(),
  );
}

function hasPriceDraft(draft: SlotDraft): boolean {
  return hasRequiredPriceDraft(draft) || hasPriceMetadataDraft(draft);
}

/** All-or-nothing: a partially filled price is invalid, never defaulted; metadata alone is never dropped silently. */
function priceDraftError(draft: SlotDraft): string | null {
  if (!draftHasProduct(draft) || !hasPriceDraft(draft)) return null;
  if (!hasRequiredPriceDraft(draft)) {
    return "填写供应商、含税状态或有效期时，需同时填写核实单价、来源类型、来源编号和报价日期";
  }
  const price = Number(draft.unitPrice?.trim());
  if (!draft.unitPrice?.trim() || !Number.isFinite(price) || price <= 0 || price > 10_000_000) {
    return "核实单价需为大于 0 的数值";
  }
  if (!draft.priceSourceType) return "请选择价格来源类型";
  if (!draft.priceSourceReference?.trim()) return "请填写报价单号 / 合同号";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.priceQuotedAt?.trim() ?? "")) return "请填写报价日期";
  if (normalizePriceSupplier(draft.priceSupplier).length > MAX_PRICE_SUPPLIER_LENGTH) {
    return `供应商不超过 ${MAX_PRICE_SUPPLIER_LENGTH} 字`;
  }
  const validUntil = draft.priceValidUntil?.trim() ?? "";
  if (validUntil) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return "请填写有效的报价有效期";
    if (validUntil < draft.priceQuotedAt!.trim()) return "报价有效期不能早于报价日期";
  }
  return null;
}

function priceFactFromDraft(draft: SlotDraft): PriceFactView | undefined {
  if (!draftHasProduct(draft) || !hasPriceDraft(draft) || priceDraftError(draft)) {
    return undefined;
  }
  const supplier = normalizePriceSupplier(draft.priceSupplier);
  const taxStatus = priceTaxStatusFromDraft(draft);
  const validUntil = draft.priceValidUntil?.trim() ?? "";
  return {
    unitPrice: Number(draft.unitPrice!.trim()),
    currency: "CNY",
    sourceType: draft.priceSourceType as PriceFactSourceType,
    sourceReference: draft.priceSourceReference!.trim(),
    quotedAt: draft.priceQuotedAt!.trim(),
    ...(supplier ? { supplier } : {}),
    ...(taxStatus ? { taxStatus } : {}),
    ...(validUntil ? { validUntil } : {}),
  };
}

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
const CUSTOMER_SPECIFIED_BADGE = "客户指定 / 参数未核实";
const NO_CANDIDATE_TEXT = "暂无已验证候选，保留 AI 建议配置";

/** Saved quantity of the current Quote version for a slot; read-only view of existing selections. */
function savedSlotQuantity(
  slot: ProductCandidateSlotView,
  selection: ProductSelectionView | undefined,
): { quantity: number | null; status: "已确认" | "沿用 AI 建议" | "已移除" } {
  if (selection?.action === "remove") return { quantity: null, status: "已移除" };
  if (selection?.quantity != null) return { quantity: selection.quantity, status: "已确认" };
  return { quantity: slot.templateQuantity, status: "沿用 AI 建议" };
}

const QUOTE_PROJECT_MISMATCH_CODE = "QUOTE_PROJECT_MISMATCH";

type ProductIntelligenceResult =
  | { kind: "ok"; view: ProductIntelligenceView }
  | { kind: "mismatch" }
  | { kind: "error" };

async function fetchProductIntelligence(
  quoteId: string,
  organizationId: string,
  projectId: string,
): Promise<ProductIntelligenceResult> {
  const qid = quoteId.trim();
  const oid = organizationId.trim();
  const pid = projectId.trim();
  if (!qid || !oid || !pid) return { kind: "error" };
  try {
    const res = await fetch(
      `/api/quote/product-intelligence?quoteId=${encodeURIComponent(qid)}&organizationId=${encodeURIComponent(oid)}&projectId=${encodeURIComponent(pid)}`,
      { headers: { "x-organization-id": oid } },
    );
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      code?: string;
    } & Partial<ProductIntelligenceView>;
    if (
      (res.status === 409 && data.code === QUOTE_PROJECT_MISMATCH_CODE) ||
      res.status === 404
    ) {
      return { kind: "mismatch" };
    }
    if (data.ok !== true) return { kind: "error" };
    return {
      kind: "ok",
      view: {
        quoteId: data.quoteId ?? qid,
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        slots: Array.isArray(data.slots) ? data.slots : [],
        selections: Array.isArray(data.selections) ? data.selections : [],
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
        configurationStrategy:
          data.configurationStrategy && typeof data.configurationStrategy === "object"
            ? data.configurationStrategy
            : null,
      },
    };
  } catch {
    return { kind: "error" };
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
    } else if (selection.candidate?.source === CUSTOMER_SPECIFIED_SOURCE) {
      drafts[slot.slotKey] = {
        mode: "custom",
        customBrand: selection.candidate.brand,
        customModel: selection.candidate.model,
        quantity,
        ...priceDraftFromFact(selection.priceFact),
      };
    } else if (selection.candidate) {
      const exists = slot.candidates.some(
        (c) => c.candidateId === selection.candidate?.candidateId,
      );
      if (exists) {
        drafts[slot.slotKey] = {
          mode: "candidate",
          candidateId: selection.candidate.candidateId,
          quantity,
          ...priceDraftFromFact(selection.priceFact),
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
    } else if (draft.mode === "custom") {
      const customProduct = customProductFromDraft(draft);
      if (!customProduct) continue;
      const priceFact = priceFactFromDraft(draft);
      out.push({
        slotKey: slot.slotKey,
        action: "replace",
        customProduct,
        ...(quantity != null ? { quantity } : {}),
        ...(priceFact ? { priceFact } : {}),
      });
    } else if (draft.mode === "candidate" && draft.candidateId) {
      const priceFact = priceFactFromDraft(draft);
      out.push({
        slotKey: slot.slotKey,
        action:
          draft.candidateId === slot.candidates[0]?.candidateId ? "confirm" : "replace",
        candidateId: draft.candidateId,
        ...(quantity != null ? { quantity } : {}),
        ...(priceFact ? { priceFact } : {}),
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

const CLARIFICATION_KEYS: readonly ClarificationKey[] = ["headcount", "area", "budget"];
const EMPTY_CLARIFICATION_DRAFT: ClarificationDraft = { headcount: "", area: "", budget: "" };
const CLARIFICATION_INPUT: Record<ClarificationKey, { unit: string; placeholder: string }> = {
  headcount: { unit: "人", placeholder: "例如 80" },
  area: { unit: "㎡", placeholder: "例如 100" },
  budget: { unit: "万元", placeholder: "例如 30" },
};

function parsePositiveInput(raw: string): number | undefined {
  const text = raw.trim();
  if (!text) return undefined;
  const value = Number(text);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Fills only facts the payload lacks; budget is appended so existing notes are kept. */
function applyClarification(
  payload: Record<string, unknown>,
  values: ClarificationValues,
): void {
  if (values.headcount != null && payload.targetUsers == null) {
    payload.targetUsers = Math.floor(values.headcount);
  }
  if (values.area != null && payload.areaM2 == null) {
    payload.areaM2 = values.area;
  }
  if (values.budget != null) {
    const existing = typeof payload.notes === "string" ? payload.notes.trim() : "";
    payload.notes = [existing, `预算${values.budget}万`].filter(Boolean).join(" · ");
  }
}

/** Fail-soft: null means analysis unavailable; generation proceeds as before. */
async function requestRequirementAnalysis(
  payload: Record<string, unknown>,
  organizationId: string,
): Promise<{ items: ClarificationItem[]; conflicts: string[] } | null> {
  try {
    const res = await fetch("/api/quote/analyze", {
      method: "POST",
      headers: orgHeaders(organizationId),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AnalyzeResponse;
    if (data.ok !== true) return null;
    const items = (data.missingCriticalInfo ?? []).filter(
      (item): item is ClarificationItem =>
        CLARIFICATION_KEYS.includes(item.key as ClarificationKey) &&
        typeof item.label === "string",
    );
    return { items, conflicts: Array.isArray(data.conflicts) ? data.conflicts : [] };
  } catch {
    return null;
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

async function resolveSessionIdentity(): Promise<{ organizationId: string; userId: string }> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as OrgMe;
  return {
    organizationId: typeof me.organizationId === "string" ? me.organizationId.trim() : "",
    userId: typeof me.user?.id === "string" ? me.user.id.trim() : "",
  };
}

async function resolveOrganizationId(): Promise<string> {
  return (await resolveSessionIdentity()).organizationId;
}

/**
 * Payment CTAs may only render for "upgradeable" (explicit BASIC plan);
 * any lookup failure is "error", never purchasable.
 */
async function loadBudgetEntitlement(
  organizationId: string,
): Promise<Exclude<BudgetEntitlementState, "loading">> {
  const orgId = organizationId.trim();
  if (!orgId) return "error";
  try {
    const res = await fetch("/api/billing/subscription", {
      headers: {
        "Content-Type": "application/json",
        "x-organization-id": orgId,
      },
    });
    if (!res.ok) return "error";
    const body = (await res.json().catch(() => ({}))) as SubscriptionResponse;
    if (body.ok !== true) return "error";
    const plan = String(body.subscription?.plan ?? "").trim().toUpperCase();
    if (body.featureFlags?.canGenerateBudget === true) return "entitled";
    if (plan === "PRO" || plan === "ENTERPRISE") return "entitled";
    if (plan === "BASIC") return "upgradeable";
    return "error";
  } catch {
    return "error";
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

const STRATEGY_FACT_SOURCE_LABEL: Record<string, string> = {
  quote: "方案输入",
  project: "项目登记",
  notes: "需求文本",
};
const FOCUS_ROLE_LABEL: Record<string, string> = {
  primary: "为主",
  secondary: "为辅",
  mentioned: "提及",
};
const EXPERIENCE_LEVEL_LABEL: Record<string, string> = {
  premium: "高端体验定位",
  standard: "标准配置定位",
};
const PRICE_BAND_LABEL: Record<string, string> = {
  low: "经济档",
  mid: "中档",
  high: "高档",
  custom: "自定义档位",
};
const SITE_TYPE_LABEL: Record<string, string> = {
  office: "办公楼",
  factory: "工厂",
  park: "园区",
  school: "学校",
  hospital: "医院",
  mixed: "综合场地",
};

function strategyFactSource(fact: StrategyFactView): string {
  if (fact.status !== "known" || !fact.source) return "";
  const label = STRATEGY_FACT_SOURCE_LABEL[fact.source];
  return label ? `（来源：${label}）` : "";
}

function describeStrategyNumberFact(fact: StrategyFactView | undefined, unit: string): string {
  if (!fact || fact.status !== "known" || typeof fact.value !== "number") return "待确认";
  return `${fact.value} ${unit}${strategyFactSource(fact)}`;
}

function describeStrategyBudgetFact(fact: StrategyFactView | undefined): string {
  if (!fact || fact.status !== "known") return "待确认";
  const parts = [
    typeof fact.amountYuan === "number" ? `${Math.round(fact.amountYuan / 10000)} 万元` : null,
    fact.label ? `项目档位「${fact.label}」` : null,
  ].filter(Boolean);
  return parts.length > 0 ? `${parts.join(" · ")}${strategyFactSource(fact)}` : "待确认";
}

function formatRange(range: [number, number] | undefined, unit: string): string | null {
  if (!Array.isArray(range) || range.length !== 2) return null;
  const [min, max] = range;
  if (typeof min !== "number" || typeof max !== "number") return null;
  return min === max ? `${min}${unit}` : `${min}–${max}${unit}`;
}

function nonEmptyStrings(list: unknown): string[] {
  return Array.isArray(list)
    ? list.filter((item): item is string => typeof item === "string" && item.trim() !== "")
    : [];
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
  const [error, setError] = useState("");
  const [proposal, setProposal] = useState<QuoteProposalView | null>(null);
  const [quoteId, setQuoteId] = useState("");
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [projectIntake, setProjectIntake] = useState<StoredProjectIntake | null>(null);
  const [budgetEntitlement, setBudgetEntitlement] =
    useState<BudgetEntitlementState>("loading");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [clarifyItems, setClarifyItems] = useState<ClarificationItem[] | null>(null);
  const [clarifyConflicts, setClarifyConflicts] = useState<string[]>([]);
  const [clarificationDraft, setClarificationDraft] =
    useState<ClarificationDraft>(EMPTY_CLARIFICATION_DRAFT);
  const [appliedClarification, setAppliedClarification] = useState<ClarificationValues>({});
  const [clarificationResolved, setClarificationResolved] = useState(false);
  const [quoteHistory, setQuoteHistory] = useState<QuoteHistoryItem[]>([]);
  const [historyPdfDownloadingId, setHistoryPdfDownloadingId] = useState("");
  const [piView, setPiView] = useState<ProductIntelligenceView | null>(null);
  const [piLoading, setPiLoading] = useState(false);
  const [piSaving, setPiSaving] = useState(false);
  const [piError, setPiError] = useState("");
  const [piNotice, setPiNotice] = useState("");
  const [piLocalWarnings, setPiLocalWarnings] = useState<string[]>([]);
  const [slotDrafts, setSlotDrafts] = useState<Record<string, SlotDraft>>({});
  const [initialSelectionJson, setInitialSelectionJson] = useState("[]");
  const [piStatus, setPiStatus] = useState<PiLoadStatus>("idle");
  const [piReloadToken, setPiReloadToken] = useState(0);
  const [requirementsAckQuoteId, setRequirementsAckQuoteId] = useState("");
  const [requirementsAckCheckedQuoteId, setRequirementsAckCheckedQuoteId] = useState("");
  const [strategyAckQuoteId, setStrategyAckQuoteId] = useState("");
  const [sessionUserId, setSessionUserId] = useState("");
  const [viewPanel, setViewPanel] = useState<{
    quoteId: string;
    panel: QuoteWorkflowPanel;
  } | null>(null);
  const hydratedProjectIdRef = useRef<string | null>(null);
  const proTier = getPricingTier("PRO");

  /**
   * F5 workflow UI state, keyed by quoteId. Acknowledgements are mirrored only to the dedicated
   * session ack store (userId + projectId + quoteId), never to product-commercial-context.
   */
  function clearWorkflowUiState() {
    setPiStatus("idle");
    setRequirementsAckQuoteId("");
    setRequirementsAckCheckedQuoteId("");
    setStrategyAckQuoteId("");
    setViewPanel(null);
  }

  /** Clears every piece of state derived from a specific project / quote. */
  function resetProjectScopedState(options?: { keepError?: boolean }) {
    setPiStatus("idle");
    setRequirementsAckQuoteId("");
    setRequirementsAckCheckedQuoteId("");
    setStrategyAckQuoteId("");
    setViewPanel(null);
    setQuoteId("");
    setProposal(null);
    setPdfDownloaded(false);
    setProjectIntake(null);
    setRevisionNotes("");
    setClarifyItems(null);
    setClarifyConflicts([]);
    setClarificationDraft(EMPTY_CLARIFICATION_DRAFT);
    setAppliedClarification({});
    setClarificationResolved(false);
    setQuoteHistory([]);
    setHistoryPdfDownloadingId("");
    setPiView(null);
    setPiError("");
    setPiNotice("");
    setPiLocalWarnings([]);
    setSlotDrafts({});
    setInitialSelectionJson("[]");
    setCompanyName("");
    setCompanyLocked(false);
    if (!options?.keepError) setError("");
  }

  function discardMismatchedQuote(
    mismatchedQuoteId: string,
    nextOrganizationId: string,
    nextProjectId: string,
  ) {
    clearStoredQuoteIdForProject(nextProjectId, mismatchedQuoteId);
    clearWorkflowUiState();
    setQuoteId("");
    setProposal(null);
    setPdfDownloaded(false);
    setPiView(null);
    setPiNotice("");
    setPiLocalWarnings([]);
    setSlotDrafts({});
    setInitialSelectionJson("[]");
    writeStoredProductContext(
      { organizationId: nextOrganizationId, projectId: nextProjectId },
      { mode: "replace" },
    );
    router.replace(
      productHref("/quote", {
        organizationId: nextOrganizationId,
        projectId: nextProjectId,
      }),
      { scroll: false },
    );
    setError("原方案不属于当前项目，已清除。请为当前项目重新生成方案。");
  }

  useEffect(() => {
    const qid = trimQuoteId(quoteId);
    const oid = organizationId.trim();
    const pid = projectId.trim();
    if (!qid || !oid || !pid) {
      setPiView(null);
      setPiStatus("idle");
      return;
    }
    let cancelled = false;
    setPiLoading(true);
    setPiStatus("loading");
    setPiError("");
    setPiView((prev) => (prev && prev.quoteId === qid ? prev : null));
    void fetchProductIntelligence(qid, oid, pid)
      .then((result) => {
        if (cancelled) return;
        if (result.kind === "mismatch") {
          discardMismatchedQuote(qid, oid, pid);
          return;
        }
        if (result.kind === "error") {
          setPiView(null);
          setPiStatus("error");
          return;
        }
        const view = result.view;
        setPiView(view);
        setPiStatus("success");
        const init = initialSlotDrafts(view);
        setSlotDrafts(init.drafts);
        setPiLocalWarnings(init.warnings);
        setInitialSelectionJson(
          JSON.stringify(buildSelectionPayload(view.slots, init.drafts)),
        );
      })
      .finally(() => {
        if (!cancelled) setPiLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // discardMismatchedQuote only uses stable setters/router.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, organizationId, projectId, piReloadToken]);

  useEffect(() => {
    const scope = { userId: sessionUserId, projectId, quoteId: trimQuoteId(quoteId) };
    const facts = { quoteId: scope.quoteId, piStatus, piView };
    if (!isQuoteReady(facts)) return;
    const restored = restoredWorkflowAckQuoteIds({
      scope,
      facts,
      record: readWorkflowAck(window.sessionStorage, scope),
    });
    if (restored.requirementsAckQuoteId) setRequirementsAckQuoteId(restored.requirementsAckQuoteId);
    if (restored.strategyAckQuoteId) setStrategyAckQuoteId(restored.strategyAckQuoteId);
  }, [sessionUserId, projectId, quoteId, piStatus, piView]);

  function updateSlotDraft(slotKey: string, patch: Partial<SlotDraft>) {
    setPiNotice("");
    setSlotDrafts((prev) => ({
      ...prev,
      [slotKey]: { ...(prev[slotKey] ?? { mode: "template", quantity: "" }), ...patch },
    }));
  }

  const currentQuoteAreaM2 = quoteHistory.find(
    (item) => item.id === trimQuoteId(quoteId),
  )?.areaM2;
  const areaConflict = describeQuoteProjectAreaConflict(
    projectIntake?.areaM2,
    currentQuoteAreaM2,
  );

  const selectionPayload = piView ? buildSelectionPayload(piView.slots, slotDrafts) : [];
  const selectionDirty = JSON.stringify(selectionPayload) !== initialSelectionJson;
  const draftQuantitiesValid = Object.values(slotDrafts).every(
    (d) =>
      isValidDraftQuantity(d.quantity) && priceDraftError(d) == null && customDraftError(d) == null,
  );

  /** Persists the full configuration (every slot) as a NEW Quote version — the only confirmation fact. */
  async function handleConfirmProductConfiguration() {
    const baseQuoteId = trimQuoteId(quoteId);
    const currentProjectId = projectId.trim();
    if (!baseQuoteId || !organizationId || !currentProjectId || !piView) return;
    if (piView.quoteId !== baseQuoteId || piView.slots.length === 0) return;
    const savedSelectionJson = JSON.stringify(selectionPayload);
    const confirmedSelections = withExplicitTemplateConfirmations(piView.slots, selectionPayload);
    setPiSaving(true);
    setPiError("");
    setPiNotice("");
    try {
      const res = await fetch("/api/quote/product-intelligence", {
        method: "POST",
        headers: orgHeaders(organizationId),
        body: JSON.stringify({
          quoteId: baseQuoteId,
          organizationId,
          projectId: currentProjectId,
          selections: confirmedSelections,
        }),
      });
      const data = (await res.json()) as GenerateQuoteResponse & { code?: string };
      if (res.status === 409 && data.code === QUOTE_PROJECT_MISMATCH_CODE) {
        discardMismatchedQuote(baseQuoteId, organizationId, currentProjectId);
        return;
      }
      const nextQuoteId =
        data.ok === true && data.status === "READY" ? trimQuoteId(data.quoteId) : "";
      if (!nextQuoteId || !data.proposal) {
        setPiError(data.message || "产品配置确认失败，请稍后重试");
        return;
      }
      const boundProjectId = data.projectId?.trim() || currentProjectId;
      setInitialSelectionJson(savedSelectionJson);
      setPiNotice("产品配置已确认，已保存为新方案版本");
      setViewPanel(null);
      setProposal(data.proposal);
      setQuoteId(nextQuoteId);
      setPdfDownloaded(false);
      writeStoredQuoteForProject(boundProjectId, nextQuoteId, data.proposal);
      writeStoredProductContext({
        organizationId,
        projectId: boundProjectId,
        quoteId: nextQuoteId,
      });
      // URL quoteId wins on hydrate; keep it on the saved version.
      router.replace(
        productHref("/quote", {
          organizationId,
          projectId: boundProjectId,
          quoteId: nextQuoteId,
        }),
        { scroll: false },
      );
      void refreshQuoteHistory(boundProjectId, organizationId);
    } catch {
      setPiError("产品配置确认失败，请稍后重试");
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
      const { organizationId, userId } = await resolveSessionIdentity();
      if (cancelled) return;
      setSessionUserId(userId);
      setOrganizationId(organizationId);
      if (!organizationId) {
        hydratedProjectIdRef.current = "";
        resetProjectScopedState();
        setProjectId("");
        setBudgetEntitlement("error");
        setContextReady(true);
        return;
      }

      // Budget entitlement: background only — must not block first paint.
      void loadBudgetEntitlement(organizationId).then((state) => {
        if (cancelled) return;
        setBudgetEntitlement(state);
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
      const resolvedQuoteId = ownedProjectId
        ? trimQuoteId(urlCtx.quoteId) ||
          trimQuoteId(ctx.quoteId) ||
          (!crmHandoff && ownedProjectId
            ? readStoredQuoteIdForProject(ownedProjectId)
            : "")
        : "";
      const projectChanged = hydratedProjectIdRef.current !== ownedProjectId;
      hydratedProjectIdRef.current = ownedProjectId;
      if (projectChanged || !resolvedQuoteId) {
        resetProjectScopedState({ keepError: !projectChanged });
      }
      setProjectId(ownedProjectId);
      if (ownedProjectId) {
        if (resolvedQuoteId) {
          const storedProposal = readStoredQuoteProposal(resolvedQuoteId);
          setQuoteId(resolvedQuoteId);
          setProposal(
            storedProposal ??
              stubProposalForRestore(resolvedName || (projectChanged ? "" : companyName)),
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

  async function handleGenerate(options?: {
    revision?: boolean;
    /** Set when the user confirms or skips clarification; bypasses analysis. */
    clarification?: ClarificationValues;
  }) {
    if (!companyName.trim()) {
      alert("请填写企业名称");
      return;
    }
    const isRevision = options?.revision === true;
    const clarificationDecided = options?.clarification !== undefined;
    const clarificationValues = options?.clarification ?? appliedClarification;
    if (quoteId.trim() && !isRevision) {
      return;
    }
    const requirementNotes = revisionNotes.trim();
    if (isRevision && !requirementNotes) {
      alert("请填写补充要求后再重新生成");
      return;
    }
    if (
      isRevision &&
      (piView?.selections.length ?? 0) > 0 &&
      !window.confirm(
        "当前方案已保存设备候选选择。按新要求重新生成的新版本不会带入这些选择，需要在新版本中重新选择；当前版本仍保留在方案历史中。是否继续？",
      )
    ) {
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
      if (!nextProjectId) {
        nextProjectId = await createOrgProject(organizationId, companyName.trim());
        // Bind now: clarification may pause before generation, and a second click must reuse it.
        setProjectId(nextProjectId);
      }
      // Never fall back to intake held in state: it may belong to a previous project.
      const intake = await fetchProjectIntake(nextProjectId, organizationId).catch(() => null);
      setProjectIntake(intake);
      if (!intake) {
        setError("项目信息加载失败，请刷新后重试");
        return;
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
      applyClarification(payload, clarificationValues);

      if (!isRevision && !clarificationDecided && !clarificationResolved) {
        const analysis = await requestRequirementAnalysis(payload, organizationId);
        if (analysis && analysis.items.length > 0) {
          setClarifyItems(analysis.items);
          setClarifyConflicts(analysis.conflicts);
          return;
        }
      }
      if (clarificationDecided) {
        setAppliedClarification(clarificationValues);
        setClarificationResolved(true);
        setClarifyItems(null);
        setClarifyConflicts([]);
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
        // A new Quote never inherits the previous version's PI view or workflow acknowledgements.
        setPiView(null);
        setPiNotice("");
        setPiLocalWarnings([]);
        setSlotDrafts({});
        setInitialSelectionJson("[]");
        clearWorkflowUiState();
        writeStoredQuoteForProject(boundProjectId, nextQuoteId, readyProposal);
        writeStoredProductContext({
          organizationId,
          projectId: boundProjectId,
          quoteId: nextQuoteId,
        });
        // URL quoteId wins on hydrate; refresh must stay on the new version.
        router.replace(
          productHref("/quote", {
            organizationId,
            projectId: boundProjectId,
            quoteId: nextQuoteId,
          }),
          { scroll: false },
        );
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

  const clarificationInvalid = (clarifyItems ?? []).some(
    (item) =>
      clarificationDraft[item.key].trim() !== "" &&
      parsePositiveInput(clarificationDraft[item.key]) == null,
  );
  const clarificationEntered: ClarificationValues = {};
  for (const item of clarifyItems ?? []) {
    const value = parsePositiveInput(clarificationDraft[item.key]);
    if (value != null) clarificationEntered[item.key] = value;
  }
  const canConfirmClarification =
    !clarificationInvalid && Object.keys(clarificationEntered).length > 0;

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
    contextReady && budgetEntitlement === "upgradeable" && hasProjectId;
  const budgetEntitled = budgetEntitlement === "entitled";

  const refreshBudgetEntitlement = async () => {
    setBudgetEntitlement(await loadBudgetEntitlement(organizationId));
  };
  const retryBudgetEntitlement = () => {
    setBudgetEntitlement("loading");
    void refreshBudgetEntitlement();
  };

  const budgetEntitlementStatus =
    budgetEntitlement === "loading" ? (
      <p className="text-sm text-zinc-500">正在确认套餐权限…</p>
    ) : budgetEntitlement === "error" ? (
      <div className="flex flex-wrap items-center gap-3 text-sm text-amber-300">
        <span>套餐权限确认失败，暂无法继续预算。</span>
        <button
          type="button"
          onClick={retryBudgetEntitlement}
          className="rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-100 hover:border-zinc-400"
        >
          重试
        </button>
      </div>
    ) : null;

  const currentQuoteId = trimQuoteId(quoteId);
  const workflowFacts = { quoteId: currentQuoteId, piStatus, piView };
  const quoteReady = isQuoteReady(workflowFacts);
  const productConfigConfirmed = isProductConfigConfirmed(workflowFacts);
  const workflowStage: QuoteWorkflowStage = deriveQuoteWorkflowStage({
    ...workflowFacts,
    projectId,
    requirementsAckQuoteId,
    strategyAckQuoteId,
  });
  const activePanel = resolveActivePanel(workflowStage, currentQuoteId, viewPanel);
  const requirementsToAck = quoteReady && piView ? requirementsNeedingAck(piView.requirements) : [];
  const requirementsAcknowledged =
    requirementsAckQuoteId === currentQuoteId || workflowStage === "ready_for_budget";
  const requirementsAckChecked =
    Boolean(currentQuoteId) && requirementsAckCheckedQuoteId === currentQuoteId;
  const configurationAnalysis = quoteReady ? piView?.configurationStrategy ?? null : null;
  const strategy = configurationAnalysis?.configurationStrategy ?? null;
  const missingCriticalInfo = (configurationAnalysis?.missingCriticalInfo ?? []).filter(
    (item) => typeof item.label === "string" && item.label.trim() !== "",
  );
  const confirmableSlotCount = quoteReady && piView ? piView.slots.length : 0;
  const stagePanel: QuoteWorkflowPanel | null =
    workflowStage === "ready_for_budget" ? null : workflowStage;
  const workflowCurrentKey = workflowStage === "ready_for_budget" ? "budget" : workflowStage;
  const workflowCurrentIndex = Math.max(
    0,
    QUOTE_WORKFLOW_STEPS.findIndex((s) => s.key === workflowCurrentKey),
  );
  const workflowCurrentLabel = QUOTE_WORKFLOW_STEPS[workflowCurrentIndex]?.label ?? "";
  /** An explicitly opened, already-completed panel (never the stage's own panel). */
  const reviewingPanel: QuoteWorkflowPanel | null =
    viewPanel &&
    viewPanel.quoteId === currentQuoteId &&
    viewPanel.panel === activePanel &&
    activePanel !== stagePanel
      ? activePanel
      : null;
  const budgetIsCurrent = workflowStage === "ready_for_budget" && reviewingPanel == null;
  const showBudgetStepCard = reviewingPanel == null;
  const summaryUsers = strategy?.facts?.headcount
    ? describeStrategyNumberFact(strategy.facts.headcount, "人")
    : projectIntake?.targetUsers
      ? `${projectIntake.targetUsers} 人`
      : "待确认";
  const summaryArea = strategy?.facts?.areaM2
    ? describeStrategyNumberFact(strategy.facts.areaM2, "㎡")
    : !areaConflict && projectIntake?.areaM2
      ? `${projectIntake.areaM2} ㎡`
      : "待确认";

  function persistWorkflowAck(patch: { requirementsAck?: true; strategyAck?: true }) {
    writeWorkflowAck(
      window.sessionStorage,
      { userId: sessionUserId, projectId, quoteId: currentQuoteId },
      patch,
    );
  }

  function handleAcknowledgeRequirements() {
    if (!quoteReady) return;
    if (requirementsToAck.length > 0 && !requirementsAcknowledged && !requirementsAckChecked) return;
    setRequirementsAckQuoteId(currentQuoteId);
    persistWorkflowAck({ requirementsAck: true });
    setViewPanel({ quoteId: currentQuoteId, panel: "strategy" });
  }

  function handleAcknowledgeStrategy() {
    if (!quoteReady || !requirementsAcknowledged) return;
    setStrategyAckQuoteId(currentQuoteId);
    persistWorkflowAck({ strategyAck: true });
    setViewPanel({ quoteId: currentQuoteId, panel: "products" });
  }

  const headerCopy = !currentQuoteId
    ? "填写企业信息，生成专业健身空间方案。"
    : workflowStage === "ready_for_budget"
      ? budgetEntitled
        ? "产品配置已确认。主要下一步：继续生成预算。"
        : budgetEntitlement === "upgradeable"
          ? "产品配置已确认。预算测算为专业版能力，升级后可继续。"
          : "产品配置已确认。"
      : !quoteReady
        ? "方案已生成，正在加载当前方案版本。"
        : workflowStage === "confirmation"
          ? "方案已生成。请先在第 2 步确认 AI 需求识别结果。"
          : workflowStage === "strategy"
            ? "需求识别结果已确认。请在第 3 步查看方案策略。"
            : "请在第 4 步确认产品配置；确认后才可进入预算。";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-emerald-400">交付路径：项目 → 方案 → 预算 → 投标 → 下载</p>
        <h1 className="mt-1 text-2xl font-bold">当前：方案</h1>
        <p className="text-sm text-zinc-400">{headerCopy}</p>
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
            onAlreadyEntitled={refreshBudgetEntitlement}
          />
        </div>
      ) : null}

      <ol className="flex flex-wrap gap-2 text-xs" aria-label="方案流程">
        {QUOTE_WORKFLOW_STEPS.map((step, index) => {
          const panel =
            step.key === "budget" || step.key === "delivery" ? null : step.key;
          const reachable = panel
            ? isPanelReachable(panel, workflowStage)
            : step.key === "budget" && productConfigConfirmed;
          const isCurrent = index === workflowCurrentIndex;
          const completed = index < workflowCurrentIndex;
          const reviewing = panel != null && panel === reviewingPanel;
          const label = `${index + 1} ${step.label}${completed ? " ✓" : ""}${reviewing ? "（查看中）" : ""}`;
          const className = isCurrent
            ? "rounded-lg border border-emerald-500 px-3 py-1.5 font-medium text-emerald-300"
            : reviewing
              ? "rounded-lg border border-sky-500 px-3 py-1.5 font-medium text-sky-300"
              : completed && reachable
                ? "rounded-lg border border-zinc-700 px-3 py-1.5 text-emerald-200/80 hover:border-zinc-500"
                : "rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-600";
          return (
            <li key={step.key}>
              {isCurrent ? (
                reviewingPanel ? (
                  <button
                    type="button"
                    className={className}
                    aria-current="step"
                    onClick={() => setViewPanel(null)}
                  >
                    {label}
                  </button>
                ) : (
                  <span className={className} aria-current="step">
                    {label}
                  </span>
                )
              ) : panel && reachable && !reviewing ? (
                <button
                  type="button"
                  className={className}
                  onClick={() => setViewPanel({ quoteId: currentQuoteId, panel })}
                >
                  {label}
                </button>
              ) : (
                <span className={className}>{label}</span>
              )}
            </li>
          );
        })}
      </ol>

      {reviewingPanel ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-sky-800/60 bg-sky-950/20 px-4 py-2 text-sm text-sky-200">
          <span>正在查看已完成的步骤（查看中），内容按当前方案版本展示。</span>
          <button
            type="button"
            onClick={() => setViewPanel(null)}
            className="rounded-lg border border-sky-700 px-3 py-1 text-xs text-sky-100 hover:border-sky-500"
          >
            返回当前步骤：第 {workflowCurrentIndex + 1} 步 {workflowCurrentLabel}
          </button>
        </div>
      ) : null}

      {activePanel === "requirements" ? (
      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">第 1 步：项目需求</h2>
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
                  !areaConflict && projectIntake.areaM2 ? `${projectIntake.areaM2} ㎡` : null,
                  projectIntake.city?.trim() || null,
                  projectIntake.industry?.trim() || null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "项目参数已绑定"}
              </p>
            ) : null}
            {areaConflict ? (
              <p className="text-xs text-amber-300">
                {areaConflict}（本方案版本的 PDF 与预算按方案面积测算；项目登记未自动修改）
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
        {!quoteId && clarifyItems ? (
          <div className="space-y-4 rounded-lg border border-amber-700/50 bg-black p-4">
            <div>
              <p className="text-sm font-medium text-zinc-100">生成前请补充以下关键信息</p>
              <p className="mt-1 text-xs text-zinc-500">
                未补充的信息将在方案中标注为待确认，不会使用默认值。
              </p>
            </div>
            {clarifyConflicts.map((conflict) => (
              <p key={conflict} className="text-xs text-amber-300">
                {conflict}
              </p>
            ))}
            {clarifyItems.map((item) => (
              <label key={item.key} className="block space-y-1">
                <span className="text-sm text-zinc-200">{item.label}</span>
                <span className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    className="w-40 rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
                    placeholder={CLARIFICATION_INPUT[item.key].placeholder}
                    value={clarificationDraft[item.key]}
                    onChange={(e) =>
                      setClarificationDraft((prev) => ({ ...prev, [item.key]: e.target.value }))
                    }
                    disabled={loading}
                  />
                  <span className="text-sm text-zinc-400">
                    {CLARIFICATION_INPUT[item.key].unit}
                  </span>
                </span>
                {item.impact ? (
                  <span className="block text-xs text-zinc-500">{item.impact}</span>
                ) : null}
              </label>
            ))}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleGenerate({ clarification: clarificationEntered })}
                disabled={loading || !contextReady || !canConfirmClarification}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
              >
                {loading ? "生成中…" : "补充并生成方案"}
              </button>
              <button
                type="button"
                onClick={() => void handleGenerate({ clarification: {} })}
                disabled={loading || !contextReady}
                className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-100 hover:border-zinc-400 disabled:opacity-50"
              >
                暂不补充，按待确认生成
              </button>
            </div>
          </div>
        ) : !quoteId ? (
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || !contextReady}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "生成中…" : "提交需求并生成方案"}
          </button>
        ) : (
          <p className="text-sm text-zinc-400">
            已基于以上项目信息生成方案。如需修改需求，请在第 2 步使用「按补充要求修改」。
          </p>
        )}
      </section>
      ) : null}

      {activePanel !== "requirements" && currentQuoteId && !quoteReady ? (
        <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          {piStatus === "error" ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-amber-300">
              <span>当前方案版本的需求识别与配置加载失败，暂无法继续后续步骤。</span>
              <button
                type="button"
                onClick={() => setPiReloadToken((n) => n + 1)}
                className="rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-100 hover:border-zinc-400"
              >
                重试
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">正在加载当前方案版本…</p>
          )}
        </section>
      ) : null}

      {activePanel === "confirmation" && quoteReady && piView ? (
        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">第 2 步：AI 需求确认</h2>
            <p className="mt-1 text-xs text-zinc-500">
              按确定规则识别，仅供参考，不影响方案生成。确认仅表示您已知悉以下识别结果，不代表待确认事项已被自动解决。
            </p>
          </div>
          {missingCriticalInfo.length > 0 ? (
            <div className="space-y-1 rounded-lg border border-amber-800/60 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
              <p className="font-medium">以下关键信息缺失，方案中按待确认处理：</p>
              <ul className="list-disc space-y-1 pl-5">
                {missingCriticalInfo.map((item) => (
                  <li key={item.key ?? item.label}>
                    {item.label}
                    {item.impact ? `：${item.impact}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {piView.requirements.length > 0 ? (
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
          ) : (
            <p className="text-sm text-zinc-400">未从需求文本中识别出需逐条确认的条目。</p>
          )}
          {requirementsToAck.length > 0 && !requirementsAcknowledged ? (
            <label className="flex items-start gap-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="mt-1"
                checked={requirementsAckChecked}
                onChange={(e) =>
                  setRequirementsAckCheckedQuoteId(e.target.checked ? currentQuoteId : "")
                }
                disabled={loading}
              />
              <span>
                我已知悉以上 {requirementsToAck.length} 项需确认事项（待澄清 / 存在冲突 / 超出当前范围 / 有条件纳入）。这些事项不会被自动解决，方案中保持当前标注。
              </span>
            </label>
          ) : null}
          <button
            type="button"
            onClick={handleAcknowledgeRequirements}
            disabled={
              loading ||
              (requirementsToAck.length > 0 && !requirementsAcknowledged && !requirementsAckChecked)
            }
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            确认以上识别结果，继续方案策略
          </button>
          <div className="space-y-3 border-t border-zinc-800 pt-4">
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
            <p className="text-xs text-zinc-500">
              修改后会生成新的方案版本，并回到本步骤重新确认；当前版本保留在方案历史中。
            </p>
            <button
              type="button"
              onClick={() => void handleGenerate({ revision: true })}
              disabled={loading || !contextReady || !revisionNotes.trim()}
              className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-100 hover:border-zinc-400 disabled:opacity-50"
            >
              {loading ? "重新生成中…" : "按补充要求修改"}
            </button>
          </div>
        </section>
      ) : null}

      {activePanel === "strategy" && quoteReady && piView ? (
        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">第 3 步：方案策略</h2>
            <p className="mt-1 text-xs text-zinc-500">
              以下为本方案版本生成时保存的配置策略与器材类别；具体品牌型号在第 4 步选择。
            </p>
          </div>
          {strategy ? (
            <div className="space-y-4 text-sm text-zinc-300">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-zinc-500">使用人数</dt>
                  <dd>{describeStrategyNumberFact(strategy.facts?.headcount, "人")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">场地面积</dt>
                  <dd>{describeStrategyNumberFact(strategy.facts?.areaM2, "㎡")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">预算</dt>
                  <dd>{describeStrategyBudgetFact(strategy.facts?.budget)}</dd>
                </div>
                {strategy.facts?.siteType ? (
                  <div>
                    <dt className="text-xs text-zinc-500">场地类型</dt>
                    <dd>{SITE_TYPE_LABEL[strategy.facts.siteType] ?? strategy.facts.siteType}</dd>
                  </div>
                ) : null}
                {strategy.facts?.priceBand ? (
                  <div>
                    <dt className="text-xs text-zinc-500">配置档位</dt>
                    <dd>{PRICE_BAND_LABEL[strategy.facts.priceBand] ?? strategy.facts.priceBand}</dd>
                  </div>
                ) : null}
                {strategy.experience?.level && EXPERIENCE_LEVEL_LABEL[strategy.experience.level] ? (
                  <div>
                    <dt className="text-xs text-zinc-500">体验定位</dt>
                    <dd>{EXPERIENCE_LEVEL_LABEL[strategy.experience.level]}</dd>
                  </div>
                ) : null}
              </dl>
              {(strategy.focus?.signals ?? []).some((s) => s.label) ? (
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">训练侧重</p>
                  <p>
                    {(strategy.focus?.signals ?? [])
                      .filter((s) => s.label)
                      .map((s) =>
                        s.role && FOCUS_ROLE_LABEL[s.role]
                          ? `${s.label}（${FOCUS_ROLE_LABEL[s.role]}）`
                          : s.label,
                      )
                      .join("、")}
                  </p>
                </div>
              ) : null}
              {(strategy.zoning ?? []).some((z) => z.zone) ? (
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">分区策略</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {(strategy.zoning ?? [])
                      .filter((z) => z.zone)
                      .map((z) => (
                        <li key={z.zone}>
                          {[
                            z.zone,
                            formatRange(z.sharePct, "%"),
                            formatRange(z.areaM2, "㎡"),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}
              <StrategyList title="配置指导" items={nonEmptyStrings(strategy.guidance)} />
              <StrategyList title="场地与实施约束" items={nonEmptyStrings(strategy.constraints)} />
              <StrategyList title="需确认的冲突" items={nonEmptyStrings(strategy.conflicts)} />
              <StrategyList
                title="策略与器材配置的关系"
                items={nonEmptyStrings(strategy.downstreamNotes)}
              />
            </div>
          ) : (
            <p className="text-sm text-amber-300">
              该方案版本没有保存结构化策略数据（较早版本生成），以下仅展示器材类别与 AI 建议数量；如需完整策略，可在第 2 步按补充要求重新生成。
            </p>
          )}
          <div className="space-y-1 text-sm text-zinc-300">
            <p className="text-xs text-zinc-500">AI 建议配置（建议数量，非最终采购数量）</p>
            <p className="text-xs text-zinc-500">
              建议数量由方案生成规则按本版本的项目输入推算（见上方使用人数 / 面积及来源），可在第 4 步调整，以确认后的方案版本为准。
            </p>
            {piView.slots.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {piView.slots.map((slot) => (
                  <li key={slot.slotKey}>
                    {slot.category} · {slot.subCategory} · AI 建议数量 {slot.templateQuantity} 台/套
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-amber-300">当前方案暂无可配置的有氧 / 力量设备位。</p>
            )}
          </div>
          {proposal ? (
            <div className="space-y-2 rounded-lg border border-zinc-800 bg-black p-4">
              <p className="text-sm font-medium text-zinc-200">方案结果摘要</p>
              <p className="text-sm leading-relaxed text-zinc-300">
                {buildCustomerSummary(proposal, companyName)}
              </p>
              <button
                type="button"
                onClick={() => void handleDownloadPdf()}
                className="rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-100 hover:border-zinc-400"
              >
                下载方案 PDF
              </button>
              {pdfDownloaded ? (
                <p className="text-sm text-emerald-300">方案 PDF 已下载。</p>
              ) : null}
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleAcknowledgeStrategy}
            disabled={loading || !requirementsAcknowledged}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            确认方案策略，继续产品配置
          </button>
        </section>
      ) : null}

      {activePanel === "products" && !budgetIsCurrent && quoteReady && piView ? (
        <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">第 4 步：产品配置</h2>
          {piView ? (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-zinc-200">设备候选配置（有氧 / 力量）</p>
                <p className="text-xs text-zinc-500">
                  候选来自当前参考目录，标注「参考候选 / 未核实」；型号参数与价格均未核实，不代表采购承诺。
                </p>
                <p className="text-xs text-zinc-500">
                  参考目录中没有的产品，可选择「客户指定产品」并填写品牌与型号，标注「客户指定 / 参数未核实」；它不属于参考目录，产品参数同样未核实。
                </p>
                <p className="text-xs text-zinc-500">
                  预算单价默认按预算档位估算，仅在为已选候选或客户指定产品填写供应商报价或采购合同的核实单价后按核实价计价。
                </p>
                {piView.slots.length === 0 ? (
                  <p className="text-sm text-amber-300">
                    当前方案暂无可确认的设备配置，请调整需求或重新生成方案。
                  </p>
                ) : null}
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
                  const saved = savedSlotQuantity(
                    slot,
                    piView.selections.find((s) => s.slotKey === slot.slotKey),
                  );
                  return (
                    <li
                      key={slot.slotKey}
                      className="space-y-2 rounded-lg border border-zinc-800 bg-black px-4 py-3"
                    >
                      <p className="text-sm font-medium text-zinc-100">
                        {slot.category} · {slot.subCategory}
                      </p>
                      <p className="text-xs text-zinc-400">
                        AI 建议数量 {slot.templateQuantity} 台/套 · 当前方案数量{" "}
                        {saved.quantity != null
                          ? `${saved.quantity} 台/套（${saved.status}）`
                          : `—（${saved.status}）`}
                      </p>
                      <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input
                          type="radio"
                          name={groupName}
                          checked={draft.mode === "template"}
                          onChange={() =>
                            updateSlotDraft(slot.slotKey, {
                              mode: "template",
                              candidateId: undefined,
                              ...EMPTY_PRICE_DRAFT,
                            })
                          }
                          disabled={piSaving}
                        />
                        保留 AI 建议配置
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
                                  ...EMPTY_PRICE_DRAFT,
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
                      <label className="flex items-start gap-2 rounded-md border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
                        <input
                          type="radio"
                          className="mt-1"
                          name={groupName}
                          checked={draft.mode === "custom"}
                          onChange={() =>
                            updateSlotDraft(slot.slotKey, {
                              mode: "custom",
                              candidateId: undefined,
                              ...EMPTY_PRICE_DRAFT,
                            })
                          }
                          disabled={piSaving}
                        />
                        <span className="space-y-1">
                          <span className="block">
                            客户指定产品（不在参考目录中）
                            <span className="ml-2 rounded border border-sky-700 px-1.5 py-0.5 text-xs text-sky-300">
                              {CUSTOMER_SPECIFIED_BADGE}
                            </span>
                          </span>
                          <span className="block text-xs text-zinc-400">
                            品牌与型号由客户提供；产品参数、供货与售后能力需向供应商核实。
                          </span>
                        </span>
                      </label>
                      {draft.mode === "custom" ? (
                        <div className="space-y-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              maxLength={MAX_CUSTOM_PRODUCT_FIELD_LENGTH}
                              className="w-44 rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              placeholder="品牌（必填）"
                              value={draft.customBrand ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, { customBrand: e.target.value })
                              }
                              disabled={piSaving}
                            />
                            <input
                              type="text"
                              maxLength={MAX_CUSTOM_PRODUCT_FIELD_LENGTH}
                              className="w-44 rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              placeholder="型号（必填）"
                              value={draft.customModel ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, { customModel: e.target.value })
                              }
                              disabled={piSaving}
                            />
                          </div>
                          {customDraftError(draft) ? (
                            <p className="text-rose-300">{customDraftError(draft)}</p>
                          ) : null}
                        </div>
                      ) : null}
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
                              ...EMPTY_PRICE_DRAFT,
                            })
                          }
                          disabled={piSaving}
                        />
                        从当前方案候选配置中移除
                      </label>
                      {draft.mode !== "remove" ? (
                        <label className="flex items-center gap-2 text-xs text-zinc-400">
                          确认数量（留空则采用 AI 建议数量）
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
                          {!isValidDraftQuantity(draft.quantity) ? (
                            <span className="text-rose-300">需为 1-999 的整数</span>
                          ) : null}
                        </label>
                      ) : null}
                      {draftHasProduct(draft) ? (
                        <div className="space-y-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-400">
                          <p>
                            核实单价（可选）：仅在已取得供应商报价或采购合同时填写；未填写则按预算档位估算。核实单价、来源类型、来源编号和报价日期为必填；供应商、含税状态和有效期可选，仅记录报价来源信息，不代表对供应商的认证。
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-32 rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              placeholder="单价（元/台）"
                              value={draft.unitPrice ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, { unitPrice: e.target.value })
                              }
                              disabled={piSaving}
                            />
                            <select
                              className="rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              value={draft.priceSourceType ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, {
                                  priceSourceType: e.target.value as PriceFactSourceType | "",
                                })
                              }
                              disabled={piSaving}
                            >
                              <option value="">价格来源类型</option>
                              {PRICE_SOURCE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              maxLength={200}
                              className="w-44 rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              placeholder="报价单号 / 合同号"
                              value={draft.priceSourceReference ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, {
                                  priceSourceReference: e.target.value,
                                })
                              }
                              disabled={piSaving}
                            />
                            <input
                              type="date"
                              className="rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              value={draft.priceQuotedAt ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, { priceQuotedAt: e.target.value })
                              }
                              disabled={piSaving}
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              maxLength={MAX_PRICE_SUPPLIER_LENGTH}
                              className="w-56 rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              placeholder="报价供应商（可选）"
                              value={draft.priceSupplier ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, { priceSupplier: e.target.value })
                              }
                              disabled={piSaving}
                            />
                            <select
                              className="rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                              value={draft.priceTaxStatus ?? ""}
                              onChange={(e) =>
                                updateSlotDraft(slot.slotKey, {
                                  priceTaxStatus: e.target.value as PriceFactTaxStatus | "",
                                })
                              }
                              disabled={piSaving}
                            >
                              <option value="">含税状态：未注明</option>
                              {PRICE_TAX_STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                            <label className="flex items-center gap-1">
                              有效期至（可选）
                              <input
                                type="date"
                                className="rounded border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100"
                                value={draft.priceValidUntil ?? ""}
                                onChange={(e) =>
                                  updateSlotDraft(slot.slotKey, { priceValidUntil: e.target.value })
                                }
                                disabled={piSaving}
                              />
                            </label>
                          </div>
                          {priceDraftError(draft) ? (
                            <p className="text-rose-300">{priceDraftError(draft)}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2">
                {productConfigConfirmed && !selectionDirty ? (
                  <p className="text-sm text-emerald-300">
                    当前方案版本的产品配置已确认（{piView.selections.length} 个设备位）。如需调整，修改后再次确认即可生成新的方案版本。
                  </p>
                ) : null}
                {confirmableSlotCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void handleConfirmProductConfiguration()}
                    disabled={
                      piSaving ||
                      piLoading ||
                      loading ||
                      !draftQuantitiesValid ||
                      (productConfigConfirmed && !selectionDirty)
                    }
                    className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {piSaving ? "确认中…" : "确认产品配置"}
                  </button>
                ) : null}
                <p className="text-xs text-zinc-500">
                  确认后保存为新的方案版本（未选择候选的设备位按「保留 AI 建议配置」确认），当前及历史版本保持不变；此操作仅确认方案配置，不代表确认采购。
                </p>
                {piNotice ? <p className="text-sm text-emerald-300">{piNotice}</p> : null}
                {piError ? <p className="text-sm text-rose-300">{piError}</p> : null}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {budgetIsCurrent && quoteReady && piView ? (
        <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">
          <h2 className="text-base font-semibold text-zinc-100">已完成步骤</h2>
          <ul className="space-y-3">
            <li className="flex flex-wrap items-start justify-between gap-2">
              <span>
                <span className="text-zinc-500">1 项目需求 ✓ </span>
                {companyName.trim() || "企业"} · 使用人数 {summaryUsers} · 场地面积 {summaryArea}
              </span>
              <button
                type="button"
                onClick={() => setViewPanel({ quoteId: currentQuoteId, panel: "requirements" })}
                className="text-xs text-zinc-400 underline hover:text-zinc-200"
              >
                查看
              </button>
            </li>
            <li className="flex flex-wrap items-start justify-between gap-2">
              <span>
                <span className="text-zinc-500">2 AI 需求确认 ✓ </span>
                已识别 {piView.requirements.length} 项需求条目
              </span>
              <button
                type="button"
                onClick={() => setViewPanel({ quoteId: currentQuoteId, panel: "confirmation" })}
                className="text-xs text-zinc-400 underline hover:text-zinc-200"
              >
                查看
              </button>
            </li>
            <li className="flex flex-wrap items-start justify-between gap-2">
              <span>
                <span className="text-zinc-500">3 方案策略 ✓ </span>
                AI 建议配置 {piView.slots.length} 个设备位
              </span>
              <button
                type="button"
                onClick={() => setViewPanel({ quoteId: currentQuoteId, panel: "strategy" })}
                className="text-xs text-zinc-400 underline hover:text-zinc-200"
              >
                查看
              </button>
            </li>
            <li className="space-y-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span>
                  <span className="text-zinc-500">4 产品配置 ✓ </span>
                  已确认 {piView.selections.length} 个设备位
                </span>
                <button
                  type="button"
                  onClick={() => setViewPanel({ quoteId: currentQuoteId, panel: "products" })}
                  className="text-xs text-zinc-400 underline hover:text-zinc-200"
                >
                  查看 / 修改
                </button>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-xs text-zinc-400">
                {piView.slots.map((slot) => {
                  const selection = piView.selections.find((s) => s.slotKey === slot.slotKey);
                  const saved = savedSlotQuantity(slot, selection);
                  const choice =
                    selection?.action === "remove"
                      ? "已移除"
                      : selection?.candidate
                        ? `${selection.candidate.brand} ${selection.candidate.model}${
                            selection.candidate.source === CUSTOMER_SPECIFIED_SOURCE
                              ? `（${CUSTOMER_SPECIFIED_BADGE}）`
                              : ""
                          }`
                        : "沿用 AI 建议";
                  return (
                    <li key={slot.slotKey}>
                      {slot.subCategory} · {choice}
                      {saved.quantity != null ? ` · 当前方案数量 ${saved.quantity} 台/套` : ""}
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </section>
      ) : null}

      {showBudgetStepCard ? (
        <>
      {currentQuoteId && productConfigConfirmed ? (
        <section className="space-y-4 rounded-xl border border-emerald-800/60 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold text-zinc-100">第 5 步：预算</h2>
          <div className="space-y-2">
            <p className="text-sm text-zinc-300">
              产品配置已确认。完整方案详情请下载方案 PDF 查看
            </p>
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
            {budgetEntitled ? (
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
            ) : budgetEntitlement !== "upgradeable" ? (
              budgetEntitlementStatus
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
                  onAlreadyEntitled={refreshBudgetEntitlement}
                />
              </div>
            )}
            {pdfDownloaded && budgetEntitled ? (
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
            {pdfDownloaded && budgetEntitlement === "upgradeable" ? (
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
                    onAlreadyEntitled={refreshBudgetEntitlement}
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
        </section>
      ) : currentQuoteId ? (
        <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-lg font-semibold text-zinc-500">第 5 步：预算（未解锁）</h2>
          <p className="text-sm text-zinc-500">
            {quoteReady && confirmableSlotCount === 0
              ? "当前方案暂无可确认的设备配置，请调整需求或重新生成方案。"
              : "完成第 4 步「确认产品配置」并保存为方案版本后，才可进入预算。"}
          </p>
          {projectId ? (
            <Link
              href={`/projects/${encodeURIComponent(projectId)}`}
              className="inline-block text-sm text-zinc-400 underline hover:text-zinc-200"
            >
              ← 返回项目
            </Link>
          ) : null}
        </section>
      ) : null}
        </>
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

function StrategyList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs text-zinc-500">{title}</p>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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
