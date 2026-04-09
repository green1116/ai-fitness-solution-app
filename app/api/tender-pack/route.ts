// app/api/tender-pack/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import JSZip from "jszip";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { parseTenderLevel, type TenderLevel } from "@/lib/pdf/presets";
import { renderTenderCoverPdf } from "@/lib/pdf/cover";
import { logPdfDownloadSafe, getReqIp } from "@/lib/audit/pdfLog";
import { requireAndConsumeDownloadToken } from "@/lib/license";
import { DEFAULT_GYM_TECHNICAL_REQUIREMENTS } from "@/lib/pdf/tender/technical-response/presets";
import { buildTechnicalResponseRows } from "@/lib/pdf/tender/technical-response/buildTechnicalResponseRows";
import { renderTechnicalResponsePdf } from "@/lib/pdf/tender/renderTechnicalResponsePdf";
import type { TechnicalEvidenceBlock } from "@/lib/pdf/tender/types";
import { DEFAULT_GYM_BUSINESS_REQUIREMENTS } from "@/lib/pdf/tender/business-response/presets";
import { buildBusinessResponseRows } from "@/lib/pdf/tender/business-response/buildBusinessResponseRows";
import { renderBusinessResponsePdf } from "@/lib/pdf/tender/renderBusinessResponsePdf";
import { renderDeviationTablePdf } from "@/lib/pdf/tender/renderDeviationTablePdf";
import {
  buildBusinessResponseRefs,
  isDeviationLikeStatus,
  buildScoreRefs,
  buildTechnicalResponseRefs,
} from "@/lib/pdf/tender/refs/refBuilder";
import { withRefPrefix } from "@/lib/pdf/tender/refs/refFormat";
import { buildTenderNavMap, type TenderSectionStartPages } from "@/lib/pdf/tender/nav/pdfNavBuilder";
import { applyTenderNavLinks } from "@/lib/pdf/tender/nav/pdfNavApply";
import { mergeRefPageMaps, offsetRefPageMap, type TenderRefPageMap } from "@/lib/pdf/tender/nav/refPageMap";
import type { TenderNavRect } from "@/lib/pdf/tender/nav/pdfNavTypes";
import type { BusinessResponseRow, TechnicalResponseRow } from "@/lib/pdf/tender/types";
import { DEFAULT_GYM_SCORE_CRITERIA } from "@/lib/pdf/tender/score/presets";
import { buildScoreMappingRows } from "@/lib/pdf/tender/score/buildScoreMappingRows";
import { renderScoreMappingPdf } from "@/lib/pdf/tender/renderScoreMappingPdf";
import {
  buildDefaultTenderAttachmentIndexRows,
  mapAttachmentIndexRowsToRefs,
  type TenderAttachmentRefMap,
} from "@/lib/pdf/tender/attachmentIndex";
import { renderAttachmentIndexPagePdf } from "@/lib/pdf/tender/attachmentIndexPage";
import { buildTenderSectionPageRefsFromPackLayout } from "@/lib/pdf/tender/refs/pageRefs";
import type { TenderSectionPageRefs } from "@/lib/pdf/tender/refs/pageRefs";
import {
  buildDefaultTenderScoreMappings,
  mapScoreMappingToTenderRow,
} from "@/lib/pdf/tender/scoreMapping";
import { buildParsedTenderResult } from "@/lib/tender-parser/buildParsedTenderResult";
import {
  writeTenderResponses,
  type ParsedTenderClause,
} from "@/lib/tender/responseWriter";
import {
  summarizeTenderResponses,
  buildTenderResponseFootnote,
} from "@/lib/tender/summary";
import type {
  ParsedBusinessRequirement,
  ParsedScoreCriterion,
  ParsedTechnicalRequirement,
} from "@/lib/tender-parser/types";
import type {
  BusinessRequirement,
  ScoreCriterion,
  TechnicalStatus,
  TenderRequirement,
} from "@/lib/pdf/tender/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, code: string, message: string, extra?: any) {
  return NextResponse.json(
    { ok: false, code, message, ...(extra ? { extra } : {}) },
    { status }
  );
}

function asciiSafeFilename(s: string) {
  return (s || "file")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim()
    .slice(0, 120);
}

function isInternalPack(req: NextRequest) {
  const flag = (req.headers.get("x-internal-pack") || "").trim();
  const secret = (req.headers.get("x-internal-pack-secret") || "").trim();
  const expect = (process.env.INTERNAL_PACK_SECRET || "").trim();
  return flag === "1" && !!expect && secret === expect;
}

function isInternalRequest(req: NextRequest, searchParams: URLSearchParams) {
  return searchParams.get("internal") === "1" || isInternalPack(req);
}

function normFreezeYmd(v: string) {
  const s = (v || "").trim();
  return /^\d{8}$/.test(s) ? s : "";
}

function normFreezeTenderNo(v: string) {
  const s = (v || "").trim();
  if (!s) return "";
  if (s.length > 80) return "";
  if (!/^[A-Za-z0-9._-]+$/.test(s)) return "";
  return s;
}

