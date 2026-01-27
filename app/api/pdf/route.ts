export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import { notify } from "@/lib/notify";
import { Plan } from "@/lib/types/plan";
import { loadPlanJson, savePlanPdf, savePlanJson } from "@/lib/storage/plan-storage";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/auth";
import { requireEmailFromSession } from "@/lib/session";
import { deepSnakeToCamel } from "@/lib/plan-utils";
import { validateAndConsumeLicenseKey } from "@/lib/license";
import { logPdfDownload } from "@/lib/pdf/audit";
import { maskToken } from "@/lib/mask";

function tokenError(
  status: number,
  code: string,
  message: string
) {
  return NextResponse.json(
    { ok: false, code, message },
    { status }
  );
}

/**
 * 开发期绕过支付门禁（仅用于本地开发）
 * 
 * ⚠️ 生产环境安全要求：
 * - 不设置 PDF_PAYWALL_BYPASS
 * - 或设置为 PDF_PAYWALL_BYPASS=0
 * 
 * 只有明确设置为 "1" 时才会绕过，其他值（包括未设置、"0"）都会返回 false
 */
function shouldBypassPaywall(planId: string) {
  if (process.env.PDF_PAYWALL_BYPASS !== "1") return false;

  const allow = (process.env.PDF_BYPASS_PLAN_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  // 没配置 allowlist -> 全部绕过（开发期更方便）
  if (allow.length === 0) return true;

  // 配了 allowlist -> 仅指定 planId 绕过
  return allow.includes(planId);
}

function splitList(v?: string) {
  return (v || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * 销售授权（不改 DB 结构，先用环境变量白名单）
 * - PDF_SALES_ALLOW_EMAILS: 允许下载 full 的邮箱列表（逗号分隔）
 * - PDF_SALES_ALLOW_PLAN_IDS: 允许下载 full 的 planId 列表（逗号分隔，可为空表示不限制 planId）
 */
function isSalesAuthorized(params: { email: string; planId: string }) {
  const allowEmails = splitList(process.env.PDF_SALES_ALLOW_EMAILS);
  if (allowEmails.length === 0) return false;
  if (!allowEmails.includes(params.email)) return false;

  const allowPlans = splitList(process.env.PDF_SALES_ALLOW_PLAN_IDS);
  if (allowPlans.length === 0) return true; // 不限制 planId
  return allowPlans.includes(params.planId);
}

async function requireEmail() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;
  if (!raw) return null;

  const tokenHash = sha256(`${raw}:${process.env.SESSION_SECRET ?? "sess"}`);
  const sess = await (prisma as any).session.findUnique({ where: { tokenHash } });
  if (!sess || sess.expiresAt <= new Date()) return null;

  return sess.email;
}

// ✅ 二选一：用 Prisma 的 isOrderPaid 或 SQL 的 isOrderPaid
// import { isOrderPaid } from "@/lib/order";      // Prisma 版 - 临时注释，先走 emailToken 验证
// import { isOrderPaid } from "@/lib/order-sql";  // SQL 版

const SECRET = process.env.EMAIL_TOKEN_SECRET || "";

function verifyEmailToken(token?: string | null) {
  if (!token) return { ok: false, reason: "missing_email_token" };
  if (!SECRET) return { ok: false, reason: "EMAIL_TOKEN_SECRET_missing" };

  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "bad_format" };

  const [b64, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET).update(b64).digest("hex");
  if (sig !== expected) return { ok: false, reason: "bad_sig" };

  const raw = Buffer.from(b64, "base64url").toString("utf8"); // email|exp
  const [email, expStr] = raw.split("|");
  const exp = Number(expStr);
  if (!email || !exp) return { ok: false, reason: "bad_payload" };
  if (Date.now() > exp) return { ok: false, reason: "expired" };

  return { ok: true, email };
}

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

async function requirePdfAccess(req: Request, planId: string) {
  // 0) 开发期可全放行（可选）
  if (shouldBypassPaywall(planId)) {
    return { ok: true as const, reason: "bypass" as const };
  }

  // 1) 读取 URL 上的 licenseKey
  const url = new URL(req.url);
  const licenseKey = (url.searchParams.get("licenseKey") || "").trim();

  // 2) ✅ 直接在代码里设置开发授权码（最简单、100%可用）
  //    你想加更多就继续逗号分隔即可
  const DEV_KEYS = ["test-key-123", "dev-key-456"];

  const licenseOk = licenseKey ? DEV_KEYS.includes(licenseKey) : false;

  // 3) paid：查订单是否已支付（保留）
  const paid = await prisma.order.findFirst({
    where: { planId, status: "PAID" },
    select: { id: true },
  });

  // ✅ 放行条件：已支付 或 授权码
  if (paid || licenseOk) {
    return { ok: true as const, reason: paid ? "paid" : "license" as const };
  }

  return {
    ok: false as const,
    paid: Boolean(paid),
    licenseOk,
    need: "PAY_OR_LICENSE" as const,
  };
}

type PlanInput = {
  companySize?: string;
  area?: string;
  scenario?: string;
  budget?: string;
  country?: string;
};

type PlanResult = {
  summary?: string[] | string;
  equipmentList?: any[];
};

function formatDateYYYYMMDD(d = new Date()) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function genProposalNo() {
  const date = formatDateYYYYMMDD().replaceAll("-", "");
  const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `ATG-${date}-${rnd}`;
}
function safeReadPublicFile(relFromPublic: string) {
  const p = path.join(process.cwd(), "public", relFromPublic);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}

// 中文/英文通用换行：按字符累积测宽
function wrapTextToLines(params: { text: string; font: any; size: number; maxWidth: number }) {
  const { text, font, size, maxWidth } = params;
  const lines: string[] = [];
  if (!text) return lines;
  let cur = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const test = cur + ch;
    const w = font.widthOfTextAtSize(test, size);
    if (w <= maxWidth) cur = test;
    else {
      if (cur === "") {
        lines.push(test);
        cur = "";
      } else {
        lines.push(cur);
        cur = ch;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawLines(page: any, opts: {
  lines: string[];
  x: number;
  y: number;
  size: number;
  font: any;
  lineHeight: number;
  color?: any;
}) {
  const { lines, x, y, size, font, lineHeight, color } = opts;
  let yy = y;
  for (const line of lines) {
    page.drawText(line, { x, y: yy, size, font, color: color ?? rgb(0, 0, 0) });
    yy -= lineHeight;
  }
  return yy;
}

function drawHr(page: any, x: number, y: number, w: number) {
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: 1, color: rgb(0.88, 0.88, 0.88) });
}

function safeArr<T>(v: any, fallback: T[]): T[] {
  return Array.isArray(v) ? v : fallback;
}

/**
 * 工程类 CTA 判断函数
 * 用于判断是否在 PDF 中显示工程类扩展服务区块
 */
const ENGINEERING_KEYWORDS = [
  "篮球",
  "足球",
  "匹克球",
  "网球",
  "羽毛球",
  "球场",
  "地坪",
  "硅PU",
  "EPDM",
  "丙烯酸",
  "室外",
  "园区",
  "操场",
];

function shouldShowEngineeringCTA(plan: Plan): boolean {
  const scope = plan.client_profile.potential_scope ?? [];
  const scene = plan.client_profile.scene ?? "";
  const size = plan.client_profile.company_size ?? 0;

  const scopeHit = scope.some((s) => ENGINEERING_KEYWORDS.some((k) => s.includes(k)));
  const sceneHit = ENGINEERING_KEYWORDS.some((k) => scene.includes(k));
  const sizeHit = size >= 500; // 先保守阈值

  return scopeHit || sceneHit || sizeHit;
}

function drawHeaderFooter(opts: {
  page: any;
  pageW: number;
  pageH: number;
  marginX: number;
  font: any;
  fontBold?: any;
  text: { left: string; right: string; footerLeft: string; pageNo: number; pageTotal?: number };
}) {
  const { page, pageW, pageH, marginX, font, text } = opts;

  // 顶部细线
  page.drawLine({
    start: { x: marginX, y: pageH - 36 },
    end: { x: pageW - marginX, y: pageH - 36 },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.88),
  });

  // Header 左右
  page.drawText(text.left, {
    x: marginX,
    y: pageH - 26,
    size: 9,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  const rightW = font.widthOfTextAtSize(text.right, 9);
  page.drawText(text.right, {
    x: pageW - marginX - rightW,
    y: pageH - 26,
    size: 9,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  // Footer 线
  page.drawLine({
    start: { x: marginX, y: 36 },
    end: { x: pageW - marginX, y: 36 },
    thickness: 1,
    color: rgb(0.88, 0.88, 0.88),
  });

  // Footer 左
  page.drawText(text.footerLeft, {
    x: marginX,
    y: 22,
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  // Footer 右（页码）
  const pageStr = text.pageTotal ? `${text.pageNo} / ${text.pageTotal}` : `${text.pageNo}`;
  const pageWText = font.widthOfTextAtSize(pageStr, 9);
  page.drawText(pageStr, {
    x: pageW - marginX - pageWText,
    y: 22,
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });
}

function drawSectionTitle(opts: {
  page: any;
  x: number;
  y: number;
  title: string;
  fontBold: any;
  font: any;
}) {
  const { page, x, y, title, fontBold } = opts;

  page.drawText(title, {
    x,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 标题下划线
  page.drawLine({
    start: { x, y: y - 10 },
    end: { x: x + 520, y: y - 10 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  return y - 28;
}

function buildExecutiveSummary(input: PlanInput, result: PlanResult): string[] {
  let arr: string[] = [];
  const s = (result as any)?.summary;

  if (Array.isArray(s)) {
    arr = s.map(String).map(x => x.trim()).filter(Boolean);
  } else if (typeof s === "string") {
    arr = s.split(/\r?\n+|[。；;]+/).map(x => x.trim()).filter(Boolean);
  }

  const derived: string[] = [
    `适用于${input.companySize ? `${input.companySize}人规模` : "企业"}的${input.scenario ?? "办公"}健身空间。`,
    `建议面积约${input.area ?? "—"}㎡即可落地基础有氧+力量配置。`,
    `预算建议控制在${input.budget ?? "—"}，优先保障核心器械的耐用性与安全性。`,
    `空间分区优先：有氧区 + 基础力量区 + 拉伸/康复区，保证动线不冲突。`,
    `可按 7/30/90 天分阶段落地：确认需求 → 采购安装 → 运营优化。`,
  ];

  const merged: string[] = [];
  const pushUniq = (x: string) => {
    const t = x.trim();
    if (!t) return;
    if (!merged.includes(t)) merged.push(t);
  };

  for (const x of arr) pushUniq(x);
  for (const x of derived) pushUniq(x);

  return merged.slice(0, 5);
}

async function drawCoverPage(opts: {
  pdfDoc: PDFDocument;
  font: any;
  logoBytes?: Uint8Array | null;
  brand: string;
  proposalTitle: string;
  clientLine: string;
  dateStr: string;
  proposalNo: string;
  input: PlanInput;
}) {
  const { pdfDoc, font, logoBytes, brand, proposalTitle, clientLine, dateStr, proposalNo, input } = opts;

  const pageW = 595.28;
  const pageH = 841.89;
  const marginX = 56;
  const page = pdfDoc.addPage([pageW, pageH]);

  // 顶部淡色条
  page.drawRectangle({ x: 0, y: pageH - 140, width: pageW, height: 140, color: rgb(0.97, 0.97, 0.97) });

  // Logo
  if (logoBytes) {
    try {
      const logo = await pdfDoc.embedPng(logoBytes);
      const targetH = 34;
      const scale = targetH / logo.height;
      page.drawImage(logo, {
        x: marginX,
        y: pageH - 92,
        width: logo.width * scale,
        height: targetH,
      });
    } catch {
      page.drawText(brand, { x: marginX, y: pageH - 85, size: 18, font });
    }
  } else {
    page.drawText(brand, { x: marginX, y: pageH - 85, size: 18, font });
  }

  // 标题
  page.drawText(proposalTitle, { x: marginX, y: pageH - 230, size: 28, font, color: rgb(0.12, 0.12, 0.12) });
  page.drawText(clientLine, { x: marginX, y: pageH - 268, size: 14, font, color: rgb(0.35, 0.35, 0.35) });

  // 信息卡片
  const cardX = marginX;
  const cardY = pageH - 440;
  const cardW = pageW - marginX * 2;
  const cardH = 150;

  page.drawRectangle({
    x: cardX, y: cardY, width: cardW, height: cardH,
    borderWidth: 1, borderColor: rgb(0.88, 0.88, 0.88), color: rgb(1, 1, 1),
  });

  const lines = [
    `公司规模：${input.companySize ?? "未填写"}`,
    `面积：${input.area ?? "未填写"}`,
    `场景：${input.scenario ?? "未填写"}`,
    `预算：${input.budget ?? "未填写"}`,
  ];

  let yy = cardY + cardH - 40;
  for (const line of lines) {
    page.drawText(line, { x: cardX + 18, y: yy, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
    yy -= 26;
  }

  // 底部信息
  page.drawText(`生成日期：${dateStr}`, { x: marginX, y: 80, size: 11, font, color: rgb(0.45, 0.45, 0.45) });
  page.drawText(`方案编号：${proposalNo}`, { x: marginX, y: 58, size: 11, font, color: rgb(0.45, 0.45, 0.45) });
}


function normalizeEquipment(result: PlanResult) {
  const list = result?.equipmentList?.length
    ? result.equipmentList
    : [
        { category: "有氧", name: "跑步机（商用）", qty: 2, purpose: "日常心肺训练", budget: "¥—" },
        { category: "力量", name: "史密斯机", qty: 1, purpose: "基础复合训练", budget: "¥—" },
        { category: "自由力量", name: "可调哑铃组", qty: 1, purpose: "覆盖多关节/孤立训练", budget: "¥—" },
      ];

  return list.map((x: any) => ({
    category: x.category ?? "—",
    name: x.name ?? x.title ?? "—",
    qty: Number(x.qty ?? 1),
    purpose: x.purpose ?? x.why ?? "—",
    budget: x.budget ?? "¥—",
  }));
}

function drawTable(page: any, opts: {
  font: any;
  x: number;
  y: number;
  w: number;
  header: string[];
  rows: string[][];
  colWidths: number[];
  fontSize: number;
  lineHeight: number;
  paddingY: number;
}) {
  const { font, x, y, w, header, rows, colWidths, fontSize, lineHeight, paddingY } = opts;

  const sum = colWidths.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - w) > 0.5) {
    // 列宽不等于表格宽：强制按比例缩放到刚好等于 w
    const scale = w / sum;
    for (let i = 0; i < colWidths.length; i++) colWidths[i] = colWidths[i] * scale;
  }

  let curY = y;

  const drawRow = (cells: string[], isHeader: boolean) => {
    const wrapped = cells.map((t, i) => {
      const maxW = colWidths[i] - 12;
      return wrapTextToLines({ text: String(t ?? ""), font, size: fontSize, maxWidth: maxW });
    });
    const maxLines = Math.max(...wrapped.map(a => a.length), 1);
    const rowH = maxLines * lineHeight + paddingY * 2;

    if (isHeader) {
      page.drawRectangle({ x, y: curY - rowH, width: w, height: rowH, color: rgb(0.97, 0.97, 0.97) });
    }

    let curX = x;
    for (let i = 0; i < cells.length; i++) {
      const cw = colWidths[i];
      page.drawRectangle({
        x: curX,
        y: curY - rowH,
        width: cw,
        height: rowH,
        borderWidth: 1,
        borderColor: rgb(0.9, 0.9, 0.9),
      });

      let ty = curY - paddingY - fontSize;
      for (const line of wrapped[i]) {
        page.drawText(line, { x: curX + 6, y: ty, size: fontSize, font, color: rgb(0.15, 0.15, 0.15) });
        ty -= lineHeight;
      }
      curX += cw;
    }

    curY -= rowH;
  };

  drawRow(header, true);
  for (const r of rows) drawRow(r, false);

  return curY;
}

// 3️⃣ 生成 PDF 的核心函数
async function generatePDF(plan: any, originalPlan?: Plan): Promise<Uint8Array> {
  const summary = plan.summary;
  const equipmentList = plan.equipmentList;
  const layout = plan.layoutPlan;
  const addons = plan.addons;
  const clientProfile = plan.clientProfile || {};

  const brand = "Attaguy";
  const dateStr = formatDateYYYYMMDD();
  const proposalNo = plan.meta?.proposalNo ?? genProposalNo();
  const contact = "attaguy.net | hello@attaguy.net | +86-xxx-xxxx-xxxx";

  // 字体：你已确认路径
  const fontBytes = safeReadPublicFile("fonts/NotoSansSC-Regular.ttf");
  if (!fontBytes) {
    throw new Error("找不到字体 public/fonts/NotoSansSC-Regular.ttf");
  }

  const logoBytes = safeReadPublicFile("brand/logo.png");

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  const fontLatin = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageW = 595.28;
  const pageH = 841.89;
  const marginX = 48;

  // 1) 封面页
  await drawCoverPage({
    pdfDoc,
    font,
    logoBytes,
    brand,
    proposalTitle: "智能健身空间方案（AI 生成）",
    clientLine: "企业办公健身空间解决方案",
    dateStr,
    proposalNo,
    input: clientProfile,
  });

  // 2) 内容页（从第二页开始）
  const page = pdfDoc.addPage([pageW, pageH]);

  const bodySize = 11;
  const lineHeight = Math.round(bodySize * 1.45);
  const h2Size = 14;

  let curY = pageH - 120; // 给页眉留空间

  // 信息框（和你现在类似）
  const boxX = marginX;
  const boxW = pageW - marginX * 2;
  const boxH = 92;
  const boxY = curY - boxH;

  page.drawRectangle({
    x: boxX, y: boxY, width: boxW, height: boxH,
    borderWidth: 1, borderColor: rgb(0.88, 0.88, 0.88),
    color: rgb(0.98, 0.98, 0.98),
  });

  const infoLines = [
    `公司规模：${clientProfile.companySize ?? "未填写"}`,
    `面积：${clientProfile.area ?? "未填写"}`,
    `场景：${clientProfile.scenario ?? "未填写"}`,
    `预算：${clientProfile.budget ?? "未填写"}`,
  ];

  let infoY = boxY + boxH - 24;
  for (const line of infoLines) {
    page.drawText(line, { x: boxX + 16, y: infoY, size: bodySize, font, color: rgb(0.2, 0.2, 0.2) });
    infoY -= 18;
  }

  curY = boxY - 36;

  // 摘要（固定 5 条）
  page.drawText("摘要（管理层结论）", { x: marginX, y: curY, size: h2Size, font, color: rgb(0.1, 0.1, 0.1) });
  drawHr(page, marginX, curY - 12, pageW - marginX * 2);
  curY -= 36;

  const summaryArr = buildExecutiveSummary(clientProfile, { summary, equipmentList });
  for (const s of summaryArr) {
    const maxW = pageW - marginX * 2;
    const lines = wrapTextToLines({ text: `• ${s}`, font, size: bodySize, maxWidth: maxW });
    curY = drawLines(page, { lines, x: marginX, y: curY, size: bodySize, font, lineHeight, color: rgb(0.18, 0.18, 0.18) });
    curY -= 6;
  }

  curY -= 10;

  // 设备清单表格（正式）
  page.drawText("设备清单（建议采购表）", { x: marginX, y: curY, size: h2Size, font, color: rgb(0.1, 0.1, 0.1) });
  drawHr(page, marginX, curY - 12, pageW - marginX * 2);
  curY -= 28;

  const equip = normalizeEquipment({ equipmentList });
  const header = ["分类", "设备名称", "数量", "用途/理由", "预算区间"];
  const rows = equip.map(r => [r.category, r.name, String(r.qty), r.purpose, r.budget]);

  // 表格列宽（自动按比例缩放到 tableW）
  const tableW = pageW - marginX * 2;
  const colWidths = [70, 150, 55, 220, 90];

  curY = drawTable(page, {
    font,
    x: marginX,
    y: curY,
    w: tableW,
    header,
    rows,
    colWidths,
    fontSize: 10,
    lineHeight: 14,
    paddingY: 6,
  });

  // =========================
  // A3：新增第 3 / 第 4 页
  // =========================

  // 如果你没有粗体字体，就临时用 font 代替（后面你也可以再补粗体）
  const fontRegular = font;
  const fontBoldUse = font; // 暂时使用 font，后续可以替换为 fontBold

  // 你已有的信息（按你现有字段调整）
  const brandLeft = `${brand} | ${dateStr}`;
  const brandRight = `${proposalNo ?? ""}`;
  const contactPhone = "xxx-xxxx-xxxx"; // 从 contact 中提取或使用默认值
  const footerLeft = `attaguy.net | hello@attaguy.net | +86 ${contactPhone}`;

  // 这两个字段建议从 plan 取；没有就用默认
  const implementationSteps: string[] = safeArr<string>(
    plan.implementationSteps?.map((step: any) => `${step.phase}｜${step.title}（${step.duration}）`),
    [
      "阶段一（7天）：需求复核、场地条件确认、设备清单与预算锁定",
      "阶段二（30天）：设备采购、物流与安装、调试与使用培训",
      "阶段三（90天）：使用反馈收集、配置优化建议、扩展升级规划",
    ]
  );

  // "服务与升级项"：从 plan.upsellHints 读取，如果没有就用默认
  const upsellHints = plan.upsellHints || [];
  const defaultServiceUpsells = [
    { title: "设备维保与年度巡检", desc: "定期保养、易损件建议、故障响应 SLA（可选）" },
    { title: "企业课程与教练合作", desc: "团课/私教/企业健康活动方案与落地运营支持（可选）" },
    { title: "地面材料与安全防护升级", desc: "橡胶地垫/地胶/防震降噪与安全分区建议（可选）" },
    { title: "康复 / 拉伸 / 评估模块", desc: "拉伸区、筋膜放松、基础康复与体测评估器械建议（可选）" },
    { title: "平面布局深化设计", desc: "基于平面图优化动线、器械摆放、分区尺寸与施工要点（可选）" },
    { title: "三维空间设计与渲染（3D）", desc: "效果图/材质/灯光/品牌视觉统一（可选）" },
  ];
  const serviceUpsells: { title: string; desc: string }[] = upsellHints.length > 0
    ? upsellHints.map((hint: string) => {
        const match = defaultServiceUpsells.find(d => d.title === hint || d.title.includes(hint));
        return match || { title: hint, desc: "（可选）" };
      })
    : defaultServiceUpsells;

  function ensureRoom(curY: number, need: number) {
    return curY - need > 60; // 留出 footer 空间
  }

  /** 新增页：实施流程&交付范围（第 3 页） */
  {
    const page3 = pdfDoc.addPage([pageW, pageH]);

    let y = pageH - 80;
    y = drawSectionTitle({
      page: page3,
      x: marginX,
      y,
      title: "实施流程与交付范围",
      fontBold: fontBoldUse,
      font: fontRegular,
    });

    // 小引导文字
    {
      const intro = "以下为典型落地路径（可根据采购周期、装修进度与交付标准调整）。";
      const lines = wrapTextToLines({ text: intro, font: fontRegular, size: 11, maxWidth: pageW - marginX * 2 });
      y = drawLines(page3, { lines, x: marginX, y, size: 11, font: fontRegular, lineHeight: 16 });
      y -= 10;
    }

    // 三阶段卡片（用文字+分隔线，保持"咨询感"）
    const stages = [
      {
        name: "阶段一｜方案确认（7 天）",
        items: ["需求复核与目标对齐", "场地条件确认（尺寸/电力/动线/安全）", "设备清单与预算区间锁定"],
      },
      {
        name: "阶段二｜采购与安装（30 天）",
        items: ["设备下单与交付计划", "到货验收与安装调试", "使用培训与基础运营建议"],
      },
      {
        name: "阶段三｜运营优化（90 天）",
        items: ["使用反馈收集（到课/使用频次/损耗）", "配置调整建议（补强短板）", "升级与扩展规划（新增模块）"],
      },
    ];

    const cardW = pageW - marginX * 2;
    for (const s of stages) {
      if (!ensureRoom(y, 110)) break; // 简单处理：一页足够，不够你再告诉我我给你做自动分页

      // 卡片边框
      page3.drawRectangle({
        x: marginX,
        y: y - 96,
        width: cardW,
        height: 92,
        borderWidth: 1,
        borderColor: rgb(0.9, 0.9, 0.9),
        color: rgb(1, 1, 1),
      });

      page3.drawText(s.name, {
        x: marginX + 12,
        y: y - 22,
        size: 12,
        font: fontBoldUse,
        color: rgb(0.1, 0.1, 0.1),
      });

      let iy = y - 40;
      for (const it of s.items) {
        const bullet = `• ${it}`;
        const lines = wrapTextToLines({ text: bullet, font: fontRegular, size: 11, maxWidth: cardW - 24 });
        iy = drawLines(page3, { lines, x: marginX + 12, y: iy, size: 11, font: fontRegular, lineHeight: 16 });
        iy -= 2;
      }

      y -= 108;
    }

    // 交付范围（简短但专业）
    y -= 4;
    page3.drawText("交付范围（本版）", { x: marginX, y, size: 12, font: fontBoldUse, color: rgb(0.1, 0.1, 0.1) });
    y -= 18;
    const deliver = [
      "• 基础设备清单与数量建议（含理由）",
      "• 空间分区建议（有氧/力量/拉伸/功能区）",
      "• 预算区间（设备+安装+运维）",
      "• 实施路径与可选升级项说明",
    ];
    for (const d of deliver) {
      const lines = wrapTextToLines({ text: d, font: fontRegular, size: 11, maxWidth: pageW - marginX * 2 });
      y = drawLines(page3, { lines, x: marginX, y, size: 11, font: fontRegular, lineHeight: 16 });
      y -= 2;
    }
  }

  /** 新增页：服务与升级选项（第 4 页） */
  {
    const page4 = pdfDoc.addPage([pageW, pageH]);

    let y = pageH - 80;
    y = drawSectionTitle({
      page: page4,
      x: marginX,
      y,
      title: "服务与升级选项（可选）",
      fontBold: fontBoldUse,
      font: fontRegular,
    });

    // 引导
    {
      const intro = "以下为可按需求增补的服务模块，适用于提升体验、降低运维风险、增强方案落地效果。";
      const lines = wrapTextToLines({ text: intro, font: fontRegular, size: 11, maxWidth: pageW - marginX * 2 });
      y = drawLines(page4, { lines, x: marginX, y, size: 11, font: fontRegular, lineHeight: 16 });
      y -= 14;
    }

    // 勾选清单（视觉像"咨询交付"）
    const boxSize = 10;
    for (const item of serviceUpsells) {
      if (!ensureRoom(y, 62)) break;

      // checkbox
      page4.drawRectangle({
        x: marginX,
        y: y - 12,
        width: boxSize,
        height: boxSize,
        borderWidth: 1,
        borderColor: rgb(0.6, 0.6, 0.6),
      });

      // title
      page4.drawText(item.title, {
        x: marginX + 16,
        y: y - 12,
        size: 12,
        font: fontBoldUse,
        color: rgb(0.1, 0.1, 0.1),
      });

      // desc
      const descLines = wrapTextToLines({
        text: item.desc,
        font: fontRegular,
        size: 11,
        maxWidth: pageW - marginX * 2 - 16,
      });
      y = drawLines(page4, {
        lines: descLines,
        x: marginX + 16,
        y: y - 30,
        size: 11,
        font: fontRegular,
        lineHeight: 16,
      });

      // 分隔线
      page4.drawLine({
        start: { x: marginX, y: y - 10 },
        end: { x: pageW - marginX, y: y - 10 },
        thickness: 1,
        color: rgb(0.92, 0.92, 0.92),
      });

      y -= 24;
    }

    // 最后放一个"下一步行动"区块（强转化）
    if (ensureRoom(y, 90)) {
      page4.drawRectangle({
        x: marginX,
        y: y - 76,
        width: pageW - marginX * 2,
        height: 72,
        borderWidth: 1,
        borderColor: rgb(0.9, 0.9, 0.9),
        color: rgb(0.98, 0.98, 0.98),
      });

      page4.drawText("下一步建议", { x: marginX + 12, y: y - 22, size: 12, font: fontBoldUse, color: rgb(0.1, 0.1, 0.1) });

      const next = [
        "• 若你有平面图（PDF/图片），可发给我们进行动线与摆放深化。",
        "• 若需要更精准报价，可补充：楼层/电力/是否淋浴/采购偏好品牌等。",
        "• 我们可提供：深化方案 + 报价清单 + 施工要点 + 交付计划。",
      ];
      let ny = y - 40;
      for (const line of next) {
        const lines = wrapTextToLines({ text: line, font: fontRegular, size: 11, maxWidth: pageW - marginX * 2 - 24 });
        ny = drawLines(page4, { lines, x: marginX + 12, y: ny, size: 11, font: fontRegular, lineHeight: 16 });
        ny -= 2;
      }

      y -= 92;
    }

    // 工程 CTA 区块（条件渲染）
    if (originalPlan && shouldShowEngineeringCTA(originalPlan)) {
      // 检查是否需要新页面
      let ctaPage = page4;
      let ctaY = y;
      if (!ensureRoom(y, 110)) {
        // 如果当前页空间不足，创建新页面
        ctaPage = pdfDoc.addPage([pageW, pageH]);
        ctaY = pageH - 80;
      }

      // 绘制灰度区块（灰色背景）
      const ctaHeight = 100;
      ctaPage.drawRectangle({
        x: marginX,
        y: ctaY - ctaHeight,
        width: pageW - marginX * 2,
        height: ctaHeight,
        borderWidth: 1,
        borderColor: rgb(0.85, 0.85, 0.85),
        color: rgb(0.95, 0.95, 0.95), // 浅灰色背景
      });

      // 标题
      ctaPage.drawText("扩展服务（如适用）", {
        x: marginX + 12,
        y: ctaY - 22,
        size: 12,
        font: fontBoldUse,
        color: rgb(0.3, 0.3, 0.3), // 深灰色文字
      });

      // 文案内容
      const ctaText = "若您的园区同时包含篮球场、羽毛球场或室外运动场地，我们也可提供对应的规划与施工支持，可在沟通中一并说明。";
      const ctaLines = wrapTextToLines({
        text: ctaText,
        font: fontRegular,
        size: 11,
        maxWidth: pageW - marginX * 2 - 24,
      });
      let ctaTextY = ctaY - 45;
      for (const line of ctaLines) {
        ctaTextY = drawLines(ctaPage, {
          lines: [line],
          x: marginX + 12,
          y: ctaTextY,
          size: 11,
          font: fontRegular,
          lineHeight: 16,
          color: rgb(0.4, 0.4, 0.4), // 中灰色文字
        });
        ctaTextY -= 2;
      }

      y = ctaY - (ctaHeight + 12); // 更新 y 位置，为下一个区块留出间距
    }
  }

  // 页眉页脚：对所有页（封面也加）
  const pages = pdfDoc.getPages();
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    drawHeaderFooter({
      page: pages[i],
      pageW,
      pageH,
      marginX,
      font: fontLatin, // ✅ 用拉丁字体画页眉页脚
      text: {
        left: `${brand} | ${dateStr}`,
        right: `${proposalNo}`,
        footerLeft: footerLeft,
        pageNo: i + 1,
        pageTotal: totalPages,
      },
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * 数据流向架构：
 * 
 * 表单 → LLM → plan.json（唯一事实源）→ PDF 渲染 / 后台留资 / 销售/升级
 * 
 * 此函数负责将标准的 plan.json 格式转换为 PDF 生成函数期望的内部格式
 */
function normalizePlanData(plan: Plan | any): any {
  // 如果已经是旧格式（有 summary 和 equipmentList），直接返回
  if (plan.summary && plan.equipmentList) {
    return plan;
  }

  // 新格式适配
  const clientProfileRaw = plan.client_profile || plan.clientProfile || {};
  
  // 转换 clientProfile 字段名（新格式 → 旧格式）
  const clientProfile = {
    companySize: clientProfileRaw.company_size || clientProfileRaw.companySize,
    area: clientProfileRaw.space_area || clientProfileRaw.area,
    scenario: clientProfileRaw.scene || clientProfileRaw.scenario,
    budget: clientProfileRaw.budget_range || clientProfileRaw.budget,
    industry: clientProfileRaw.industry,
    ...clientProfileRaw, // 保留其他字段
  };

  const normalized: any = {
    meta: {
      proposalNo: plan.meta?.plan_id || plan.meta?.proposalNo || genProposalNo(),
    },
    clientProfile,
    summary: plan.solution_summary?.management_conclusion || plan.summary || [],
    equipmentList: [],
    implementationSteps: [],
    upsellHints: [],
  };

  // 转换设备列表：从 equipment_plan 格式转换为 equipmentList 格式
  if (plan.equipment_plan && Array.isArray(plan.equipment_plan)) {
    for (const category of plan.equipment_plan) {
      if (category.items && Array.isArray(category.items)) {
        for (const item of category.items) {
          normalized.equipmentList.push({
            category: category.category || "其他",
            name: item.name || "",
            qty: item.qty || 1,
            price_level: item.price_level || "中",
            purpose: item.purpose || item.reason || "",
            budget: item.budget || item.price_level || "中",
          });
        }
      }
    }
  } else if (plan.equipmentList) {
    normalized.equipmentList = plan.equipmentList;
  }

  // 转换实施步骤：从 implementation 格式转换为 implementationSteps 格式
  if (plan.implementation) {
    const steps = [];
    if (plan.implementation.phase_1) {
      steps.push({ phase: "阶段一", title: plan.implementation.phase_1, duration: "7天" });
    }
    if (plan.implementation.phase_2) {
      steps.push({ phase: "阶段二", title: plan.implementation.phase_2, duration: "30天" });
    }
    if (plan.implementation.phase_3) {
      steps.push({ phase: "阶段三", title: plan.implementation.phase_3, duration: "90天" });
    }
    normalized.implementationSteps = steps;
  } else if (plan.implementationSteps) {
    normalized.implementationSteps = plan.implementationSteps;
  }

  // 转换升级提示：从 upsell_modules 格式转换为 upsellHints 格式
  if (plan.upsell_modules) {
    const hints = [];
    if (plan.upsell_modules.layout_design) {
      hints.push("布局设计深化");
    }
    if (plan.upsell_modules["3d_render"]) {
      hints.push("3D 渲染效果图");
    }
    if (plan.upsell_modules.rehab_module) {
      hints.push("康复训练模块");
    }
    normalized.upsellHints = hints;
  } else if (plan.upsellHints) {
    normalized.upsellHints = plan.upsellHints;
  }

  // 合并其他字段（保留原有数据）
  return {
    ...plan,
    ...normalized,
    meta: {
      ...(plan.meta || {}),
      ...normalized.meta,
    },
  };
}

/**
 * 从 plan.json（唯一事实源）生成 PDF
 * 
 * 数据流向：plan.json → normalizePlanData → generatePDF → PDF Buffer
 */
export async function generatePdfFromPlan(plan: Plan | any): Promise<Buffer> {
  // 先标准化数据格式（将标准的 plan.json 转换为 PDF 生成函数期望的格式）
  const normalizedPlan = normalizePlanData(plan);
  
  // 传递原始 plan 以便判断是否显示工程 CTA
  // 检查是否是标准 Plan 格式（有 client_profile 字段）
  const originalPlan: Plan | undefined = 
    plan && 
    (plan.client_profile || plan.meta?.plan_id) 
      ? (plan as Plan) 
      : undefined;
  
  // 使用现有的 generatePDF 函数生成 PDF
  const pdfBytes = await generatePDF(normalizedPlan, originalPlan);
  
  // 将 Uint8Array 转换为 Buffer
  return Buffer.from(pdfBytes);
}

// GET：支持 preview 和 full 两种模式
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("planId") || "";
  const mode = (searchParams.get("mode") || "full") as "preview" | "full";
  const downloadToken = searchParams.get("downloadToken") || "";
  const licenseKey = (searchParams.get("licenseKey") || "").trim();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const ua = req.headers.get("user-agent") || null;

  if (!planId) {
    return NextResponse.json({ error: "planId required" }, { status: 400 });
  }

  const isFull = mode === "full";

  // =========================
  // preview：永远放行（不需要支付/授权/登录）
  // =========================
  if (!isFull) {
    const job = await (prisma as any).planJob.findUnique({ where: { id: planId } });
    if (!job?.plan) {
      return NextResponse.json({ error: "plan_not_found", msg: "找不到方案数据" }, { status: 404 });
    }

    const { renderPdf } = await import("@/lib/pdf/render");
    const pdfBytes = await renderPdf(job.plan as any, { mode });

    await logPdfDownload({
      planId,
      mode: "preview",
      reason: "preview",
      ip,
      ua,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${planId}-${mode}.pdf"`,
      },
    });
  }

  // =========================
  // ✅ full 分支门禁顺序：
  // 1) token
  // 2) 授权码(session)
  // 3) 支付
  // 4) 销售授权
  // =========================

  // ✅ 开发期绕过：必须放在所有门禁之前
  if (shouldBypassPaywall(planId)) {
    const job = await (prisma as any).planJob.findUnique({ where: { id: planId } });
    if (!job?.plan) {
      return NextResponse.json({ error: "plan_not_found", msg: "找不到方案数据" }, { status: 404 });
    }

    const { renderPdf } = await import("@/lib/pdf/render");
    const pdfBytes = await renderPdf(job.plan as any, { mode });

    await logPdfDownload({
      planId,
      mode,
      reason: "bypass",
      ip,
      ua,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${planId}-${mode}.pdf"`,
      },
    });
  }

  // 1) token 门禁（必须）
  if (!downloadToken) {
    await logPdfDownload({ planId, mode, reason: "denied", ok: false, ip, ua });
    return NextResponse.json({ error: "token_required", msg: "缺少下载令牌" }, { status: 401 });
  }

  try {
    const { verifyDownloadToken } = await import("@/lib/downloadToken");
    const payload = verifyDownloadToken(downloadToken);

    if (!payload || payload.planId !== planId) {
      await logPdfDownload({ planId, mode, reason: "invalid", ok: false, ip, ua });
      return NextResponse.json({ error: "token_mismatch", msg: "下载令牌与方案不匹配" }, { status: 403 });
    }

    if (payload?.scope && payload.scope !== "pdf_download") {
      await logPdfDownload({ planId, mode, reason: "invalid", ok: false, ip, ua });
      return NextResponse.json({ error: "token_scope_invalid", msg: "下载令牌权限不足" }, { status: 403 });
    }
  } catch (e: any) {
    await logPdfDownload({ planId, mode, reason: "token_verify_failed", ok: false, ip, ua });
    return NextResponse.json({ error: "token_invalid", msg: e?.message || "下载令牌无效" }, { status: 403 });
  }

  // 2) 授权码(session) 门禁（必须）
  const email = await requireEmailFromSession();
  if (!email) {
    await logPdfDownload({ planId, mode, reason: "denied", ok: false, ip, ua });
    return NextResponse.json({ error: "login_required", msg: "需要登录后才能下载完整版" }, { status: 401 });
  }

  // 3) 支付门禁（支持开发环境 bypass）
  if (!shouldBypassPaywall(planId)) {
    const paid = await prisma.order.findFirst({
      where: { planId, status: "PAID" },
      select: { id: true },
    });

    if (!paid) {
      await logPdfDownload({ planId, mode, reason: "denied", ok: false, email, ip, ua });
      return NextResponse.json({ error: "payment_required", msg: "请先完成支付后下载完整版" }, { status: 402 });
    }
  }

  // 4) 销售授权门禁（必须）
  if (!isSalesAuthorized({ email, planId })) {
    await logPdfDownload({ planId, mode, reason: "denied", ok: false, email, ip, ua });
    return NextResponse.json({ error: "sales_auth_required", msg: "未获得销售授权，无法下载完整版" }, { status: 403 });
  }

  // =========================
  // 生成 PDF（使用现有的渲染逻辑）
  // =========================
  const job = await (prisma as any).planJob.findUnique({ where: { id: planId } });
  if (!job?.plan) {
    return NextResponse.json({ error: "plan_not_found", msg: "找不到方案数据" }, { status: 404 });
  }

  const { renderPdf } = await import("@/lib/pdf/render");
  const pdfBytes = await renderPdf(job.plan as any, { mode });

  // 记录日志
  await logPdfDownload({
    planId,
    mode,
    reason: "token",
    ok: true,
    email,
    ip,
    ua,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${planId}-${mode}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

// ✅ POST：验证通过后用 plan 生成 PDF
export async function POST(req: Request) {
  // TODO: 临时关闭登录校验（开发调试）
  // const email = await requireEmailFromSession();
  // if (!email) return new Response("Need verify", { status: 402 });
  
  try {
    const url = new URL(req.url);

    // 支持从 query 参数或 body 中获取 planId
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const planId = url.searchParams.get("planId") || body?.planId;

    if (!planId) {
      return NextResponse.json(
        { ok: false, message: "缺少 planId" },
        { status: 400 }
      );
    }

    // ⭐ 支付门禁：使用统一的访问控制函数
    const access = await requirePdfAccess(req, planId);
    if (!access.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: "PAYMENT_REQUIRED",
          planId,
          paid: access.paid,
          licenseOk: access.licenseOk,
          message: "需要支付或授权码才能下载完整版 PDF",
        },
        { status: 402 }
      );
    }

    const proposalNo = body?.proposalNo || body?.plan?.meta?.plan_id || body?.plan?.meta?.proposalNo || "attaguy-plan";

    console.log(`[PDF] 请求参数: planId=${planId}, body.plan=${!!body?.plan}, body.planId=${!!body?.planId}`);

    // 1️⃣ 优先从 body 读取 plan（如果提供了）
    let plan: Plan | null = body?.plan || null;
    if (plan) {
      console.log(`[PDF] Loaded plan from request body`);
    }

    // 2️⃣ 从数据库读取（如果 body 中没有）
    if (!plan && planId) {
      try {
        // ✅ 使用 id 字段查询 PlanJob
        const row = await (prisma as any).planJob.findUnique({ where: { id: planId } });
        if (row) {
          // ✅ 转换 snake_case 为 camelCase
          const raw = row.plan ?? row.input ?? {};
          plan = deepSnakeToCamel(raw) as any;
          console.log(`[PDF] Loaded plan from DB: ${planId}`);
        } else {
          console.log(`[PDF] PlanJob not found in DB: ${planId}`);
        }
      } catch (e: any) {
        console.warn(`[PDF] DB read failed, fallback to FS: ${e?.message || e}`);
      }
    }

    // 3️⃣ fallback：文件系统读取（本地/单机可用）
    if (!plan && planId) {
      plan = loadPlanJson(planId);
      if (plan) console.log(`[PDF] Loaded plan.json from filesystem: ${planId}`);
    }

    if (!plan) {
      console.error(`[PDF] Plan not found: planId=${planId}, body.plan=${!!body?.plan}`);
      return NextResponse.json(
        { error: "missing_plan", msg: `POST /api/pdf 需要 plan 数据或有效的 planId。当前 planId: ${planId || "未提供"}` },
        { status: 400 }
      );
    }

    // 3️⃣ 用 JSON 渲染 PDF
    const pdfBuffer = await generatePdfFromPlan(plan);

    // 4️⃣ 保存 PDF 到文件系统
    const finalPlanId = plan?.meta?.plan_id || planId;
    if (finalPlanId) {
      savePlanPdf(finalPlanId, pdfBuffer);
    }

    // 通知：PDF 下载成功
    await notify(`[Attaguy] PDF 下载成功：proposalNo=${proposalNo}`);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${proposalNo}.pdf"`,
      },
    });
  } catch (e: any) {
    console.error("POST /api/pdf failed:", e);
    return NextResponse.json({ error: e?.message || "pdf_failed" }, { status: 500 });
  }
}
