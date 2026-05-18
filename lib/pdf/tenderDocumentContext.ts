/**
 * V4 Tender Pack — 统一文档身份（tenderId / metadata / REQSIG / 版本）。
 * Plan、Budget、Merged Pack 必须共用同一 `TenderDocumentContext`，禁止各自派生 TF slug。
 */
import type { PDFDocument } from "pdf-lib";

import type { UserTier } from "@/lib/commercial/userTier";

export type TenderDeliveryMode = "free" | "pro" | "enterprise";

/** 全包统一身份（Single Tender Identity） */
export type TenderDocumentContext = {
  tenderId: string;
  projectId: string;
  planId: string;
  version: string;
  deliveryMode: TenderDeliveryMode;
  reqsig?: string;
  brand: string;
  deliverySystemLabel: string;
};

export const TENDER_DOC_VERSION = "V4 Tender Delivery";
export const TENDER_DOC_BRAND = "AI Fitness Solution";
export const TENDER_DOC_SYSTEM = "Tender Delivery System";
export const TENDER_DOC_PRODUCER = `${TENDER_DOC_BRAND} — ${TENDER_DOC_SYSTEM}`;
export const TENDER_DOC_CREATOR = TENDER_DOC_PRODUCER;

/** Budget 卷主标题（企业双卷体系 · 商务报价卷） */
export const TENDER_BUDGET_VOLUME_TITLE =
  "Tender Delivery · Commercial Pricing Volume";
export const TENDER_BUDGET_VOLUME_SUBTITLE =
  "（企业投标文件组成部分 · 与技术方案配套交付）";

export type TenderDocumentPart = "plan" | "budget" | "pack";

export function tierToDeliveryMode(tier: UserTier): TenderDeliveryMode {
  if (tier === "enterprise") return "enterprise";
  if (tier === "pro") return "pro";
  return "free";
}

/**
 * 稳定投标编号：`TF-{YYYY}-{####}`，同一 projectId + planId 始终相同。
 */
export function deriveTenderId(projectId: string, planId: string): string {
  const year = new Date().getFullYear();
  const key = `${String(projectId || "").trim()}::${String(planId || "").trim()}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const seq = (Math.abs(h) % 10000).toString().padStart(4, "0");
  return `TF-${year}-${seq}`;
}

export function buildTenderDocumentContext(params: {
  projectId: string;
  planId: string;
  deliveryMode?: TenderDeliveryMode;
  tier?: UserTier;
  reqsig?: string;
  version?: string;
}): TenderDocumentContext {
  const projectId = (params.projectId || "").trim() || "unknown-project";
  const planId = (params.planId || "").trim() || "attaguy-plan";
  const deliveryMode =
    params.deliveryMode ??
    (params.tier ? tierToDeliveryMode(params.tier) : "enterprise");

  return {
    tenderId: deriveTenderId(projectId, planId),
    projectId,
    planId,
    version: params.version ?? TENDER_DOC_VERSION,
    deliveryMode,
    reqsig: params.reqsig?.trim() || undefined,
    brand: TENDER_DOC_BRAND,
    deliverySystemLabel: TENDER_DOC_SYSTEM,
  };
}

export async function shortSigHex(payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 12);
}

/** 整包唯一 REQSIG（plan + budget + pack 共用） */
export async function computeTenderPackReqsig(
  ctx: TenderDocumentContext,
  extra?: Record<string, unknown>,
): Promise<string> {
  const payload = JSON.stringify({
    tenderId: ctx.tenderId,
    projectId: ctx.projectId,
    planId: ctx.planId,
    version: ctx.version,
    deliveryMode: ctx.deliveryMode,
    pack: "tender-v4",
    ...extra,
  });
  return shortSigHex(payload);
}

export function formatReqsigLine(reqsig: string | undefined): string | undefined {
  const s = String(reqsig ?? "").trim();
  if (!s) return undefined;
  return /^REQSIG:/i.test(s) ? s : `REQSIG: ${s}`;
}

/** Plan / Budget / Merged Pack 统一 PDF 元数据 */
export function applyTenderDocumentMetadata(
  doc: PDFDocument,
  ctx: TenderDocumentContext,
  reqsig: string,
  part: TenderDocumentPart = "pack",
): void {
  const sigLine = formatReqsigLine(reqsig) ?? reqsig;
  const partLabel =
    part === "plan"
      ? "Technical Proposal"
      : part === "budget"
        ? "Commercial & Pricing"
        : "Tender Pack";
  const title = `${ctx.brand} — ${partLabel} — ${ctx.tenderId}`;
  const subject = `${ctx.version} · ${ctx.deliveryMode} · ${partLabel}`;
  const keywords = [
    ctx.tenderId,
    ctx.projectId,
    ctx.planId,
    ctx.version,
    ctx.deliveryMode,
    partLabel,
    sigLine,
  ].filter(Boolean);

  try {
    doc.setTitle(title);
    doc.setAuthor(ctx.brand);
    doc.setSubject(subject);
    doc.setKeywords(keywords);
    doc.setProducer(TENDER_DOC_PRODUCER);
    doc.setCreator(TENDER_DOC_CREATOR);
  } catch (e) {
    console.warn("[TENDER_CTX] apply metadata failed", e);
  }
}

/** @deprecated 使用 applyTenderDocumentMetadata(..., "pack") */
export function applyTenderPackDocumentMetadata(
  doc: PDFDocument,
  ctx: TenderDocumentContext,
  reqsig: string,
): void {
  applyTenderDocumentMetadata(doc, ctx, reqsig, "pack");
}