function ymdTokyo() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const d = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}${m}${d}`;
}

function parseBool01(v: string | null, fallback: boolean) {
  const s = (v ?? "").trim();
  if (!s) return fallback;
  if (s === "0") return false;
  if (s === "1") return true;
  return fallback;
}

function budgetSectionsForPack(level: TenderLevel) {
  if (level === "saas") {
    return ["header", "overall", "table"].join(",");
  }
  if (level === "enterprise") {
    return [
      "header",
      "overall",
      "table",
      "pricing_terms",
      "delivery_terms",
      "payment_terms",
      "after_sales",
      "sign_seal",
    ].join(",");
  }
  return ["header", "overall", "table_lines", "table_items", "remarks"].join(",");
}

async function appendDocByCopy(
  merged: PDFDocument,
  buf: Uint8Array | Buffer
) {
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const pages = await merged.copyPages(src, src.getPageIndices());
  for (const p of pages) merged.addPage(p);
}

async function appendDocByCropRedraw(
  merged: PDFDocument,
  buf: Uint8Array | Buffer,
  cutBottom = 60
) {
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const srcPages = src.getPages();

  for (const srcPage of srcPages) {
    const { width, height } = srcPage.getSize();
    const newPage = merged.addPage([width, height]);
    const embeddedPage = await merged.embedPage(srcPage);

    newPage.drawPage(embeddedPage, {
      x: 0,
      y: cutBottom,
      width,
      height: height - cutBottom,
    });
  }
}

const PACK_CROP_BOTTOM = 60;

type MergePart = {
  name: string;
  buf: Uint8Array | Buffer;
  mode: "copy" | "crop";
  cutBottom?: number;
};

async function mergePdfBuffers(opts: {
  parts: MergePart[];
}): Promise<Buffer> {
  const merged = await PDFDocument.create();
  console.log(
    "[mergePdfBuffers]",
    opts.parts.map((p, i) => `${i}:${p.name}:${p.mode}`).join(" | ")
  );
  for (const part of opts.parts) {
    if (part.mode === "copy") {
      await appendDocByCopy(merged, part.buf);
    } else {
      await appendDocByCropRedraw(
        merged,
        part.buf,
        part.cutBottom ?? PACK_CROP_BOTTOM
      );
    }
  }
  return Buffer.from(await merged.save({ useObjectStreams: true }));
}

function getPackFontPath() {
  return path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
}

function readPackFontBytes() {
  const fontPath = getPackFontPath();
  if (!fs.existsSync(fontPath)) {
    throw new Error(`PACK_FOOTER_FONT_NOT_FOUND: ${fontPath}`);
  }
  return fs.readFileSync(fontPath);
}

async function embedPackFont(doc: PDFDocument) {
  doc.registerFontkit(fontkit);
  return await doc.embedFont(readPackFontBytes(), { subset: true });
}

type GovSectionInput = {
  planId: string;
  companyName?: string;
  projectName?: string;
  tenderNo?: string;
  issueDate?: string;
};

type GovTocEntry = {
  id: string;
  title: string;
  startPage: number;
};

type GovTocPdfResult = {
  bytes: Uint8Array;
  linkRects: TenderNavRect[];
};

function drawParagraphLines(
  page: any,
  font: any,
  lines: string[],
  x: number,
  startY: number,
  size = 11,
  step = 18
) {
  let y = startY;
  for (const line of lines) {
    page.drawText(line, {
      x,
      y,
      size,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= step;
  }
  return y;
}

async function buildGovSectionShellPdf(opts: {
  title: string;
  subtitle?: string;
  blocks?: string[];
  input: GovSectionInput;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await embedPackFont(pdf);
  const { width, height } = page.getSize();
  const M = 56;

  page.drawText(opts.title, {
    x: M,
    y: height - 72,
    size: 20,
    font,
    color: rgb(0.12, 0.12, 0.12),
  });

  if (opts.subtitle) {
    page.drawText(opts.subtitle, {
      x: M,
      y: height - 98,
      size: 10,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });
  }

  let y = height - 140;
  const metaLines = [
    `项目名称：${opts.input.projectName || "-"}`,
    `投标编号：${opts.input.tenderNo || "-"}`,
    `投标单位：${opts.input.companyName || "-"}`,
    `方案编号：${opts.input.planId || "-"}`,
    `日期：${opts.input.issueDate || "-"}`,
  ];

  y = drawParagraphLines(page, font, metaLines, M, y, 11, 20);
  y -= 10;

  for (const block of opts.blocks || []) {
    const lines = String(block).split("\n");
    y = drawParagraphLines(page, font, lines, M, y, 11, 18);
    y -= 14;
  }

  page.drawLine({
    start: { x: M, y: 72 },
    end: { x: width - M, y: 72 },
    thickness: 0.8,
    color: rgb(0.86, 0.86, 0.86),
  });

  return await pdf.save();
}

async function buildBidLetterPdf(input: GovSectionInput): Promise<Uint8Array> {
  return buildGovSectionShellPdf({
    title: "投标函与响应声明",
    subtitle: "Government Review V2",
    input,
    blocks: [
      "致：招标人/采购人",
      "我方已认真研究招标文件及相关资料，愿意按照招标文件要求参加本项目投标。",
      "我方承诺：所提交文件真实、完整、有效，并对响应内容承担相应责任。",
      "我方同意在中标后按约定完成供货、实施、培训及交付工作。",
      "",
      "投标单位（盖章）：",
      "法定代表人或授权代表：",
    ],
  });
}

function buildBusinessEvidenceBlocks(): TechnicalEvidenceBlock[] {
  return [
    {
      key: "budget.pricing_terms",
      title: "报价说明",
      category: "budget",
      text: "报价口径、配置依据与预算说明。",
      sectionId: "pricing_terms",
      pageLabel: "预算与报价相关页",
      tags: ["报价", "报价说明", "报价依据"],
    },
    {
      key: "budget.payment_terms",
      title: "付款条款",
      category: "budget",
      text: "付款方式与结算安排。",
      sectionId: "payment_terms",
      pageLabel: "预算与报价相关页",
      tags: ["付款方式", "结算", "支付"],
    },
    {
      key: "budget.delivery_terms",
      title: "交付条款",
      category: "budget",
      text: "交付周期与实施安排说明。",
      sectionId: "delivery_terms",
      pageLabel: "预算与报价相关页",
      tags: ["交付周期", "交付安排", "实施周期"],
    },
    {
      key: "budget.after_sales",
      title: "售后服务条款",
      category: "service",
      text: "售后维保与保障措施。",
      sectionId: "after_sales",
      pageLabel: "预算与报价相关页",
      tags: ["售后服务", "维保", "保障"],
    },
    {
      key: "budget.table",
      title: "预算配置表",
      category: "budget",
      text: "配置明细、数量及预算区间。",
      sectionId: "table",
      pageLabel: "预算与报价相关页",
      tags: ["配置明细", "预算", "设备清单"],
    },
  ];
}

function toTenderRequirement(
  item: ParsedTechnicalRequirement,
  idx: number
): TenderRequirement {
  return {
    id: item.id || `TR-PARSED-${String(idx + 1).padStart(3, "0")}`,
    chapter: item.sectionTitle || undefined,
    category: item.requirementType || "other",
    text: item.text,
    requirementType: item.requirementType || "other",
    priority: item.priority || "must",
    keywords: item.keywords?.length ? item.keywords : [],
  };
}

function toBusinessRequirement(
  item: ParsedBusinessRequirement,
  idx: number
): BusinessRequirement {
  const requirementType: BusinessRequirement["requirementType"] =
    item.requirementType === "pricing" ||
    item.requirementType === "payment" ||
    item.requirementType === "delivery" ||
    item.requirementType === "service"
      ? item.requirementType
      : "other";

  return {
    id: item.id || `BR-PARSED-${String(idx + 1).padStart(3, "0")}`,
    text: item.text,
    requirementType,
    priority: item.priority || "must",
    keywords: item.keywords?.length ? item.keywords : [],
  };
}

function toScoreCriterion(
  item: ParsedScoreCriterion,
  idx: number
): ScoreCriterion {
  const category: ScoreCriterion["category"] =
    item.category === "technical" ||
    item.category === "business" ||
    item.category === "service" ||
    item.category === "implementation" ||
    item.category === "price"
      ? item.category
      : "other";

  return {
    id: item.id || `SC-PARSED-${String(idx + 1).padStart(3, "0")}`,
    scoreItem: item.scoreItem,
    criteria: item.criteria,
    keywords: item.keywords?.length ? item.keywords : [],
    category,
  };
}

function toTechnicalStatus(input: any): TechnicalStatus {
  const s = String(input || "").trim();

  switch (s) {
    case "满足":
    case "响应":
    case "待确认":
    case "部分满足":
    case "偏离":
    case "无此项":
      return s as TechnicalStatus;
    default:
      return "无此项";
  }
}

function buildBusinessRows(input?: {
  parsedBusinessRequirements?: ParsedBusinessRequirement[];
}): BusinessResponseRow[] {
  if (input?.parsedBusinessRequirements?.length) {
    const businessInput: ParsedTenderClause[] = input.parsedBusinessRequirements.map(
      (item: any, idx: number) => ({
        id: item.id || `biz-${idx + 1}`,
        kind: "business",
        section: item.section || item.sectionTitle || "商务条款",
        clauseNo: item.clauseNo || item.no || "",
        text: item.text || item.requirement || item.content || "",
      })
    );
    const writtenBusinessResponses = writeTenderResponses(businessInput);

    return writtenBusinessResponses.map((x, i) => ({
      id: x.id || `BWR-${String(i + 1).padStart(3, "0")}`,
      clause: x.requirement,
      response: x.response,
      status: toTechnicalStatus(x.status),
      matchedEvidenceKeys: [],
      confidence: x.risk === "high" ? 0.4 : x.risk === "medium" ? 0.65 : 0.85,
      note: x.remark,
    }));
  }

  const requirements =
    input?.parsedBusinessRequirements?.length
      ? input.parsedBusinessRequirements.map(toBusinessRequirement)
      : DEFAULT_GYM_BUSINESS_REQUIREMENTS;

  return buildBusinessResponseRows({
    requirements,
    evidenceBlocks: buildBusinessEvidenceBlocks(),
  });
}

function buildTechnicalEvidenceBlocks(input: GovSectionInput): TechnicalEvidenceBlock[] {
  return [
    {
      key: "plan.overall",
      title: "项目概述",
      category: "space",
      text: `${input.projectName || "企业健身房建设项目"}整体方案与功能分区规划。`,
      sectionId: "overall",
      pageLabel: "建设方案相关页",
      tags: ["空间规划", "有氧区", "力量区", "自由训练区"],
    },
    {
      key: "plan.implementation",
      title: "实施安排",
      category: "implementation",
      text: "实施步骤、交付安排与落地建议。",
      sectionId: "implementation",
      pageLabel: "建设方案相关页",
      tags: ["实施安排", "交付计划", "落地建议"],
    },
    {
      key: "plan.after_sales",
      title: "售后服务",
      category: "service",
      text: "售后服务、运维支持和后续保障机制。",
      sectionId: "after_sales",
      pageLabel: "建设方案相关页",
      tags: ["售后服务", "运维支持", "保障方案"],
    },
    {
      key: "budget.table",
      title: "预算配置表",
      category: "budget",
      text: "设备配置、数量与预算测算区间。",
      sectionId: "table",
      pageLabel: "预算与报价相关页",
      tags: ["设备清单", "配置明细", "预算"],
    },
  ];
}

function buildTechnicalRows(input: GovSectionInput & {
  parsedTechnicalRequirements?: ParsedTechnicalRequirement[];
}): TechnicalResponseRow[] {
  if (input.parsedTechnicalRequirements?.length) {
    const technicalInput: ParsedTenderClause[] = input.parsedTechnicalRequirements.map(
      (item: any, idx: number) => ({
        id: item.id || `tech-${idx + 1}`,
        kind: "technical",
        section: item.section || item.sectionTitle || "技术要求",
        clauseNo: item.clauseNo || item.no || "",
        text: item.text || item.requirement || item.content || "",
      })
    );
    const writtenTechnicalResponses = writeTenderResponses(technicalInput);

    return writtenTechnicalResponses.map((x, i) => ({
      id: x.id || `TWR-${String(i + 1).padStart(3, "0")}`,
      requirement: x.requirement,
      status: toTechnicalStatus(x.status),
      response: x.response,
      proof: x.clauseNo || x.section || "见对应投标附件",
      matchedEvidenceKeys: [],
      confidence: x.risk === "high" ? 0.4 : x.risk === "medium" ? 0.65 : 0.85,
      note: x.remark,
    }));
  }

  const requirements =
    input.parsedTechnicalRequirements?.length
      ? input.parsedTechnicalRequirements.map(toTenderRequirement)
      : DEFAULT_GYM_TECHNICAL_REQUIREMENTS;

  return buildTechnicalResponseRows({
    requirements,
    evidenceBlocks: buildTechnicalEvidenceBlocks(input),
  });
}

async function buildBusinessTermsResponsePdf(
  rows: Array<BusinessResponseRow & { refId?: string }>,
  attachmentRefs?: TenderAttachmentRefMap
): Promise<{ bytes: Uint8Array; refPageMap: TenderRefPageMap }> {
  console.log("[business-response] rows=", rows.length);
  const businessSummary = summarizeTenderResponses(
    rows.map((r) => ({
      status: r.status,
      requirement: r.clause,
      response: r.response,
      note: r.note,
    }))
  );
  const businessDigest = `本表共 ${businessSummary.total} 项：满足 ${businessSummary.satisfied} 项，响应 ${businessSummary.responded} 项，待确认 ${businessSummary.pending} 项，部分满足 ${businessSummary.partial} 项，偏离 ${businessSummary.deviated} 项。`;
  const businessFootnote = `${businessDigest} ${buildTenderResponseFootnote("business", businessSummary)}`;

  const rendered = await renderBusinessResponsePdf({
    title: "商务响应表",
    rows: rows.map((r, i) => ({
      no: String(i + 1),
      requirement: withRefPrefix(r.refId, r.clause),
      status: r.status || "无此项",
      response: r.response,
      note: r.note || "",
    })),
    footnote: businessFootnote,
    attachmentRefs,
  });
  console.log("[business-response] pages=", rendered.pageCount);
  return { bytes: rendered.bytes, refPageMap: rendered.refPageMap };
}

async function buildTechnicalResponsePdf(
  rows: Array<TechnicalResponseRow & { refId?: string }>,
  attachmentRefs?: TenderAttachmentRefMap
): Promise<{ bytes: Uint8Array; refPageMap: TenderRefPageMap }> {
  console.log("[technical-response] rows=", rows.length);
  const technicalSummary = summarizeTenderResponses(
    rows.map((r) => ({
      status: r.status,
      requirement: r.requirement,
      response: r.response,
      note: r.note,
    }))
  );
  const technicalDigest = `本表共 ${technicalSummary.total} 项：满足 ${technicalSummary.satisfied} 项，响应 ${technicalSummary.responded} 项，待确认 ${technicalSummary.pending} 项，部分满足 ${technicalSummary.partial} 项，偏离 ${technicalSummary.deviated} 项。`;
  const technicalFootnote = `${technicalDigest} ${buildTenderResponseFootnote("technical", technicalSummary)}`;

  const rendered = await renderTechnicalResponsePdf({
    title: "技术响应表",
    rows: rows.map((r, i) => ({
      no: String(i + 1),
      requirement: withRefPrefix(r.refId, r.requirement),
      status: r.status || "无此项",
      response: r.response,
      note: r.note || "",
    })),
    footnote: technicalFootnote,
    attachmentRefs,
  });
  console.log("[technical-response] pages=", rendered.pageCount);
  return { bytes: rendered.bytes, refPageMap: rendered.refPageMap };
}

async function buildBusinessDeviationPdf(
  rows: Array<BusinessResponseRow & { refId?: string }>,
  attachmentRefs?: TenderAttachmentRefMap
): Promise<Uint8Array> {
  const deviationRows = (rows || [])
    .filter((r) => isDeviationLikeStatus(r.status))
    .map((r) => ({
      refId: r.refId,
      clause: r.clause,
      status: r.status || "无此项",
      deviation: String(r.note || r.response || "").trim() || "请结合商务响应内容进一步核查。",
      adviceAttachments: "",
    }));

  const rendered = await renderDeviationTablePdf({
    title: "商务偏离表",
    scene: "business_deviation",
    rows: deviationRows,
    attachmentRefs,
  });
  console.log("[business-deviation] rows=", deviationRows.length, "pages=", rendered.pageCount);
  return rendered.bytes;
}

async function buildTechnicalDeviationPdf(
  rows: Array<TechnicalResponseRow & { refId?: string }>,
  attachmentRefs?: TenderAttachmentRefMap
): Promise<Uint8Array> {
  const deviationRows = (rows || [])
    .filter((r) => isDeviationLikeStatus(r.status))
    .map((r) => ({
      refId: r.refId,
      clause: r.requirement,
      status: r.status || "无此项",
      deviation: String(r.note || r.response || "").trim() || "请结合技术响应内容进一步核查。",
      adviceAttachments: "",
    }));

  const rendered = await renderDeviationTablePdf({
    title: "技术偏离表",
    scene: "technical_deviation",
    rows: deviationRows,
    attachmentRefs,
  });
  console.log("[technical-deviation] rows=", deviationRows.length, "pages=", rendered.pageCount);
  return rendered.bytes;
}

async function buildScoreMappingPdf(input: {
  technicalRows: Array<TechnicalResponseRow & { refId?: string }>;
  businessRows: Array<BusinessResponseRow & { refId?: string }>;
  parsedScoreCriteria?: ParsedScoreCriterion[];
  pageRefs?: TenderSectionPageRefs;
  attachmentRefs?: TenderAttachmentRefMap;
}): Promise<{
  bytes: Uint8Array;
  scoreRows: Array<{ scoreId?: string }>;
  refPageMap: TenderRefPageMap;
}> {
  const criteria =
    input.parsedScoreCriteria?.length
      ? input.parsedScoreCriteria.map(toScoreCriterion)
      : DEFAULT_GYM_SCORE_CRITERIA;

  const scoreRows = buildScoreMappingRows({
    criteria,
    technicalRows: input.technicalRows,
    businessRows: input.businessRows,
  });
  console.log("[score-mapping] rows=", scoreRows.length);

  const v2Rows =
    scoreRows.length > 0
      ? scoreRows.map(mapScoreMappingToTenderRow)
      : buildDefaultTenderScoreMappings();

  const techRefIds = input.technicalRows.map((r) => r.refId).filter(Boolean) as string[];
  const bizRefIds = input.businessRows.map((r) => r.refId).filter(Boolean) as string[];
  const scoredRows = buildScoreRefs(
    v2Rows.map((r) => {
      if (r.responseRefIds?.length) return r;
      const blob = `${r.scoreItem} ${r.responseSection} ${r.evidence}`;
      if (/技术|参数|设备|配置|系统/.test(blob)) {
        return { ...r, responseRefIds: techRefIds.slice(0, 4) };
      }
      if (/商务|售后|服务|交付|报价|预算|付款/.test(blob)) {
        return { ...r, responseRefIds: bizRefIds.slice(0, 4) };
      }
      return r;
    })
  );

  const rendered = await renderScoreMappingPdf({
    title: "评分项对照页",
    rows: scoredRows,
    pageRefs: input.pageRefs,
    attachmentRefs: input.attachmentRefs,
  });
  console.log("[score-mapping] pages=", rendered.pageCount);
  return {
    bytes: rendered.bytes,
    scoreRows: scoredRows,
    refPageMap: rendered.refPageMap,
  };
}

async function buildAttachmentIndexPdf(
  input: GovSectionInput,
  attachmentIndexRows = buildDefaultTenderAttachmentIndexRows()
): Promise<Uint8Array> {
  const rendered = await renderAttachmentIndexPagePdf({
    title: "附件索引页",
    subtitle: `项目：${input.projectName || "-"} · 投标单位：${input.companyName || "-"}`,
    rows: attachmentIndexRows,
  });
  return rendered.bytes;
}

/** 企业投标包 · brand 主题：目录中的「商务说明」单页 */
async function buildEnterpriseBrandBusinessNotePdf(
  input: GovSectionInput
): Promise<Uint8Array> {
  return buildGovSectionShellPdf({
    title: "商务说明",
    subtitle: "Enterprise Pack · Brand",
    input,
    blocks: [
      "本页为企业投标包（品牌主题）商务说明概要。",
      "报价范围、交付周期、付款与质保等以双方确认的版本为准。",
      "如需补充公司资质与案例，可在本页后随附件提供。",
    ],
  });
}

function resolveTocTargetKey(entryId: string) {
  switch (entryId) {
    case "score":
      return "score-page";
    case "technical-response":
      return "technical-response";
    case "business-terms-response":
      return "business-response";
    case "technical-deviation":
      return "technical-deviation";
    case "business-deviation":
      return "business-deviation";
    case "attachment-index":
      return "attachment-index";
    default:
      return "";
  }
}

function buildTenderSectionStartPages(entries: GovTocEntry[]): TenderSectionStartPages {
  const out: TenderSectionStartPages = {};
  for (const entry of entries || []) {
    switch (entry.id) {
      case "score":
        out.score = entry.startPage;
        break;
      case "technical-response":
        out.technicalResponse = entry.startPage;
        break;
      case "business-terms-response":
        out.businessResponse = entry.startPage;
        break;
      case "technical-deviation":
        out.technicalDeviation = entry.startPage;
        break;
      case "business-deviation":
        out.businessDeviation = entry.startPage;
        break;
      case "attachment-index":
        out.attachmentIndex = entry.startPage;
        break;
    }
  }
  return out;
}

async function buildGovernmentTocPdf(
  input: GovSectionInput,
  entries: GovTocEntry[],
  tocOpts?: { tocTitle?: string }
): Promise<GovTocPdfResult> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await embedPackFont(pdf);
  const { width, height } = page.getSize();
  const M = 56;

  const tocTitle = tocOpts?.tocTitle?.trim() || "政府评审版目录";

  page.drawText(tocTitle, {
    x: M,
    y: height - 72,
    size: 20,
    font,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText(`项目：${input.projectName || "-"}`, {
    x: M,
    y: height - 100,
    size: 10,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  let y = height - 150;
  const linkRects: TenderNavRect[] = [];
  for (const entry of entries) {
    page.drawText(entry.title, {
      x: M,
      y,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    const pageText = String(entry.startPage);
    const w = font.widthOfTextAtSize(pageText, 11);
    page.drawText(pageText, {
      x: width - M - w,
      y,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    const targetKey = resolveTocTargetKey(entry.id);
    if (targetKey) {
      linkRects.push({
        page: 1,
        x: M,
        y: y - 3,
        width: width - M * 2,
        height: 18,
        targetKey,
      });
    }
    y -= 24;
  }

  return { bytes: await pdf.save(), linkRects };
}

async function restampPackPagination(
  mergedBytes: Uint8Array,
  opts: {
    level: TenderLevel;
    planId: string;
  }
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(mergedBytes, { ignoreEncryption: true });
  doc.registerFontkit(fontkit);

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansSC-Regular.ttf"
  );

  if (!fs.existsSync(fontPath)) {
    throw new Error(`PACK_FOOTER_FONT_NOT_FOUND: ${fontPath}`);
  }

  const fontBytes = fs.readFileSync(fontPath);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const pages = doc.getPages();
  const total = pages.length;

  const label =
    opts.level === "government"
      ? "政府评审版"
      : opts.level === "enterprise"
        ? "企业投标版"
        : "专业版";

  const footerFontSize = 9;
  const footerColor = rgb(0.42, 0.42, 0.42);

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    const coverX = 0;
    const coverY = 0;
    const coverW = width;
    const coverH = 110;

    page.drawRectangle({
      x: coverX,
      y: coverY,
      width: coverW,
      height: coverH,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 110,
      color: rgb(1, 1, 1),
      opacity: 1,
      borderWidth: 0,
    });

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 110,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    page.drawLine({
      start: { x: 28, y: 70 },
      end: { x: width - 28, y: 70 },
      thickness: 0.8,
      color: rgb(0.85, 0.85, 0.85),
    });

    const leftText = `AI Fitness Solution · ${label}`;
    const rightText = `第 ${i + 1} 页 / 共 ${total} 页`;
    const leftSize = font.widthOfTextAtSize(leftText, footerFontSize);
    const rightSize = font.widthOfTextAtSize(rightText, footerFontSize);
    const footerY = 50;

    page.drawText(leftText, {
      x: 28,
      y: footerY,
      size: footerFontSize,
      font,
      color: footerColor,
    });

    page.drawText(rightText, {
      x: width - 28 - rightSize,
      y: footerY,
      size: footerFontSize,
      font,
      color: footerColor,
    });
  }

  return await doc.save();
}

function getInternalPackHeaders(): Record<string, string> {
  const secret = (process.env.INTERNAL_PACK_SECRET || "").trim();
  return secret
    ? { "X-INTERNAL-PACK": "1", "X-INTERNAL-PACK-SECRET": secret }
    : {};
}

async function fetchPdfBytes(url: string, timeoutMs = 45000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  const internalHeaders = getInternalPackHeaders();
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/pdf", ...internalHeaders },
      signal: ac.signal,
    });

    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      let errText = "";
      try {
        errText = ct.includes("application/json")
          ? JSON.stringify(await res.json())
          : await res.text();
      } catch {
        // ignore
      }
      throw new Error(
        `Upstream PDF failed: ${res.status} ${res.statusText}${
          errText ? ` | ${errText.slice(0, 1200)}` : ""
        }`
      );
    }

    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(t);
  }
}

async function getPageCount(bytes: Uint8Array | Buffer) {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

async function assertPdfOk(bytes: Buffer, name: string) {
  if (!bytes || bytes.length < 1200) {
    throw new Error(`${name} too small (${bytes?.length ?? 0} bytes)`);
  }
  try {
    const pages = await getPageCount(bytes);
    if (!pages || pages <= 0) throw new Error("0 pages");
    return pages;
  } catch (e: any) {
    throw new Error(`${name} is not a valid PDF: ${e?.message || String(e)}`);
  }
}

type TenderPackExtra = Record<string, never>;

type TenderParseInput = {
  tenderRawText: string;
  tenderFileName: string;
};

function cleanInputText(v: unknown): string {
  return String(v ?? "").replace(/\u0000/g, "").trim();
}

async function tryReadJsonBody(req: NextRequest): Promise<any | null> {
  const method = (req.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const contentType = req.headers.get("content-type") || "";
  console.log("[tryReadJsonBody]", { method, contentType });

  if (!contentType.includes("application/json")) return null;

  try {
    const data = await req.json();
    console.log("[tryReadJsonBody] ok", {
      hasRawText: !!data?.rawText,
      rawTextLength: String(data?.rawText || "").length,
      sourceName: data?.sourceName || null,
    });
    return data;
  } catch (e: any) {
    console.log("[tryReadJsonBody] failed", e?.message || String(e));
    return null;
  }
}

async function resolveTenderParseInput(
  req: NextRequest,
  sp: URLSearchParams
): Promise<TenderParseInput> {
  const body = await tryReadJsonBody(req);

  const bodyRawText = cleanInputText(body?.rawText);
  const bodyFileName = cleanInputText(body?.sourceName || body?.tenderFileName);

  const queryRawText = cleanInputText(
    sp.get("rawText") || sp.get("tenderRawText") || sp.get("tenderText")
  );
  const queryFileName = cleanInputText(
    sp.get("sourceName") || sp.get("tenderFileName")
  );

  const tenderRawText = bodyRawText || queryRawText || "";
  const tenderFileName = bodyFileName || queryFileName || "tender-source.txt";

  return { tenderRawText, tenderFileName };
}

function buildPlanPdfUrl(
  origin: string,
  args: {
    planId: string;
    theme: string;
    watermark: string;
    tz: string;
    level: TenderLevel;
    pdfVersionPlan: string;
    variant: "sales" | "tender";
  }
) {
  const url = new URL(`${origin}/api/pdf`);
  url.searchParams.set("planId", args.planId);
  url.searchParams.set("mode", "full");
  url.searchParams.set("theme", args.theme);
  url.searchParams.set("watermark", args.watermark);
  url.searchParams.set("tz", args.tz);
  url.searchParams.set("level", args.level);
  url.searchParams.set("variant", args.variant);
  url.searchParams.set("pdfVersionPlan", args.pdfVersionPlan);
  url.searchParams.set("pdfVersion", args.pdfVersionPlan);
  return url;
}

function buildBudgetPdfUrl(
  origin: string,
  args: {
    planId: string;
    theme: string;
    watermark: string;
    tz: string;
    level: "saas" | "enterprise" | "government";
    pdfVersionBudget: string;
    companyName: string;
    companySize: string;
    sections: string;
  }
) {
  const url = new URL(`${origin}/api/pdf`);
  url.searchParams.set("planId", args.planId);
  url.searchParams.set("mode", "budget");
  url.searchParams.set("theme", args.theme);
  url.searchParams.set("watermark", args.watermark);
  url.searchParams.set("tz", args.tz);
  url.searchParams.set("level", args.level);
  url.searchParams.set("pdfVersionBudget", args.pdfVersionBudget);
  url.searchParams.set("pdfVersion", args.pdfVersionBudget);
  url.searchParams.set("companyName", args.companyName);
  url.searchParams.set("companySize", args.companySize);
  url.searchParams.set("sections", args.sections);
  url.searchParams.set("showStandalonePageNumber", "0");
  return url;
}

async function runTenderPack(
  req: NextRequest,
  sp: URLSearchParams,
  _extra: TenderPackExtra
): Promise<Response> {
  try {
    const { tenderRawText, tenderFileName } = await resolveTenderParseInput(
      req,
      sp
    );
    const parsedTender = tenderRawText
      ? buildParsedTenderResult({
          sourceName: tenderFileName || "tender-source",
          rawText: tenderRawText,
        })
      : null;
    console.log("[TENDER_PARSE]", {
      sourceName: parsedTender?.sourceName || null,
      rawTextLength: tenderRawText.length,
      technicalCount: parsedTender?.technicalRequirements?.length || 0,
      businessCount: parsedTender?.businessRequirements?.length || 0,
      scoreCount: parsedTender?.scoreCriteria?.length || 0,
      warnings: parsedTender?.warnings || [],
    });
    console.log("[TENDER_PARSE_SOURCE]", {
      usingParsedTechnical: !!parsedTender?.technicalRequirements?.length,
      usingParsedBusiness: !!parsedTender?.businessRequirements?.length,
      usingParsedScore: !!parsedTender?.scoreCriteria?.length,
    });

    if (sp.get("parseOnly") === "1") {
      return NextResponse.json({
        ok: true,
        mode: "parse-only",
        tenderFileName,
        rawTextLength: tenderRawText.length,
        rawTextPreview: tenderRawText.slice(0, 300),
        parsed: parsedTender,
      });
    }

    const requestUrl = new URL(req.url);
    const origin = requestUrl.origin;

    const planId = (sp.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    const format = (sp.get("format") || "merged").trim().toLowerCase();
    if (!["links", "zip", "merged"].includes(format)) {
      return json(
        400,
        "BAD_FORMAT",
        `Unknown format: ${format} (use format=links | zip | merged)`
      );
    }

    const level = parseTenderLevel(sp.get("level"));
    const theme = (
      sp.get("theme") || (level === "government" ? "tender" : "brand")
    ).trim();
    const watermark = (sp.get("watermark") || "0").trim();
    console.log("[tender-pack request flags]", {
      planId,
      format,
      level,
      theme,
      watermark,
    });
    const tz = (sp.get("tz") || "Asia/Tokyo").trim();
    const includeCover = (sp.get("includeCover") || "1").trim() !== "0";
    const packFooter = parseBool01(sp.get("packFooter"), true);
    const companyName = (sp.get("companyName") || "示例企业").trim();
    const companySize = (sp.get("companySize") || "200").trim();
    const downloadToken = (sp.get("downloadToken") || "").trim();
    const pdfVersionPlan = (sp.get("pdfVersionPlan") || "PLAN_V1").trim();
    const pdfVersionBudget = (sp.get("pdfVersionBudget") || "BUDGET_V1").trim();

    const internal = isInternalRequest(req, sp);
    const freezeYmdRaw = sp.get("freezeYmd") || "";
    const freezeTenderNoRaw = sp.get("freezeTenderNo") || "";
    const freezeYmd = internal ? normFreezeYmd(freezeYmdRaw) : "";
    const freezeTenderNo = internal ? normFreezeTenderNo(freezeTenderNoRaw) : "";

    const date = freezeYmd || ymdTokyo();
    const tenderNo =
      freezeTenderNo || `TENDER-${asciiSafeFilename(planId)}-${date}`;

    const planVariant = level === "government" ? "tender" : "sales";
    const packVariant = level === "government" ? "tender" : "enterprise";
    const budgetLevel =
      level === "government"
        ? "government"
        : level === "enterprise"
          ? "enterprise"
          : "saas";
    const isEnterpriseBrand =
      level === "enterprise" && theme.toLowerCase() === "brand";
    const baseBudgetSections = budgetSectionsForPack(level);
    const packBudgetSections = isEnterpriseBrand
      ? baseBudgetSections
          .split(",")
          .filter((s) => s !== "sign_seal")
          .join(",")
      : baseBudgetSections;
    console.log("[tender-pack enterprise check]", {
      level,
      theme,
      isEnterpriseBrand,
      baseBudgetSections,
      packBudgetSections,
    });

    const planPdfUrl = buildPlanPdfUrl(origin, {
      planId,
      theme,
      watermark,
      tz,
      level,
      pdfVersionPlan,
      variant: planVariant,
    });

    const budgetPdfUrl = buildBudgetPdfUrl(origin, {
      planId,
      theme,
      watermark,
      tz,
      level: budgetLevel,
      pdfVersionBudget,
      companyName,
      companySize,
      sections: packBudgetSections,
    });
    console.log("[tender-pack budget url]", budgetPdfUrl.toString());

    if (format === "links") {
      return NextResponse.json({
        ok: true,
        level,
        variant: packVariant,
        tenderNo,
        includeCover,
        packFooter,
        plan: planPdfUrl.toString(),
        budget: budgetPdfUrl.toString(),
        budgetSections: packBudgetSections,
        governmentSections:
          level === "government" || level === "enterprise"
            ? isEnterpriseBrand
              ? ["toc", "plan", "budget", "business-note"]
              : [
                  "toc",
                  "bid-letter",
                  "business-terms-response",
                  "technical-response",
                  "business-deviation",
                  "technical-deviation",
                  "attachment-index",
                  "plan",
                  "budget",
                ]
            : [],
      });
    }

    const ip = getReqIp(req as any);
    const ua = req.headers.get("user-agent") || "";

    if (internal) {
      console.log("[tender-pack internal bypass]", {
        internal,
        planId,
        method: req.method,
      });
    } else {
      const fingerprint = [
        planId,
        "pack",
        (ip || "noip").split(",")[0].trim(),
        (ua || "noua").slice(0, 80),
      ].join("|");

      const tokenResult = await requireAndConsumeDownloadToken({
        downloadToken,
        planId,
        mode: "pack",
        variant: packVariant,
        fingerprint,
        ip,
        ua,
      });

      if (!tokenResult.ok) {
        return json(
          403,
          tokenResult.code || "TOKEN_INVALID",
          `download token rejected: ${tokenResult.code || "TOKEN_INVALID"}`,
          tokenResult
        );
      }
    }

    const [planBytes, budgetBytes] = await Promise.all([
      fetchPdfBytes(planPdfUrl.toString()),
      fetchPdfBytes(budgetPdfUrl.toString()),
    ]);

    const [planPages, budgetPages] = await Promise.all([
      assertPdfOk(planBytes, "plan"),
      assertPdfOk(budgetBytes, "budget"),
    ]);

    let coverBytes: Uint8Array | null = null;
    let coverPages = 0;
    if (includeCover) {
      coverBytes = await renderTenderCoverPdf({
        companyName,
        planId,
        reportDate: date,
        tenderNo,
        projectName:
          (sp.get("projectName") || "").trim() || "企业健身房建设项目",
      });
      coverPages = await assertPdfOk(Buffer.from(coverBytes), "cover");
    }

    let govTocBytes: Uint8Array | null = null;
    let govTocLinkRects: TenderNavRect[] = [];
    let bidLetterBytes: Uint8Array | null = null;
    let businessTermsResponseBytes: Uint8Array | null = null;
    let technicalResponseBytes: Uint8Array | null = null;
    let businessDeviationBytes: Uint8Array | null = null;
    let technicalDeviationBytes: Uint8Array | null = null;
    let scoreBytes: Uint8Array | null = null;
    let attachmentIndexBytes: Uint8Array | null = null;
    let enterpriseBizNoteBytes: Uint8Array | null = null;
    let govTocPages = 0;
    let bidLetterPages = 0;
    let businessTermsResponsePages = 0;
    let technicalResponsePages = 0;
    let businessDeviationPages = 0;
    let technicalDeviationPages = 0;
    let scorePages = 0;
    let attachmentIndexPages = 0;
    let enterpriseBizNotePages = 0;
    let govTocEntries: GovTocEntry[] = [];
    let technicalRowsForNav: Array<{ refId?: string }> = [];
    let businessRowsForNav: Array<{ refId?: string }> = [];
    let scoreRowsForNav: Array<{ scoreId?: string }> = [];
    let attachmentRowsForNav: Array<{ code?: string }> = [];
    let technicalRefPageMap: TenderRefPageMap = {};
    let businessRefPageMap: TenderRefPageMap = {};
    let scoreRefPageMap: TenderRefPageMap = {};
    const shouldBuildTenderExtras =
      level === "government" || level === "enterprise";

    if (shouldBuildTenderExtras) {
      const govInput: GovSectionInput = {
        planId,
        companyName,
        projectName: sp.get("projectName") || "企业健身房建设项目",
        tenderNo,
        issueDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
      };

      if (isEnterpriseBrand) {
        enterpriseBizNoteBytes =
          await buildEnterpriseBrandBusinessNotePdf(govInput);
        enterpriseBizNotePages = await assertPdfOk(
          Buffer.from(enterpriseBizNoteBytes),
          "business-note"
        );

        govTocPages = 1;
        let currentPage = coverPages + govTocPages + 1;
        govTocEntries = [];

        govTocEntries.push({
          id: "plan",
          title: "建设方案",
          startPage: currentPage,
        });
        currentPage += planPages;

        govTocEntries.push({
          id: "budget",
          title: "预算与报价",
          startPage: currentPage,
        });
        currentPage += budgetPages;

        govTocEntries.push({
          id: "business-note",
          title: "商务说明",
          startPage: currentPage,
        });

        const tocResult = await buildGovernmentTocPdf(govInput, govTocEntries, {
          tocTitle: "企业投标包目录",
        });
        govTocBytes = tocResult.bytes;
        govTocLinkRects = tocResult.linkRects;
        govTocPages = await assertPdfOk(
          Buffer.from(govTocBytes),
          "enterprise-toc"
        );
      } else {
        const attachmentIndexRows = buildDefaultTenderAttachmentIndexRows();
        const attachmentRefs = mapAttachmentIndexRowsToRefs(attachmentIndexRows);
        const businessRows = buildBusinessRows({
          parsedBusinessRequirements: parsedTender?.businessRequirements,
        });
        const technicalRows = buildTechnicalRows({
          ...govInput,
          parsedTechnicalRequirements: parsedTender?.technicalRequirements,
        });
        const businessRowsWithRefs = buildBusinessResponseRefs(businessRows);
        const technicalRowsWithRefs = buildTechnicalResponseRefs(technicalRows);
        businessRowsForNav = businessRowsWithRefs;
        technicalRowsForNav = technicalRowsWithRefs;
        attachmentRowsForNav = attachmentIndexRows;

        const [
          bidLetterResult,
          businessResponseResult,
          technicalResponseResult,
          businessDeviationResult,
          technicalDeviationResult,
          attachmentIndexResult,
        ] = await Promise.all([
          buildBidLetterPdf(govInput),
          buildBusinessTermsResponsePdf(businessRowsWithRefs, attachmentRefs),
          buildTechnicalResponsePdf(technicalRowsWithRefs, attachmentRefs),
          buildBusinessDeviationPdf(businessRowsWithRefs, attachmentRefs),
          buildTechnicalDeviationPdf(technicalRowsWithRefs, attachmentRefs),
          buildAttachmentIndexPdf(govInput, attachmentIndexRows),
        ]);
        bidLetterBytes = bidLetterResult;
        businessTermsResponseBytes = businessResponseResult.bytes;
        technicalResponseBytes = technicalResponseResult.bytes;
        businessDeviationBytes = businessDeviationResult;
        technicalDeviationBytes = technicalDeviationResult;
        attachmentIndexBytes = attachmentIndexResult;
        businessRefPageMap = businessResponseResult.refPageMap || {};
        technicalRefPageMap = technicalResponseResult.refPageMap || {};

        [
          bidLetterPages,
          businessTermsResponsePages,
          technicalResponsePages,
          businessDeviationPages,
          technicalDeviationPages,
          attachmentIndexPages,
        ] = await Promise.all([
          assertPdfOk(Buffer.from(bidLetterBytes!), "bid-letter"),
          assertPdfOk(
            Buffer.from(businessTermsResponseBytes!),
            "business-terms-response"
          ),
          assertPdfOk(
            Buffer.from(technicalResponseBytes!),
            "technical-response"
          ),
          assertPdfOk(
            Buffer.from(businessDeviationBytes!),
            "business-deviation"
          ),
          assertPdfOk(
            Buffer.from(technicalDeviationBytes!),
            "technical-deviation"
          ),
          assertPdfOk(
            Buffer.from(attachmentIndexBytes!),
            "attachment-index"
          ),
        ]);

        let scorePagesEstimate = 1;
        for (let attempt = 0; attempt < 5; attempt++) {
          const pageRefs = buildTenderSectionPageRefsFromPackLayout({
            coverPages,
            govTocPages: 1,
            bidLetterPages,
            businessTermsResponsePages,
            technicalResponsePages,
            businessDeviationPages,
            technicalDeviationPages,
            scorePages: scorePagesEstimate,
            attachmentIndexPages,
            planPages,
            budgetPages,
          });
          const scoreResult = await buildScoreMappingPdf({
            technicalRows: technicalRowsWithRefs,
            businessRows: businessRowsWithRefs,
            parsedScoreCriteria: parsedTender?.scoreCriteria,
            pageRefs,
            attachmentRefs,
          });
          scoreBytes = scoreResult.bytes;
          scoreRowsForNav = scoreResult.scoreRows;
          scoreRefPageMap = scoreResult.refPageMap || {};
          scorePages = await assertPdfOk(Buffer.from(scoreBytes), "score");
          if (scorePages === scorePagesEstimate) break;
          scorePagesEstimate = scorePages;
        }

        govTocPages = 1;
        let currentPage = coverPages + govTocPages + 1;
        govTocEntries = [];

        if (bidLetterBytes) {
          govTocEntries.push({
            id: "bid-letter",
            title: "投标函与响应声明",
            startPage: currentPage,
          });
          currentPage += bidLetterPages || 1;
        }

        if (businessTermsResponseBytes) {
          govTocEntries.push({
            id: "business-terms-response",
            title: "商务条款响应表",
            startPage: currentPage,
          });
          currentPage += businessTermsResponsePages || 1;
        }

        if (technicalResponseBytes) {
          govTocEntries.push({
            id: "technical-response",
            title: "技术响应表",
            startPage: currentPage,
          });
          currentPage += technicalResponsePages || 1;
        }

        if (businessDeviationBytes) {
          govTocEntries.push({
            id: "business-deviation",
            title: "商务偏离表",
            startPage: currentPage,
          });
          currentPage += businessDeviationPages || 1;
        }

        if (technicalDeviationBytes) {
          govTocEntries.push({
            id: "technical-deviation",
            title: "技术偏离表",
            startPage: currentPage,
          });
          currentPage += technicalDeviationPages || 1;
        }

        if (scoreBytes) {
          govTocEntries.push({
            id: "score",
            title: "评分项对照页",
            startPage: currentPage,
          });
          currentPage += scorePages || 1;
        }

        if (attachmentIndexBytes) {
          govTocEntries.push({
            id: "attachment-index",
            title: "附件索引页",
            startPage: currentPage,
          });
          currentPage += attachmentIndexPages || 1;
        }

        govTocEntries.push({
          id: "plan",
          title: "建设方案",
          startPage: currentPage,
        });
        currentPage += planPages;
        govTocEntries.push({
          id: "budget",
          title: "预算与报价",
          startPage: currentPage,
        });
        const tocResult = await buildGovernmentTocPdf(govInput, govTocEntries);
        govTocBytes = tocResult.bytes;
        govTocLinkRects = tocResult.linkRects;
        govTocPages = await assertPdfOk(
          Buffer.from(govTocBytes),
          "government-toc"
        );
      }
    }

    const totalPages =
      coverPages +
      govTocPages +
      (isEnterpriseBrand
        ? planPages + budgetPages + enterpriseBizNotePages
        : bidLetterPages +
          businessTermsResponsePages +
          technicalResponsePages +
          businessDeviationPages +
          technicalDeviationPages +
          scorePages +
          attachmentIndexPages +
          planPages +
          budgetPages);

    console.log("[tender-pack page counts]", {
      coverPages,
      govTocPages,
      planPages,
      budgetPages,
      enterpriseBizNotePages,
      totalPages,
    });

    if (format === "merged") {
      const parts: MergePart[] = [];
      if (coverBytes) parts.push({ name: "cover", buf: coverBytes, mode: "copy" });
      if (govTocBytes) parts.push({ name: "toc", buf: govTocBytes, mode: "copy" });

      if (isEnterpriseBrand) {
        parts.push({
          name: "plan",
          buf: planBytes,
          mode: "copy",
        });
        parts.push({
          name: "budget",
          buf: budgetBytes,
          mode: "crop",
          cutBottom: PACK_CROP_BOTTOM,
        });
        if (enterpriseBizNoteBytes) {
          parts.push({
            name: "business-note",
            buf: enterpriseBizNoteBytes,
            mode: "copy",
          });
        }
      } else {
        if (bidLetterBytes) {
          parts.push({ name: "bid-letter", buf: bidLetterBytes, mode: "copy" });
        }
        if (businessTermsResponseBytes) {
          parts.push({
            name: "business-terms-response",
            buf: businessTermsResponseBytes,
            mode: "copy",
          });
        }
        if (technicalResponseBytes) {
          parts.push({
            name: "technical-response",
            buf: technicalResponseBytes,
            mode: "copy",
          });
        }
        if (businessDeviationBytes) {
          parts.push({
            name: "business-deviation",
            buf: businessDeviationBytes,
            mode: "copy",
          });
        }
        if (technicalDeviationBytes) {
          parts.push({
            name: "technical-deviation",
            buf: technicalDeviationBytes,
            mode: "copy",
          });
        }
        if (scoreBytes) {
          parts.push({
            name: "score",
            buf: scoreBytes,
            mode: "copy",
          });
        }
        if (attachmentIndexBytes) {
          parts.push({
            name: "attachment-index",
            buf: attachmentIndexBytes,
            mode: "copy",
          });
        }
        parts.push({
          name: "plan",
          buf: planBytes,
          mode: "copy",
        });
        parts.push({
          name: "budget",
          buf: budgetBytes,
          mode: "crop",
          cutBottom: PACK_CROP_BOTTOM,
        });
      }

      console.log(
        "[tender-pack parts]",
        parts.map((p, i) => ({
          idx: i,
          name: p.name,
          mode: p.mode,
          cutBottom: p.cutBottom ?? null,
          size: p.buf.length,
        }))
      );

      const mergedBytes = await mergePdfBuffers({ parts });
      const mergedPages = await assertPdfOk(Buffer.from(mergedBytes), "merged-check");
      console.log("[tender-pack merged check]", { mergedPages });
      let finalBytes = packFooter
        ? await restampPackPagination(mergedBytes, { level, planId })
        : mergedBytes;

      if (!isEnterpriseBrand && govTocEntries.length > 0 && govTocLinkRects.length > 0) {
        const sectionStarts = buildTenderSectionStartPages(govTocEntries);
        const mergedRefPageMap = mergeRefPageMaps(
          offsetRefPageMap(
            scoreRefPageMap,
            Math.max((sectionStarts.score || 1) - 1, 0)
          ),
          offsetRefPageMap(
            technicalRefPageMap,
            Math.max((sectionStarts.technicalResponse || 1) - 1, 0)
          ),
          offsetRefPageMap(
            businessRefPageMap,
            Math.max((sectionStarts.businessResponse || 1) - 1, 0)
          )
        );
        const navMap = buildTenderNavMap({
          sectionStarts,
          technicalResponseRows: technicalRowsForNav,
          businessResponseRows: businessRowsForNav,
          scoreRows: scoreRowsForNav,
          attachmentRows: attachmentRowsForNav,
          preciseRefPages: mergedRefPageMap,
        });
        const tocRectsInMerged = govTocLinkRects.map((r) => ({
          ...r,
          page: r.page + coverPages,
        }));
        const navDoc = await PDFDocument.load(finalBytes, { ignoreEncryption: true });
        applyTenderNavLinks(navDoc, navMap, tocRectsInMerged);
        finalBytes = await navDoc.save();
      }
      const mergedFilename = `AI_Fitness_Solution_Tender_Merged-${level}-${asciiSafeFilename(planId)}-${date}.pdf`;

      if (req.method === "GET" || req.method === "POST") {
        void logPdfDownloadSafe({
          planId,
          ok: true,
          route: "/api/tender-pack",
          method: req.method,
          mode: null,
          level,
          format,
          theme,
          pdfVersion: null,
          planVersion: pdfVersionPlan,
          budgetVersion: pdfVersionBudget,
          reqsig: null,
          docSeq: null,
          pages: mergedPages,
          bytes: mergedBytes.length,
          ip,
          ua,
          reason: null,
          extra: {
            tenderNo,
            includeCover,
            packFooter,
            packBudgetSections,
            watermark,
            tz,
            packVariant,
          },
        });
      }

      return new NextResponse(new Uint8Array(finalBytes), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${asciiSafeFilename(mergedFilename)}"`,
          "Cache-Control": "no-store",
          "X-TENDER-PACK": "MERGED_TENDER_V10_SIMPLE",
          "X-TENDER-LEVEL": level,
          "X-TENDER-NO": tenderNo,
          "X-PLAN-VERSION": pdfVersionPlan,
          "X-BUDGET-VERSION": pdfVersionBudget,
          "X-PLAN-PAGES": String(planPages),
          "X-BUDGET-PAGES": String(budgetPages),
          "X-COVER-PAGES": String(coverPages),
          "X-TOC-PAGES": String(govTocPages),
          "X-GOV-BID-LETTER-PAGES": String(bidLetterPages),
          "X-GOV-BIZ-RESPONSE-PAGES": String(businessTermsResponsePages),
          "X-GOV-TECH-RESPONSE-PAGES": String(technicalResponsePages),
          "X-GOV-BIZ-DEVIATION-PAGES": String(businessDeviationPages),
          "X-GOV-TECH-DEVIATION-PAGES": String(technicalDeviationPages),
          "X-GOV-SCORE-PAGES": String(scorePages),
          "X-GOV-ATTACHMENT-INDEX-PAGES": String(attachmentIndexPages),
          "X-TOTAL-PAGES": String(totalPages),
          "X-INCLUDE-COVER": includeCover ? "1" : "0",
          "X-PACK-BUDGET-SECTIONS": packBudgetSections,
          "X-PACK-PAGINATION": packFooter ? "1" : "0",
          "X-PACK-FOOTER": packFooter ? "1" : "0",
          "X-PACK-VARIANT": packVariant,
          "X-PACK-THEME": theme || "brand",
          "X-PACK-WATERMARK": watermark === "1" ? "1" : "0",
          "X-PACK-TZ": tz,
        },
      });
    }

    const zip = new JSZip();
    let zipN = 0;
    const zipAddPart = (id: string, buf: Uint8Array) => {
      const n = String(zipN++).padStart(2, "0");
      zip.file(`${n}-${id}.pdf`, buf);
    };

    if (coverBytes) zipAddPart("cover", coverBytes);
    if (govTocBytes) zipAddPart("toc", govTocBytes);
    if (isEnterpriseBrand) {
      zipAddPart("plan", planBytes);
      zipAddPart("budget", budgetBytes);
      if (enterpriseBizNoteBytes) {
        zipAddPart("business-note", enterpriseBizNoteBytes);
      }
    } else {
      if (bidLetterBytes) zipAddPart("bid-letter", bidLetterBytes);
      if (businessTermsResponseBytes) {
        zipAddPart("business-terms-response", businessTermsResponseBytes);
      }
      if (technicalResponseBytes) {
        zipAddPart("technical-response", technicalResponseBytes);
      }
      if (businessDeviationBytes) {
        zipAddPart("business-deviation", businessDeviationBytes);
      }
      if (technicalDeviationBytes) {
        zipAddPart("technical-deviation", technicalDeviationBytes);
      }
      if (scoreBytes) {
        zipAddPart("score", scoreBytes);
      }
      if (attachmentIndexBytes) {
        zipAddPart("attachment-index", attachmentIndexBytes);
      }
      zipAddPart("plan", planBytes);
      zipAddPart("budget", budgetBytes);
    }

    zip.file(
      "MANIFEST.txt",
      [
        `planId=${planId}`,
        `companyName=${companyName}`,
        `level=${level}`,
        `variant=${packVariant}`,
        `tenderNo=${tenderNo}`,
        `theme=${theme}`,
        `watermark=${watermark}`,
        `tz=${tz}`,
        `includeCover=${includeCover ? "1" : "0"}`,
        `packFooter=${packFooter ? "1" : "0"}`,
        `tocPages=${govTocPages}`,
        `bidLetterPages=${bidLetterPages}`,
        `businessTermsResponsePages=${businessTermsResponsePages}`,
        `technicalResponsePages=${technicalResponsePages}`,
        `businessDeviationPages=${businessDeviationPages}`,
        `technicalDeviationPages=${technicalDeviationPages}`,
        `scorePages=${scorePages}`,
        `attachmentIndexPages=${attachmentIndexPages}`,
        `enterpriseBizNotePages=${enterpriseBizNotePages}`,
        `planPages=${planPages}`,
        `budgetPages=${budgetPages}`,
        `coverPages=${coverPages}`,
        `totalPages=${totalPages}`,
        `budgetSections=${packBudgetSections}`,
        `generatedAt=${new Date().toISOString()}`,
      ].join("\n")
    );

    const zipBytes = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    const zipFilename = `AI_Fitness_Solution_Tender_Pack-${level}-${asciiSafeFilename(planId)}-${date}.zip`;

    if (req.method === "GET" || req.method === "POST") {
      void logPdfDownloadSafe({
        planId,
        ok: true,
        route: "/api/tender-pack",
        method: req.method,
        mode: null,
        level,
        format,
        theme,
        pdfVersion: null,
        planVersion: pdfVersionPlan,
        budgetVersion: pdfVersionBudget,
        reqsig: null,
        docSeq: null,
        pages: totalPages || null,
        bytes: zipBytes.length,
        ip,
        ua,
        reason: null,
        extra: {
          tenderNo,
          includeCover,
          packFooter,
          packBudgetSections,
          watermark,
          tz,
          packVariant,
        },
      });
    }

    return new NextResponse(new Uint8Array(zipBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${asciiSafeFilename(zipFilename)}"`,
        "Cache-Control": "no-store",
        "X-TENDER-PACK": "ZIP_TENDER_V10_SIMPLE",
        "X-TENDER-LEVEL": level,
        "X-TENDER-NO": tenderNo,
        "X-PLAN-VERSION": pdfVersionPlan,
        "X-BUDGET-VERSION": pdfVersionBudget,
        "X-PLAN-PAGES": String(planPages),
        "X-BUDGET-PAGES": String(budgetPages),
        "X-COVER-PAGES": String(coverPages),
        "X-TOTAL-PAGES": String(totalPages),
        "X-INCLUDE-COVER": includeCover ? "1" : "0",
        "X-PACK-BUDGET-SECTIONS": packBudgetSections,
        "X-PACK-VARIANT": packVariant,
        "X-PACK-THEME": theme || "brand",
        "X-PACK-WATERMARK": watermark === "1" ? "1" : "0",
        "X-PACK-TZ": tz,
      },
    });
  } catch (e: any) {
    return json(500, "TENDER_PACK_ERROR", e?.message || "Internal error", {
      name: e?.name,
      stack: e?.stack,
    });
  }
}

