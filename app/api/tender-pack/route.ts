// app/api/tender-pack/route.ts
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import path from "path";
import fs from "fs/promises";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { parseTenderLevel, type TenderLevel } from "@/lib/pdf/presets";
import { scanTocAnchors } from "@/lib/pdf/tocAnchors";
import { logPdfDownloadSafe, getReqIp } from "@/lib/audit/pdfLog";
import { requireAndConsumeDownloadToken } from "@/lib/license";

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

function ymdHumanTokyo() {
  const fmt = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const d = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}年${m}月${d}日`;
}

function parseBool01(v: string | null, fallback: boolean) {
  const s = (v ?? "").trim();
  if (!s) return fallback;
  if (s === "0") return false;
  if (s === "1") return true;
  return fallback;
}

async function mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
  const merged = await PDFDocument.create();

  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  const bytes = await merged.save();
  return Buffer.from(bytes);
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
        `Upstream /api/pdf failed: ${res.status} ${res.statusText}${
          errText ? ` | ${errText.slice(0, 1200)}` : ""
        }`
      );
    }

    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } finally {
    clearTimeout(t);
  }
}

async function fetchReqSigHead(url: string) {
  const internalHeaders = getInternalPackHeaders();
  const res = await fetch(url, {
    method: "HEAD",
    cache: "no-store",
    headers: { Accept: "application/pdf", ...internalHeaders },
  });
  if (!res.ok) return null;
  const sig = (res.headers.get("x-reqsig") || res.headers.get("X-REQSIG") || "").trim();
  return sig || null;
}

async function tryReadFile(p: string) {
  try {
    return await fs.readFile(p);
  } catch {
    return null;
  }
}

async function assertPdfOk(bytes: Buffer, name: string) {
  if (!bytes || bytes.length < 1200) {
    throw new Error(`${name} too small (${bytes?.length ?? 0} bytes)`);
  }
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = doc.getPageCount();
    if (!pages || pages <= 0) throw new Error("0 pages");
    return pages;
  } catch (e: any) {
    throw new Error(`${name} is not a valid PDF: ${e?.message || String(e)}`);
  }
}

async function loadBrandAssets(doc: PDFDocument) {
  doc.registerFontkit(fontkit);

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansSC-Regular.ttf"
  );
  const fontBytes = await fs.readFile(fontPath);
  const font = await doc.embedFont(fontBytes, { subset: true });

  const logoPath = path.join(process.cwd(), "public", "brand", "logo.png");
  const logoBytes = await tryReadFile(logoPath);
  const logo = logoBytes ? await doc.embedPng(logoBytes) : null;

  return { font, logo };
}

/**
 * ✅ pack 预算 sections（预算不输出 footer，避免 merged 后双页码）
 */
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
  return [
    "header",
    "overall",
    "table",
    "pricing_terms",
    "delivery_terms",
    "payment_terms",
    "after_sales",
    "sign_seal",
    "attachments",
  ].join(",");
}

/**
 * ✅ V7：merged 后统一重打页码（packFooter=0 可关闭）
 * 页脚格式：左侧标书编号与投标人；右侧第 X 页 / 共 Y 页
 */
async function stampMergedPageNumbers(opts: {
  bytes: Buffer;
  skipFirstPages: number;
  footerLeft?: string;
  footerSigShort?: string; // ✅ 新增
}) {
  const { bytes, skipFirstPages, footerLeft, footerSigShort } = opts;

  const doc = await PDFDocument.load(bytes);
  doc.registerFontkit(fontkit);

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansSC-Regular.ttf"
  );
  const fontBytes = await fs.readFile(fontPath);
  const font = await doc.embedFont(fontBytes, { subset: true });

  const pages = doc.getPages();
  const total = pages.length;

  for (let i = 0; i < pages.length; i++) {
    const pageIndex1 = i + 1;
    if (pageIndex1 <= skipFirstPages) continue;

    const p = pages[i];
    const { width } = p.getSize();

    const text = `第 ${pageIndex1} 页 / 共 ${total} 页`;
    const size = 9;
    const y = 18;
    const leftX = 60;
    const rightX = width - 60;

    if (footerLeft) {
      p.drawText(footerLeft, {
        x: leftX,
        y,
        size,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });
    }

    const tw = font.widthOfTextAtSize(text, size);
    p.drawText(text, {
      x: rightX - tw,
      y,
      size,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });

    // ✅ 验真码：放在页码左侧
    const sigShort = (footerSigShort || "").trim();
    if (sigShort) {
      const sigText = `验真码：${sigShort}`;
      const sw = font.widthOfTextAtSize(sigText, size);
      // 放在页码左侧一点点
      p.drawText(sigText, {
        x: rightX - tw - 18 - sw,
        y,
        size,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });
    }
  }

  const out = await doc.save();
  return Buffer.from(out);
}

/**
 * ✅ V7：目录行（支持 L1/L2 字体层级、缩进、点线引导）
 */
function drawTocRowV7(opts: {
  page: any;
  font: any;
  x: number;
  y: number;
  left: string;
  right: string;
  maxWidth: number;
  level: 1 | 2;
}) {
  const { page, font, x, y, left, right, maxWidth, level } = opts;

  const leftText = left.trim();
  const rightText = right.trim();

  const sizeLeft = level === 1 ? 14 : 12;
  const sizeRight = 12;

  const indent = level === 1 ? 0 : 18;
  const xL = x + indent;

  const leftW = font.widthOfTextAtSize(leftText, sizeLeft);
  const rightW = font.widthOfTextAtSize(rightText, sizeRight);

  // 右侧页码贴右
  const rightX = x + maxWidth - rightW;
  page.drawText(rightText, {
    x: rightX,
    y,
    size: sizeRight,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  // 左侧标题
  page.drawText(leftText, {
    x: xL,
    y,
    size: sizeLeft,
    font,
    color: rgb(0.12, 0.12, 0.12),
  });

  // L2 才画点线引导（L1 不画，避免“像目录树”）
  if (level === 2) {
    const dotsStartX = xL + leftW + 10;
    const dotsEndX = rightX - 10;
    if (dotsEndX > dotsStartX) {
      const dotChar = "·";
      const dotW = font.widthOfTextAtSize(dotChar, sizeLeft);
      const maxDots = Math.floor((dotsEndX - dotsStartX) / dotW);
      const dots = dotChar.repeat(Math.max(0, Math.min(maxDots, 220)));
      page.drawText(dots, {
        x: dotsStartX,
        y,
        size: sizeLeft,
        font,
        color: rgb(0.68, 0.68, 0.68),
      });
    }
  }
}

type TocLine = {
  level: 1 | 2;
  title: string;
  page: number; // 统一合并页码（1-based）
};

/**
 * Helper: 统一 LOGO 顶部对齐绘制（封面/声明/目录都调用，保证同一基线与缩放）
 */
function drawLogoTopLeft(opts: {
  page: any;
  logo: any; // PDFImage (embedPng返回)
  marginX: number; // 左边距（你现在用 60）
  topY: number; // 距离页面顶部的"基线"位置（推荐 A4_H - 80）
  maxW: number; // 最大宽度（推荐 150~170）
}) {
  const { page, logo, marginX, topY, maxW } = opts;
  if (!logo) return;

  // 保持等比缩放，以 maxW 为宽上限
  const scale = Math.min(1, maxW / logo.width);
  const w = logo.width * scale;
  const h = logo.height * scale;

  // ✅ 统一基线：topY 是 logo 顶边位置，而不是 bottom
  const y = topY - h;
  page.drawImage(logo, { x: marginX, y, width: w, height: h });
}

/**
 * ✅ V7：封面 + 目录（2页）
 * - 封面标题更像“技术标”
 * - 目录自动编号（1.1/1.2/2.1/2.2）
 * - 字体层级：L1 14；L2 12
 */
async function buildCoverAndTocPdfV7(opts: {
  planId: string;
  companyName: string;
  bidderName: string;
  theme: string;
  watermark: string;
  tz: string;
  level: TenderLevel;
  tenderNo: string;

  pdfVersionPlan: string;
  pdfVersionBudget: string;
  planPages: number;
  budgetPages: number;

  includeDeclaration: boolean;
  declarationPages: number;

  tocLines: TocLine[];
  totalPages: number; // 合并阅读顺序总页数（最后一页的页码）
}) {
  const {
    planId,
    companyName,
    bidderName,
    theme,
    watermark,
    tz,
    level,
    tenderNo,
    pdfVersionPlan,
    pdfVersionBudget,
    planPages,
    budgetPages,
    includeDeclaration,
    declarationPages,
    tocLines,
    totalPages,
  } = opts;

  const doc = await PDFDocument.create();
  const { font, logo } = await loadBrandAssets(doc);

  const A4_W = 595.28;
  const A4_H = 841.89;

  const LOGO_MARGIN_X = 60;
  const LOGO_TOP_Y = A4_H - 70;
  const LOGO_MAX_W = 150;

  const dateYMD = ymdTokyo();
  const dateHuman = ymdHumanTokyo();

  // -------- 封面页 --------
  const cover = doc.addPage([A4_W, A4_H]);
  const marginX = 60;
  let y = A4_H - 80;

  if (logo) {
    drawLogoTopLeft({
      page: cover,
      logo,
      marginX: LOGO_MARGIN_X,
      topY: LOGO_TOP_Y,
      maxW: LOGO_MAX_W,
    });
  }

  // ✅ V7：技术标风格封面标题
  cover.drawText("企业健身房建设项目投标文件（技术部分）", {
    x: marginX,
    y: A4_H - 160, // ✅ 和 topY= A4_H-60 搭配，留足空间
    size: 24,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  const unitLine =
    companyName && companyName.trim()
      ? `招标单位：${companyName.trim()}`
      : `招标单位：${planId}`;
  cover.drawText(unitLine, {
    x: marginX,
    y: y - 140,
    size: 14,
    font,
    color: rgb(0.15, 0.15, 0.15),
  });

  cover.drawText(`投标人：${(bidderName || "AI Fitness Solution").trim()}`, {
    x: marginX,
    y: y - 168,
    size: 14,
    font,
    color: rgb(0.15, 0.15, 0.15),
  });

  const infoY = y - 235;
  const lines: Array<[string, string]> = [
    ["标书编号", tenderNo],
    ["生成日期", dateYMD],
    ["投标级别", level],
    ["主题", theme || "brand"],
    ["水印", watermark === "1" ? "启用" : "关闭"],
    ["时区", tz || "Asia/Tokyo"],
    ["方案版本", pdfVersionPlan],
    ["预算版本", pdfVersionBudget],
    ["方案页数", `共 ${planPages} 页`],
    ["预算页数", `共 ${budgetPages} 页`],
    ["声明函", includeDeclaration ? `包含（${declarationPages} 页）` : "不包含"],
  ];

  let infoLineY = infoY;
  for (const [k, v] of lines) {
    cover.drawText(`${k}：`, {
      x: marginX,
      y: infoLineY,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    cover.drawText(v, {
      x: marginX + 90,
      y: infoLineY,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    infoLineY -= 18;
  }

  // 签章区
  const boxW = 240;
  const boxH = 150;
  const boxX = A4_W - 60 - boxW;
  const boxY = 105;

  cover.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    borderWidth: 1,
    borderColor: rgb(0.6, 0.6, 0.6),
  });

  cover.drawText("签章区（盖章处）", {
    x: boxX + 12,
    y: boxY + boxH - 26,
    size: 12,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  cover.drawLine({
    start: { x: boxX, y: boxY + boxH - 34 },
    end: { x: boxX + boxW, y: boxY + boxH - 34 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  let sy = boxY + boxH - 62;
  const labelSize = 11;
  const lineGap = 24;
  const stampLines: Array<[string, string]> = [
    ["投标人（盖章）：", "__________________"],
    ["授权代表：", "__________________"],
    ["日期：", `${dateHuman}`],
  ];
  for (const [k, v] of stampLines) {
    cover.drawText(k, {
      x: boxX + 12,
      y: sy,
      size: labelSize,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    cover.drawText(v, {
      x: boxX + 92,
      y: sy,
      size: labelSize,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
    sy -= lineGap;
  }

  // ✅ V7.1：规范信息栏（评审/政府采购常用格式）
const infoBoxX = marginX;
const infoBoxW = A4_W - marginX * 2;
const infoBoxH = 170;
const infoBoxY = 290; // 位置可微调：越大越靠上

cover.drawRectangle({
  x: infoBoxX,
  y: infoBoxY,
  width: infoBoxW,
  height: infoBoxH,
  borderWidth: 1,
  borderColor: rgb(0.82, 0.82, 0.82),
});

cover.drawText("项目信息（填写/确认）", {
  x: infoBoxX + 12,
  y: infoBoxY + infoBoxH - 24,
  size: 12,
  font,
  color: rgb(0.18, 0.18, 0.18),
});

cover.drawLine({
  start: { x: infoBoxX, y: infoBoxY + infoBoxH - 32 },
  end: { x: infoBoxX + infoBoxW, y: infoBoxY + infoBoxH - 32 },
  thickness: 1,
  color: rgb(0.9, 0.9, 0.9),
});

let iy = infoBoxY + infoBoxH - 58;
const rowGap = 22;

const f = (label: string, value: string) => {
  cover.drawText(label, {
    x: infoBoxX + 14,
    y: iy,
    size: 11,
    font,
    color: rgb(0.22, 0.22, 0.22),
  });
  cover.drawText(value, {
    x: infoBoxX + 120,
    y: iy,
    size: 11,
    font,
    color: rgb(0.22, 0.22, 0.22),
  });
  iy -= rowGap;
};

const projectName = "企业健身房建设项目（技术标）";
f("项目名称：", projectName);
f("招标单位：", companyName?.trim() ? companyName.trim() : planId);
f("投标人：", (bidderName || "AI Fitness Solution").trim());
f("联系人：", "________________________");
f("联系电话：", "________________________");
f("联系地址：", "______________________________________________");

// ✅ V7.1：封面备注（更正式）
cover.drawText("说明：本文件为系统生成稿，正式递交前请核对项目信息、版本号与签章。", {
  x: marginX,
  y: 70,
  size: 10.2,
  font,
  color: rgb(0.38, 0.38, 0.38),
});

  // -------- 目录页 --------
  const toc = doc.addPage([A4_W, A4_H]);

  toc.drawText("目录", {
    x: marginX,
    y: A4_H - 90,
    size: 22,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  toc.drawText(`文件页码（合并阅读顺序）：总计 ${totalPages} 页`, {
    x: marginX,
    y: A4_H - 120,
    size: 11.5,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  const tocX = marginX;
  const tocW = A4_W - marginX * 2;
  let ty = A4_H - 170;

  const rowH_L1 = 28;
  const rowH_L2 = 24;

  for (const line of tocLines) {
    drawTocRowV7({
      page: toc,
      font,
      x: tocX,
      y: ty,
      left: line.title,
      right: String(line.page),
      maxWidth: tocW,
      level: line.level,
    });
    ty -= line.level === 1 ? rowH_L1 : rowH_L2;

    // 防止溢出：如果超出页面，宁可截断（你当前目录很短，不会触发）
    if (ty < 110) break;
  }

 // ✅ V7.1：页码口径说明（评审关心）
  toc.drawText("页码说明：本目录页码为“合并阅读顺序”的统一页码，用于评审引用与对照。", {
    x: marginX,
    y: 92,
    size: 10.5,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });
  toc.drawText("目录仅展示二级结构；章节内细项请在正文相应小节中查阅。", {
    x: marginX,
    y: 70,
    size: 10.5,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

/**
 * 声明与承诺函（1页）
 */
async function buildDeclarationPdf(opts: {
  planId: string;
  companyName: string;
  bidderName: string;
  tenderNo: string;
  pdfVersionPlan: string;
  pdfVersionBudget: string;
  planPages: number;
  budgetPages: number;
}) {
  const {
    planId,
    companyName,
    bidderName,
    tenderNo,
    pdfVersionPlan,
    pdfVersionBudget,
    planPages,
    budgetPages,
  } = opts;

  const doc = await PDFDocument.create();
  const { font, logo } = await loadBrandAssets(doc);

  const A4_W = 595.28;
  const A4_H = 841.89;
  const marginX = 60;

  const LOGO_MARGIN_X = 60;
  const LOGO_TOP_Y = A4_H - 70;
  const LOGO_MAX_W = 150;

  const dateHuman = ymdHumanTokyo();

  const page = doc.addPage([A4_W, A4_H]);

  if (logo) {
    drawLogoTopLeft({
      page,
      logo,
      marginX: LOGO_MARGIN_X,
      topY: LOGO_TOP_Y,
      maxW: LOGO_MAX_W,
    });
  }

  page.drawText("投标声明与承诺函", {
    x: marginX,
    y: A4_H - 140,
    size: 22,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  const unit = companyName?.trim() ? companyName.trim() : planId;
  const bidder = (bidderName || "AI Fitness Solution").trim();

  let y = A4_H - 190;

  page.drawText(`致：${unit}`, {
    x: marginX,
    y,
    size: 12.5,
    font,
    color: rgb(0.15, 0.15, 0.15),
  });
  y -= 26;

  const bodyLines = [
    `我们（投标人：${bidder}）就“企业健身房建设项目”投标事宜，郑重声明并承诺如下：`,
    "1. 我方已充分理解并接受贵方对本项目的相关要求，所提交资料真实、完整、有效。",
    "2. 我方保证投标文件中所列配置、报价及说明均为客观陈述，不含虚假或误导性内容。",
    "3. 若我方中标，将严格按约定组织实施，确保质量、安全与交付节点，接受贵方监督管理。",
    "4. 我方承诺遵守有关法律法规及贵方合规要求，承担相应责任与义务。",
    "",
    `附件文件版本：方案 ${pdfVersionPlan}（${planPages} 页），预算 ${pdfVersionBudget}（${budgetPages} 页）`,
    `标书编号：${tenderNo}`,
  ];

  const lineH = 18;
  for (const line of bodyLines) {
    page.drawText(line, {
      x: marginX,
      y,
      size: 11.5,
      font,
      color: rgb(0.18, 0.18, 0.18),
    });
    y -= lineH;
  }

  const boxW = 420;
  const boxH = 160;
  const boxX = marginX;
  const boxY = 110;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    borderWidth: 1,
    borderColor: rgb(0.6, 0.6, 0.6),
  });

  page.drawText("签章与确认", {
    x: boxX + 12,
    y: boxY + boxH - 26,
    size: 12,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawLine({
    start: { x: boxX, y: boxY + boxH - 34 },
    end: { x: boxX + boxW, y: boxY + boxH - 34 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  const leftX = boxX + 16;
  const rightX = boxX + 220;
  const startY = boxY + boxH - 64;

  page.drawText("投标人（盖章）：__________________", {
    x: leftX,
    y: startY,
    size: 11.5,
    font,
    color: rgb(0.25, 0.25, 0.25),
  });
  page.drawText("法定代表人/授权代表：______________", {
    x: leftX,
    y: startY - 26,
    size: 11.5,
    font,
    color: rgb(0.25, 0.25, 0.25),
  });
  page.drawText(`日期：${dateHuman}`, {
    x: leftX,
    y: startY - 52,
    size: 11.5,
    font,
    color: rgb(0.25, 0.25, 0.25),
  });

  page.drawRectangle({
    x: rightX,
    y: boxY + 18,
    width: boxX + boxW - 16 - rightX,
    height: 95,
    borderWidth: 1,
    borderColor: rgb(0.85, 0.85, 0.85),
  });
  page.drawText("（盖章区）", {
    x: rightX + 12,
    y: boxY + 18 + 95 - 22,
    size: 11,
    font,
    color: rgb(0.55, 0.55, 0.55),
  });

  page.drawText("注：本承诺函为投标文件组成部分。", {
    x: marginX,
    y: 70,
    size: 10.5,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

/**
 * ✅ V7：目录键（评审习惯：目录只到二级）
 * - 你只改这里的“显示文案”，不会影响 anchors
 */
const planKeysV7: Array<[string, string]> = [
  ["PLAN.EXEC_SUMMARY", "一、执行摘要"],
  ["PLAN.COMPARE", "二、方案总体对比说明"],
  ["PLAN.LITE", "三、方案一（基础型配置方案）"],
  ["PLAN.STANDARD", "四、方案二（推荐型配置方案）"],
  ["PLAN.PRO", "五、方案三（强化型配置方案）"],
  ["PLAN.APPENDIX_A", "附录 A：器材明细表"],
  ["PLAN.APPENDIX_B", "附录 B：品牌建议说明"],
  ["PLAN.APPENDIX_C", "附录 C：补充说明"],
  ["PLAN.APPENDIX_D", "附录 D：其他说明"],
];

const budgetKeysV7: Array<[string, string]> = [
  ["BUDGET.OVERVIEW", "一、整体预算区间（参考）"],
  ["BUDGET.BREAKDOWN", "二、分品类预算明细表"],
];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;

    const planId = (sp.get("planId") || "").trim();
    if (!planId) return json(400, "MISSING_PLAN_ID", "Missing planId");

    const format = (sp.get("format") || "links").trim().toLowerCase();

    const theme = (sp.get("theme") || "brand").trim();
    const watermark = (sp.get("watermark") || "0").trim();
    const tz = (sp.get("tz") || "Asia/Tokyo").trim();

    const pdfVersionPlan = (sp.get("pdfVersionPlan") || "PLAN_V1").trim();
    const pdfVersionBudget = (sp.get("pdfVersionBudget") || "BUDGET_V1").trim();

    const level = parseTenderLevel(sp.get("level"));

    const packFooter = parseBool01(sp.get("packFooter"), true);

    const includeCoverDefault = level === "saas" ? "0" : "1";
    const includeDeclarationDefault = level === "saas" ? "0" : "1";

    const includeCover =
      (sp.get("includeCover") || includeCoverDefault).trim() !== "0";
    const includeDeclarationRaw =
      (sp.get("includeDeclaration") || includeDeclarationDefault).trim() !== "0";
    const includeDeclaration =
      level === "government" ? true : includeDeclarationRaw;

    const companyName = (sp.get("companyName") || "").trim();
    const bidderName = (sp.get("bidderName") || "AI Fitness Solution").trim();

    const downloadToken = (sp.get("downloadToken") || "").trim();

    const origin = url.origin;

    const date = ymdTokyo();
    const tenderNo = `TENDER-${asciiSafeFilename(planId)}-${date}`;

    const baseCommon: Record<string, string> = {
      planId,
      theme,
      watermark,
      tz,
      level,
    };
    // ✅ 不把 downloadToken 透传给 /api/pdf，pack 内部 fetch 走 X-INTERNAL-PACK 信任头

    const planPdfUrl = new URL(`${origin}/api/pdf`);
    Object.entries({
      ...baseCommon,
      mode: "full",
      pdfVersionPlan,
      pdfVersion: pdfVersionPlan, // backward compat
    }).forEach(([k, v]) => planPdfUrl.searchParams.set(k, v));

    const packBudgetSections = budgetSectionsForPack(level);
    const budgetPdfUrl = new URL(`${origin}/api/pdf`);
    Object.entries({
      ...baseCommon,
      mode: "budget",
      sections: packBudgetSections,
      pdfVersionBudget,
      pdfVersion: pdfVersionBudget, // backward compat
    }).forEach(([k, v]) => budgetPdfUrl.searchParams.set(k, v));

    if (format === "links") {
      return NextResponse.json({
        ok: true,
        level,
        tenderNo,
        includeCover,
        includeDeclaration,
        packFooter,
        plan: planPdfUrl.toString(),
        budget: budgetPdfUrl.toString(),
        budgetSections: packBudgetSections,
      });
    }

    if (format !== "zip" && format !== "merged") {
      return json(
        400,
        "BAD_FORMAT",
        `Unknown format: ${format} (use format=links | zip | merged)`
      );
    }

    // ✅ 包级别扣一次：只校验/消耗 pack token，失败即 403
    const ip = getReqIp(req as any);
    const ua = req.headers.get("user-agent") || "";
    const fp = [
      planId,
      "pack",
      (ip || "noip").split(",")[0].trim(),
      (ua || "noua").slice(0, 80),
    ].join("|");

    const c = await requireAndConsumeDownloadToken({
      downloadToken,
      planId,
      mode: "pack",
      fingerprint: fp,
      ip,
      ua,
    });
    if (!c.ok) return json(403, c.code, `download token rejected: ${c.code}`, c);

    const [planBytes, budgetBytes] = await Promise.all([
      fetchPdfBytes(planPdfUrl.toString()),
      fetchPdfBytes(budgetPdfUrl.toString()),
    ]);

    // ✅ 从上游 HEAD 读取验真码（优先预算）
    const [planReqSig, budgetReqSig] = await Promise.all([
      fetchReqSigHead(planPdfUrl.toString()),
      fetchReqSigHead(budgetPdfUrl.toString()),
    ]);

    const sig = (budgetReqSig || planReqSig || "").trim();
    const sigShort = sig ? sig.slice(0, 8).toUpperCase() : "";

    const [planPages, budgetPages] = await Promise.all([
      assertPdfOk(planBytes, "plan"),
      assertPdfOk(budgetBytes, "budget"),
    ]);

    const declarationPages = includeDeclaration ? 1 : 0;
    const coverPages = includeCover ? 2 : 0; // ✅ V7 仍然固定 2 页：封面+目录
    const declPages = includeDeclaration ? 1 : 0;

    // ✅ 合并阅读顺序的起始页码
    const planStartPage = coverPages + declPages + 1;
    const budgetStartPage = planStartPage + planPages;

    // ✅ 分别扫描 anchors（更稳，不做 probe 合并）
    const planDoc = await PDFDocument.load(planBytes);
    const budgetDoc = await PDFDocument.load(budgetBytes);
    const planAnchorLocal = scanTocAnchors(planDoc); // {key: page(1-based-in-plan)}
    const budgetAnchorLocal = scanTocAnchors(budgetDoc);

    const absPageOf = (part: "plan" | "budget", key: string, fallback: number) => {
      if (part === "plan") {
        const p = (planAnchorLocal as any)?.[key];
        return typeof p === "number" && p > 0 ? (planStartPage - 1 + p) : fallback;
      }
      const p = (budgetAnchorLocal as any)?.[key];
      return typeof p === "number" && p > 0 ? (budgetStartPage - 1 + p) : fallback;
    };

    // ✅ V7：组装目录行（L1/L2）+ 自动编号（1.* / 2.*）
    const tocLines: TocLine[] = [];

    // L1：技术方案部分
    tocLines.push({ level: 1, title: "1  技术方案部分", page: planStartPage });

    // L2：方案二级条目（已经是“一、二、三…”风格）
    for (const [k, label] of planKeysV7) {
      const page = absPageOf("plan", k, planStartPage);
      tocLines.push({ level: 2, title: `1.${tocLines.filter((t) => t.level === 2 && t.title.startsWith("1.")).length + 1}  ${label}`, page });
    }

    // L1：预算与报价
    tocLines.push({ level: 1, title: "2  预算与报价", page: budgetStartPage });

    // L2：预算二级条目
    const startCount2 = tocLines.filter((t) => t.level === 2 && t.title.startsWith("2.")).length;
    for (const [k, label] of budgetKeysV7) {
      const page = absPageOf("budget", k, budgetStartPage);
      const idx = tocLines.filter((t) => t.level === 2 && t.title.startsWith("2.")).length + 1;
      tocLines.push({ level: 2, title: `2.${idx}  ${label}`, page });
    }

    // ✅ 合并阅读顺序总页数（最后一页页码）
    const totalPages = coverPages + declPages + planPages + budgetPages;

    // ✅ merged
    if (format === "merged") {
      const buffers: Buffer[] = [];

      if (includeCover) {
        const coverBytes = await buildCoverAndTocPdfV7({
          planId,
          companyName: companyName || planId,
          bidderName,
          theme,
          watermark,
          tz,
          level,
          tenderNo,
          pdfVersionPlan,
          pdfVersionBudget,
          planPages,
          budgetPages,
          includeDeclaration,
          declarationPages,
          tocLines,
          totalPages,
        });
        buffers.push(coverBytes);
      }

      if (includeDeclaration) {
        const declBytes = await buildDeclarationPdf({
          planId,
          companyName: companyName || planId,
          bidderName,
          tenderNo,
          pdfVersionPlan,
          pdfVersionBudget,
          planPages,
          budgetPages,
        });
        buffers.push(declBytes);
      }

      buffers.push(planBytes, budgetBytes);

      let mergedBytes = await mergePdfBuffers(buffers);

      const skipFirstPages = (includeCover ? 2 : 0) + (includeDeclaration ? 1 : 0);

      if (packFooter) {
        mergedBytes = await stampMergedPageNumbers({
          bytes: mergedBytes,
          skipFirstPages,
          footerLeft: `标书编号：${tenderNo} · 投标人：${bidderName || "AI Fitness Solution"}`,
          footerSigShort: sigShort,
        });
      }

      const safePlanId = asciiSafeFilename(planId);
      const filename = `AI_Fitness_Solution_Tender_Merged-${level}-${safePlanId}-${date}.pdf`;

      // ✅ 日志记录（仅 GET）
      if (req.method === "GET") {
        const ip = getReqIp(req as any);
        const ua = req.headers.get("user-agent") || null;

        await logPdfDownloadSafe({
          planId,
          route: "/api/tender-pack",
          method: "GET",
          mode: null,
          level,
          format: "merged",
          theme,
          pdfVersion: null,
          planVersion: pdfVersionPlan,
          budgetVersion: pdfVersionBudget,
          reqsig: sig || null,
          docSeq: null,
          pages: totalPages || null,
          bytes: mergedBytes.length,
          ip,
          ua,
          extra: {
            tenderNo,
            includeCover,
            includeDeclaration,
            packFooter,
            packBudgetSections,
            watermark,
            tz,
          },
        });
      }

      return new NextResponse(mergedBytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${asciiSafeFilename(filename)}"`,
          "Cache-Control": "no-store",

          // ✅ V7 指纹
          "X-TENDER-PACK": "MERGED_TENDER_V7_REVIEWSTYLE_TOC",
          "X-TENDER-LEVEL": level,
          "X-TENDER-NO": tenderNo,
          "X-PLAN-VERSION": pdfVersionPlan,
          "X-BUDGET-VERSION": pdfVersionBudget,
          "X-PLAN-PAGES": String(planPages),
          "X-BUDGET-PAGES": String(budgetPages),
          "X-INCLUDE-COVER": includeCover ? "1" : "0",
          "X-INCLUDE-DECLARATION": includeDeclaration ? "1" : "0",
          "X-PACK-BUDGET-SECTIONS": packBudgetSections,
          "X-PACK-PAGINATION": packFooter ? "1" : "0",
          "X-PACK-SKIP-FIRST": String(skipFirstPages),
          "X-PACK-FOOTER": packFooter ? "1" : "0",
        },
      });
    }

    // ✅ zip（独立文件不重打页码）
    const zip = new JSZip();
    const safePlanId = asciiSafeFilename(planId);

    if (includeCover) {
      const coverBytes = await buildCoverAndTocPdfV7({
        planId,
        companyName: companyName || planId,
        bidderName,
        theme,
        watermark,
        tz,
        level,
        tenderNo,
        pdfVersionPlan,
        pdfVersionBudget,
        planPages,
        budgetPages,
        includeDeclaration,
        declarationPages,
        tocLines,
        totalPages,
      });
      zip.file(`00-封面与目录-${level}-${safePlanId}-${date}.pdf`, coverBytes);
    }

    zip.file(`01-技术方案-${level}-${safePlanId}-${date}.pdf`, planBytes);
    zip.file(`02-预算与报价-${level}-${safePlanId}-${date}.pdf`, budgetBytes);

    if (includeDeclaration) {
      const declBytes = await buildDeclarationPdf({
        planId,
        companyName: companyName || planId,
        bidderName,
        tenderNo,
        pdfVersionPlan,
        pdfVersionBudget,
        planPages,
        budgetPages,
      });
      zip.file(`03-投标声明与承诺函-${level}-${safePlanId}-${date}.pdf`, declBytes);
    }

    zip.file(
      "MANIFEST.txt",
      [
        `planId=${planId}`,
        `companyName=${companyName || ""}`,
        `bidderName=${bidderName}`,
        `level=${level}`,
        `tenderNo=${tenderNo}`,
        `theme=${theme}`,
        `watermark=${watermark}`,
        `tz=${tz}`,
        `pdfVersionPlan=${pdfVersionPlan}`,
        `pdfVersionBudget=${pdfVersionBudget}`,
        `planPages=${planPages}`,
        `budgetPages=${budgetPages}`,
        `includeCover=${includeCover ? "1" : "0"}`,
        `includeDeclaration=${includeDeclaration ? "1" : "0"}`,
        `packBudgetSections=${packBudgetSections}`,
        `packFooter(merged-only)=${packFooter ? "1" : "0"}`,
        `generatedAt=${new Date().toISOString()}`,
      ].join("\n")
    );

    const zipBytes = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const zipFilename = `AI_Fitness_Solution_Tender_Pack-${level}-${safePlanId}-${date}.zip`;

    // ✅ 日志记录（仅 GET）
    if (req.method === "GET") {
      const ip = getReqIp(req as any);
      const ua = req.headers.get("user-agent") || null;

      await logPdfDownloadSafe({
        planId,
        route: "/api/tender-pack",
        method: "GET",
        mode: null,
        level,
        format: "zip",
        theme,
        pdfVersion: null,
        planVersion: pdfVersionPlan,
        budgetVersion: pdfVersionBudget,
        reqsig: sig || null,
        docSeq: null,
        pages: totalPages || null,
        bytes: zipBytes.length,
        ip,
        ua,
        extra: {
          tenderNo,
          includeCover,
          includeDeclaration,
          packBudgetSections,
        },
      });
    }

    return new NextResponse(zipBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${asciiSafeFilename(zipFilename)}"`,
        "Cache-Control": "no-store",
        "X-TENDER-PACK": "ZIP_TENDER_V7_REVIEWSTYLE_TOC",
        "X-TENDER-LEVEL": level,
        "X-TENDER-NO": tenderNo,
        "X-PLAN-VERSION": pdfVersionPlan,
        "X-BUDGET-VERSION": pdfVersionBudget,
        "X-PLAN-PAGES": String(planPages),
        "X-BUDGET-PAGES": String(budgetPages),
        "X-INCLUDE-COVER": includeCover ? "1" : "0",
        "X-INCLUDE-DECLARATION": includeDeclaration ? "1" : "0",
        "X-PACK-BUDGET-SECTIONS": packBudgetSections,
      },
    });
  } catch (e: any) {
    return json(500, "TENDER_PACK_ERROR", e?.message || "Internal error", {
      name: e?.name,
      stack: e?.stack,
    });
  }
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

    const format = (sp.get("format") || "links").trim().toLowerCase();
    const theme = (sp.get("theme") || "brand").trim();
    const watermark = (sp.get("watermark") || "0").trim();
    const tz = (sp.get("tz") || "Asia/Tokyo").trim();

    const pdfVersionPlan = (sp.get("pdfVersionPlan") || "PLAN_V1").trim();
    const pdfVersionBudget = (sp.get("pdfVersionBudget") || "BUDGET_V1").trim();

    const level = parseTenderLevel(sp.get("level"));
    const packFooter = parseBool01(sp.get("packFooter"), true);

    const includeCoverDefault = level === "saas" ? "0" : "1";
    const includeDeclarationDefault = level === "saas" ? "0" : "1";

    const includeCover =
      (sp.get("includeCover") || includeCoverDefault).trim() !== "0";
    const includeDeclarationRaw =
      (sp.get("includeDeclaration") || includeDeclarationDefault).trim() !== "0";
    const includeDeclaration =
      level === "government" ? true : includeDeclarationRaw;

    const date = ymdTokyo();
    const tenderNo = `TENDER-${asciiSafeFilename(planId)}-${date}`;

    const packBudgetSections = budgetSectionsForPack(level);

    // 这里不做任何 fetch，所以 planPages/budgetPages/skipFirst 无法精确
    // ✅ 但 Engine 验收的关键是：编号、级别、sections、分页开关、包含项等
    const skipFirstPages = (includeCover ? 2 : 0) + (includeDeclaration ? 1 : 0);

    // content-type / disposition：按 format 返回
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

        // ✅ 与 GET 对齐的验收 headers（轻量版）
        "X-TENDER-PACK": format === "merged"
          ? "MERGED_TENDER_V7_REVIEWSTYLE_TOC"
          : format === "zip"
            ? "ZIP_TENDER_V7_REVIEWSTYLE_TOC"
            : "LINKS_TENDER_V7_REVIEWSTYLE_TOC",
        "X-TENDER-LEVEL": level,
        "X-TENDER-NO": tenderNo,
        "X-PLAN-VERSION": pdfVersionPlan,
        "X-BUDGET-VERSION": pdfVersionBudget,
        "X-INCLUDE-COVER": includeCover ? "1" : "0",
        "X-INCLUDE-DECLARATION": includeDeclaration ? "1" : "0",
        "X-PACK-BUDGET-SECTIONS": packBudgetSections,
        "X-PACK-PAGINATION": packFooter ? "1" : "0",
        "X-PACK-SKIP-FIRST": String(skipFirstPages),
        "X-PACK-FOOTER": packFooter ? "1" : "0",

        // 可选：把 theme/watermark/tz 也暴露给验收面板（不会影响现有 GET）
        "X-PACK-THEME": theme || "brand",
        "X-PACK-WATERMARK": watermark === "1" ? "1" : "0",
        "X-PACK-TZ": tz,
      },
    });
  } catch (e: any) {
    return new NextResponse(null, { status: 500 });
  }
}