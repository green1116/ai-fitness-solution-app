import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import {
  COVER_CONFIDENTIAL_BASE_Y,
  COVER_META_LINE_GAP,
  drawTenderCoverConfidentialBlock,
  TENDER_PLAN_VOLUME_SUBTITLE,
} from "@/lib/pdf/tenderCommercialCopy";
import { TENDER_DOC_SYSTEM } from "@/lib/pdf/tenderDocumentContext";
import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  rgb,
} from "pdf-lib";

/** 投标包封面入参（与 tender-pack 对齐） */
export type CoverInput = {
  companyName?: string;
  planId?: string;
  reportDate?: string;
  ymd?: string;
  date?: string;
  tenderNo?: string;
  projectName?: string;
};

/** V3 商业封面内容（Plan / 独立封面 PDF 共用） */
export type CommercialCoverInput = {
  companyName: string;
  projectName: string;
  tenderNo: string;
  dateText: string;
  /** 卷副标题，默认技术方案卷 */
  volumeSubtitle?: string;
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;

const C = {
  paper: rgb(0.995, 0.996, 1),
  ink: rgb(0.11, 0.13, 0.17),
  brand: rgb(0.14, 0.24, 0.42),
  muted: rgb(0.42, 0.44, 0.48),
  faint: rgb(0.55, 0.57, 0.6),
  rule: rgb(0.84, 0.86, 0.9),
};

function readFontBytes() {
  const p = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  if (!fs.existsSync(p)) {
    throw new Error(`COVER_FONT_NOT_FOUND: ${p}`);
  }
  return fs.readFileSync(p);
}

export function formatCoverDateIso(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayYmd() {
  return formatCoverDateIso().replace(/-/g, "");
}

function centerX(page: PDFPage, text: string, size: number, font: PDFFont): number {
  const w = page.getWidth();
  const tw = font.widthOfTextAtSize(text, size);
  return Math.max(24, (w - tw) / 2);
}

function drawCentered(
  page: PDFPage,
  font: PDFFont,
  text: string,
  y: number,
  size: number,
  color: ReturnType<typeof rgb>,
): void {
  page.drawText(text, {
    x: centerX(page, text, size, font),
    y,
    size,
    font,
    color,
  });
}

function drawHRule(
  page: PDFPage,
  y: number,
  ruleWidth: number,
  color = C.rule,
  thickness = 0.5,
): void {
  const w = page.getWidth();
  const x1 = (w - ruleWidth) / 2;
  page.drawLine({
    start: { x: x1, y },
    end: { x: x1 + ruleWidth, y },
    thickness,
    color,
  });
}

async function drawCoverLogo(
  doc: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  topBaselineY: number,
): Promise<number> {
  const LOGO_W = 130;
  const LOGO_H = 42;
  const cx = page.getWidth() / 2;
  const candidates = [
    path.join(process.cwd(), "public", "brand", "logo.png"),
    path.join(process.cwd(), "public", "brand", "logo.jpg"),
    path.join(process.cwd(), "public", "logo.png"),
  ];

  for (const logoPath of candidates) {
    if (!fs.existsSync(logoPath)) continue;
    try {
      const bytes = fs.readFileSync(logoPath);
      const img = logoPath.endsWith(".jpg") || logoPath.endsWith(".jpeg")
        ? await doc.embedJpg(bytes)
        : await doc.embedPng(bytes);
      const scale = LOGO_W / img.width;
      const h = Math.min(LOGO_H, img.height * scale);
      const w = img.width * (h / img.height);
      page.drawImage(img, {
        x: cx - w / 2,
        y: topBaselineY - h,
        width: w,
        height: h,
      });
      return topBaselineY - h - 38;
    } catch {
      // try next path
    }
  }

  drawCentered(page, font, "AI FITNESS SOLUTION", topBaselineY - 14, 11, C.muted);
  return topBaselineY - 58;
}

/**
 * V3 Commercial Cover — 企业投标/商业 Proposal 封面（单页绘制入口）
 */
export async function drawCommercialCoverV3(
  doc: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  input: CommercialCoverInput,
): Promise<void> {
  const { width: W, height: H } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: 0,
    width: W,
    height: H,
    color: C.paper,
    borderWidth: 0,
  });

  let y = await drawCoverLogo(doc, page, font, H - 68);

  // —— 品牌层 ——
  drawCentered(page, font, "AI Fitness Solution", y, 27, C.brand);
  y -= 38;
  drawCentered(page, font, TENDER_DOC_SYSTEM, y, 11, C.muted);
  y -= 58;

  // —— 项目层 ——
  const volumeSubtitle =
    input.volumeSubtitle?.trim() || TENDER_PLAN_VOLUME_SUBTITLE;

  drawCentered(page, font, input.projectName, y, 19, C.ink);
  y -= 28;
  drawCentered(page, font, volumeSubtitle, y, 10, C.muted);
  y -= 46;

  // —— 文件类型层 ——
  drawHRule(page, y, 280);
  y -= 28;
  drawCentered(page, font, "正式投标文件", y, 17, C.ink);
  y -= 32;
  drawHRule(page, y, 280);
  y -= 42;

  // —— 元信息层 ——
  const metaLines = [
    `项目编号：${input.tenderNo}`,
    `投标单位：${input.companyName}`,
    `日期：${input.dateText}`,
  ];
  for (const line of metaLines) {
    drawCentered(page, font, line, y, 11, C.ink);
    y -= COVER_META_LINE_GAP;
  }

  drawTenderCoverConfidentialBlock(page, font, {
    baseY: COVER_CONFIDENTIAL_BASE_Y,
    centered: true,
  });
}

/**
 * 单页投标包封面 PDF（V3 商业版式）
 */
export async function renderTenderCoverPdf(
  input: CoverInput = {},
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(readFontBytes(), { subset: true });

  const companyName = String(input.companyName || "").trim() || "示例企业";
  const planId = String(input.planId || "").trim() || "attaguy-plan";
  const tenderNo =
    String(input.tenderNo || "").trim() ||
    `TF-${planId.slice(0, 8).toUpperCase()}`;
  const projectName =
    String(input.projectName || "").trim() || "企业健身空间建设项目";

  let rawDate = String(input.reportDate || "").trim();
  if (!rawDate) rawDate = String(input.ymd || "").trim();
  if (!rawDate) rawDate = String(input.date || "").trim();
  if (!rawDate) rawDate = todayYmd();

  const dateText =
    rawDate.length === 8 && /^\d{8}$/.test(rawDate)
      ? formatCoverDateIso(
          new Date(
            Number(rawDate.slice(0, 4)),
            Number(rawDate.slice(4, 6)) - 1,
            Number(rawDate.slice(6, 8)),
          ),
        )
      : rawDate.includes("-")
        ? rawDate
        : formatCoverDateIso();

  const page = doc.addPage([PAGE_W, PAGE_H]);
  await drawCommercialCoverV3(doc, page, font, {
    companyName,
    projectName,
    tenderNo,
    dateText,
  });

  return await doc.save();
}