export async function GET(req: NextRequest) {
  return runTenderPack(req, new URL(req.url).searchParams, {});
}

export async function POST(req: NextRequest) {
  return runTenderPack(req, new URL(req.url).searchParams, {});
}

export async function HEAD(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;
    const planId = (sp.get("planId") || "").trim();
    if (!planId) {
      return new NextResponse(null, {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const format = (sp.get("format") || "merged").trim().toLowerCase();
    const level = parseTenderLevel(sp.get("level"));
    const theme = (
      sp.get("theme") || (level === "enterprise" ? "tender" : "brand")
    ).trim();
    const watermark = (sp.get("watermark") || "0").trim();
    const tz = (sp.get("tz") || "Asia/Tokyo").trim();
    const pdfVersionPlan = (sp.get("pdfVersionPlan") || "PLAN_V1").trim();
    const pdfVersionBudget = (sp.get("pdfVersionBudget") || "BUDGET_V1").trim();
    const includeCover = (sp.get("includeCover") || "1").trim() !== "0";
    const packFooter = parseBool01(sp.get("packFooter"), true);
    const internal = isInternalRequest(req, sp);
    const freezeYmd = internal ? normFreezeYmd(sp.get("freezeYmd") || "") : "";
    const freezeTenderNo = internal
      ? normFreezeTenderNo(sp.get("freezeTenderNo") || "")
      : "";
    const date = freezeYmd || ymdTokyo();
    const tenderNo =
      freezeTenderNo || `TENDER-${asciiSafeFilename(planId)}-${date}`;
    const packVariant = level === "government" ? "tender" : "enterprise";
    const packBudgetSections = budgetSectionsForPack(level);

    let contentType = "application/json";
    let filename = `AI_Fitness_Solution_Tender_Pack-${level}-${asciiSafeFilename(planId)}-${date}.json`;
    if (format === "merged") {
      contentType = "application/pdf";
      filename = `AI_Fitness_Solution_Tender_Merged-${level}-${asciiSafeFilename(planId)}-${date}.pdf`;
    } else if (format === "zip") {
      contentType = "application/zip";
      filename = `AI_Fitness_Solution_Tender_Pack-${level}-${asciiSafeFilename(planId)}-${date}.zip`;
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${asciiSafeFilename(filename)}"`,
        "Cache-Control": "no-store",
        "X-TENDER-PACK":
          format === "merged"
            ? "MERGED_TENDER_V10_SIMPLE"
            : format === "zip"
              ? "ZIP_TENDER_V10_SIMPLE"
              : "LINKS_TENDER_V10_SIMPLE",
        "X-TENDER-LEVEL": level,
        "X-TENDER-NO": tenderNo,
        "X-PLAN-VERSION": pdfVersionPlan,
        "X-BUDGET-VERSION": pdfVersionBudget,
        "X-INCLUDE-COVER": includeCover ? "1" : "0",
        "X-PACK-BUDGET-SECTIONS": packBudgetSections,
        "X-PACK-PAGINATION": packFooter ? "1" : "0",
        "X-PACK-FOOTER": packFooter ? "1" : "0",
        "X-PACK-VARIANT": packVariant,
        "X-PACK-THEME": theme || "brand",
        "X-PACK-WATERMARK": watermark === "1" ? "1" : "0",
        "X-PACK-TZ": tz,
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
