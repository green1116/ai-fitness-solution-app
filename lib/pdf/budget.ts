// lib/pdf/budget.ts
import fs from "node:fs";
import path from "node:path";
import { buildBudgetSummary } from "@/lib/gym-budget";
import type { BudgetTier, CompanySize, Range } from "@/lib/types/gym-budget";

type Goal = "general" | "fatloss" | "strength" | "rehab";

export type BudgetPdfInput = {
  planId: string;
  companyName: string;
  companySize: CompanySize;
  budgetTier: BudgetTier;

  spaceSqm?: number;
  participationRate?: number; // 0~1
  goal?: Goal;
  preferSmart?: boolean;
  preferQuiet?: boolean;
};

export type BudgetPdfSection =
  | "header"
  | "overall"
  | "compare"   // ✅ 新增：预算对比模块
  | "table"
  | "brands"
  | "supplement"
  | "remarks";

export type RenderBudgetPdfOpts = {
  pdfVersion: string;
  sections?: BudgetPdfSection[];
};

// ---------- utils ----------
function CNY(n: number) {
  const v = Math.round(n);
  return "¥" + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function formatRange(x: Range) {
  return `${CNY(x.min)}–${CNY(x.max)}`;
}

function asciiSafe(s: string) {
  // 只保留 ASCII 可见字符，避免 env/local 编码污染导致 PDF 顶部乱码
  return String(s || "").replace(/[^\x20-\x7E]/g, "");
}

function formatRangeCompact(x: Range) {
  // 宽度不够时用紧凑格式：¥60k–150k
  const k = (n: number) => {
    const v = Math.round(n);
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return String(v);
  };
  return `¥${k(x.min)}–¥${k(x.max)}`;
}

function formatRangeSmart(x: Range, maxChars: number) {
  const full = `${CNY(x.min)}–${CNY(x.max)}`; // 无空格，减少长度
  if (full.length <= maxChars) return full;
  return formatRangeCompact(x);
}


function compactPriceText(s: string) {
  return (s || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s*-\s*/g, "-")
    .trim();
}
function clamp01(x: number) {
  if (!Number.isFinite(x)) return NaN;
  if (x <= 0) return NaN;
  if (x > 1) return NaN;
  return x;
}

// ---------- render ----------
export async function renderBudgetPdfBuffer(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts
): Promise<Buffer> {
  const { planId, companyName, companySize, budgetTier } = input;

  const budget = buildBudgetSummary(budgetTier, companySize);

  const pdfkitMod: any = await import("pdfkit");
  const PDFDocument = pdfkitMod?.default ?? pdfkitMod;
  const doc = new PDFDocument({ size: "A4", margin: 48 });

  // Font
  const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  const hasCN = fs.existsSync(fontPath);
  if (hasCN) {
    doc.registerFont("CN", fontPath);
    doc.font("CN");
  }

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  function ensureSpace(min: number) {
    if (doc.y + min > doc.page.height - doc.page.margins.bottom) doc.addPage();
  }
  function reset() {
    const x = doc.page.margins.left;
    doc.x = x;
    doc.text("", x, doc.y, { width: usableWidth });
  }

  const h1 = (t: string) => {
    reset();
    if (hasCN) doc.font("CN");
    doc.fontSize(18).fillColor("#000").text(t, { width: usableWidth });
    doc.moveDown(0.3);
  };
  const h2 = (t: string) => {
    ensureSpace(28);
    reset();
    if (hasCN) doc.font("CN");
    doc.fontSize(12).fillColor("#000").text(t, { width: usableWidth });
    doc.moveDown(0.3);
  };
  const p = (t: string) => {
    reset();
    if (hasCN) doc.font("CN");
    doc.fontSize(10).fillColor("#000").text(t, { width: usableWidth, lineGap: 2 });
  };
  function hr() {
    reset();
    const y = doc.y;
    doc.lineWidth(1);
    doc.moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.margins.left + usableWidth, y)
      .stroke();
    doc.moveDown(0.6);
  }

  function ellipsize(text: string, maxWidth: number, fontSize: number) {
    const raw = (text || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
    if (!raw) return "-";
    if (hasCN) doc.font("CN");
    doc.fontSize(fontSize);
    if (doc.widthOfString(raw) <= maxWidth) return raw;
    let s = raw;
    while (s.length && doc.widthOfString(s + "…") > maxWidth) s = s.slice(0, -1);
    return (s || raw.slice(0, 1)) + "…";
  }

  // Table helpers
  function tableRow(
    cells: string[],
    widths: number[],
    opts?: { header?: boolean; shade?: boolean; strongCols?: number[]; aligns?: Array<"left"|"center"|"right"> }
  ) {
    const header = !!opts?.header;
    const shade = !!opts?.shade;
    const strongCols = opts?.strongCols || [];
    const aligns = opts?.aligns || [];
  
    const rowH = header ? 26 : 24;
    ensureSpace(rowH + 2);
  
    const y0 = doc.y;
    const x0 = doc.page.margins.left;
  
    if (shade) {
      doc.save(); doc.fillOpacity(0.10);
      doc.rect(x0, y0, usableWidth, rowH).fill("#000000");
      doc.restore();
    } else if (header) {
      doc.save(); doc.fillOpacity(0.08);
      doc.rect(x0, y0, usableWidth, rowH).fill("#000000");
      doc.restore();
    }
  
    let x = x0;
    for (let i = 0; i < cells.length; i++) {
      const w = widths[i];
      doc.lineWidth(1);
      doc.rect(x, y0, w, rowH).stroke();
  
      const fs = header ? 10 : 9;
      const innerW = w - 12;
  
      // ✅ 金额列（单价/小计）更容易超宽：允许用紧凑格式
      let raw = String(cells[i] ?? "");
      const isMoneyLike = /¥/.test(raw) && /–|-/.test(raw);
  
      let text = raw;
      if (isMoneyLike && !header) {
        // 尝试智能压缩
        text = formatRangeSmart(
          // 这里 raw 已经是字符串，我们只做字符长度兜底：太长就 compact
          // 如果你想严格基于数值压缩，可在传 cells 时直接传 formatRangeSmart(...)
          { min: 0, max: 0 } as any,
          18
        );
        // 上面这行是兜底：更稳的做法是“在 renderTable 时直接传 formatRangeSmart(line.subtotal, 18)”
        // 下面我们会在 renderTable 里改为那种更稳的写法
        text = raw.length > 18 ? raw.replace(/,/g, "").replace(/¥(\d{2})\d+/g, "¥$1k") : raw;
      } else {
        text = ellipsize(raw, innerW, fs);
      }
  
      const align = aligns[i] || (i === 0 ? "left" : "center");
      const draw = (dx: number) => {
        if (hasCN) doc.font("CN");
        doc.fontSize(fs).fillColor("#000").text(text, x + 6 + dx, y0 + 7, {
          width: innerW,
          align,
          lineBreak: false,  // ✅ 禁止换行（关键）
        });
      };
  
      if (strongCols.includes(i)) { draw(0); draw(0.35); }
      else { draw(0); }
  
      x += w;
    }
  
    doc.y = y0 + rowH;
  }
  

  function bullet(text: string) {
    ensureSpace(24);
    reset();
    if (hasCN) doc.font("CN");
    const line = `• ${String(text || "").replace(/^\-\s*/, "")}`;
    const y0 = doc.y;
    const h = doc.heightOfString(line, { width: usableWidth, lineGap: 2 });
    doc.fontSize(10).fillColor("#000").text(line, { width: usableWidth, lineGap: 2 });
    doc.y = y0 + h + 4;
  }

  function numbered(idx: number, text: string) {
    ensureSpace(24);
    reset();
    if (hasCN) doc.font("CN");
    const y0 = doc.y;
    doc.fontSize(10).fillColor("#000").text(`${idx}.`, doc.page.margins.left, y0, { width: 18 });
    doc.text(String(text || ""), doc.page.margins.left + 18, y0, {
      width: usableWidth - 18,
      lineGap: 2,
    });
    doc.moveDown(0.2);
  }

  // Sections order
  const sections: BudgetPdfSection[] =
    opts.sections && opts.sections.length
      ? opts.sections
      : ["header", "overall", "compare", "table", "supplement", "remarks"];

  // ---- header ----
  const renderHeader = () => {
    h1("企业健身房预算方案（设备报价映射）");
    reset();
  
    const pv = asciiSafe(opts.pdfVersion || "BUDGET_PDF_DEV");
    const ts = asciiSafe(new Date().toISOString());
  
    if (hasCN) doc.font("CN");
    doc.fontSize(8).fillColor("#666").text(`${pv} | ${ts}`, {
      width: usableWidth,
      align: "right",
    });
  
    doc.moveDown(0.3);
  
    p(`Plan ID：${planId}`);
    p(`企业名称：${companyName}`);
    p(`企业规模：${companySize} 人`);
    p(`预算等级：${budgetTier === "low" ? "低" : budgetTier === "mid" ? "中" : "高"}`);
    doc.moveDown(0.6);
    hr();
  };
  

  // ---- overall ----
  const renderOverall = () => {
    h2("整体预算区间（含基础器材+配套，含税含安装）");
  
    const a = budget.overallTotal;
    const b = budget.estimatedBySubtotals;
  
    const reserveMin = Math.max(0, a.min - b.min);
    const reserveMax = Math.max(0, a.max - b.max);
  
    p(`表内整体总计区间：${formatRange(a)}`);
    p(`按分项小计加总估算：${formatRange(b)}`);
  
    // ✅ 直接把“差额/预留项”列出来，用户就不困惑了
    p(`预留（税/安装/运输/配套/施工等经验项）：${formatRange({ min: reserveMin, max: reserveMax })}`);
  
    doc.moveDown(0.6);
    hr();
  };
  

  // ---- compare ----
  const renderCompare = () => {
    ensureSpace(180);
    h2("预算对比（低 / 中 / 高）");
  
    const bLow = buildBudgetSummary("low" as BudgetTier, companySize);
    const bMid = buildBudgetSummary("mid" as BudgetTier, companySize);
    const bHigh = buildBudgetSummary("high" as BudgetTier, companySize);
  
    const colWidths = [
      Math.round(usableWidth * 0.22),
      Math.round(usableWidth * 0.39),
      Math.round(usableWidth * 0.39),
    ];
  
    tableRow(["档位", "整体总计区间", "分项加总估算"], colWidths, { header: true });
  
    const row = (label: string, b: any, isCurrent: boolean) =>
      tableRow(
        [label, formatRangeSmart(b.overallTotal, 18), formatRangeSmart(b.estimatedBySubtotals, 18)],
        colWidths,
        isCurrent ? { shade: true, strongCols: [0,1,2] } : undefined
      );
  
    row("低", bLow, budgetTier === "low");
    row("中", bMid, budgetTier === "mid");
    row("高", bHigh, budgetTier === "high");
  
    doc.moveDown(0.6);
    hr();
  };
  

  // ---- table ----
  const renderTable = () => {
    h2("分品类预算明细");

    const colWidths = [
      Math.round(usableWidth * 0.34),
      Math.round(usableWidth * 0.22),
      Math.round(usableWidth * 0.18),
      Math.round(usableWidth * 0.26),
    ];

    tableRow(["设备分类", "单价区间", "常规数量", "单类小计"], colWidths, {
      header: true,
      aligns: ["left", "center", "center", "right"],
    });
    

    for (const line of budget.lines) {
      tableRow(
        [
          line.categoryName,
          // 单价区间一般是字符串，尽量变短（去空格/斜杠）
          compactPriceText(line.unitPriceText || "-"),
          line.qtyText || "-",
          // ✅ 小计区间：用 smart，宽度不够自动变 ¥60k–150k
          formatRangeSmart(line.subtotal, 18),
        ],
        colWidths,
        { aligns: ["left", "center", "center", "right"] }
      );
    }
    

    // ✅ 合计行：灰底 + 强调首列和末列（一定可见）
    tableRow(
      ["合计（分项加总）", "-", "-", formatRangeSmart(budget.estimatedBySubtotals, 18)],
      colWidths,
      { shade: true, strongCols: [0, 3], aligns: ["left", "center", "center", "right"] }
    );
    

    doc.moveDown(0.6);
    hr();
  };

  // ---- supplement ----
  const renderSupplement = () => {
    ensureSpace(120);
    h2("补充说明（适配规模/配置说明）");

    const extraLines: string[] = [];
    for (const line of budget.lines) {
      const fit = String(line.fit || "").trim();
      const note = String(line.note || "").trim();
      if (fit || note) {
        extraLines.push(
          `${line.categoryName}：${fit ? `适配${fit}` : ""}${fit && note ? "；" : ""}${note || ""}`
        );
      }
    }

    if (extraLines.length) extraLines.forEach((t) => bullet(t));
    else p("（无）");

    doc.moveDown(0.6);
    hr();
  };

  // ---- brands (optional sample) ----
  const renderBrands = () => {
    ensureSpace(120);
    h2("品牌建议（可选）");
    bullet("有氧设备：舒华/英派斯/乔山（按预算匹配）");
    bullet("力量器械：英派斯/国产中端线/必确（按预算匹配）");
    bullet("配套与地垫：专业橡胶地垫（按面积核算）");
    doc.moveDown(0.6);
    hr();
  };

  // ---- remarks ----
  const renderRemarks = () => {
    ensureSpace(120);
    h2("其他备注");

    // 原 notes
    budget.notes.forEach((t: string, i: number) => numbered(i + 1, t));

    // ✅ 参与率解释写进 PDF（你要的）
    const r = clamp01(Number(input.participationRate));
    if (r) {
      const est = Math.round(companySize * r);
      const pct = Math.round(r * 100);
      numbered(
        budget.notes.length + 1,
        `参与率说明：参与率 = 在企业总人数里，预计“经常使用健身房”的那一部分比例。例如：${companySize} 人 × ${pct}% ≈ ${est} 人会较频繁使用。`
      );
    } else {
      numbered(
        budget.notes.length + 1,
        "参与率说明：参与率 = 在企业总人数里，预计“经常使用健身房”的那一部分比例（未填写则按默认经验假设）。"
      );
    }

    // 其他输入也可记录（可选但很实用）
    let idx = budget.notes.length + 2;
    if (Number.isFinite(input.spaceSqm as any) && (input.spaceSqm as number) > 0) {
      numbered(idx++, `面积输入：约 ${input.spaceSqm} ㎡（用于辅助判断数量上限与动线余量）。`);
    }
    if (input.goal && input.goal !== "general") {
      numbered(
        idx++,
        `训练目标偏好：${
          input.goal === "fatloss" ? "减脂/心肺" : input.goal === "strength" ? "力量/增肌" : "康复/拉伸"
        }（用于解释配置倾向）。`
      );
    }
    if (input.preferSmart) numbered(idx++, "偏好：智能设备（可能增加预算但提升体验与可视化管理）。");
    if (input.preferQuiet) numbered(idx++, "偏好：低噪/减震（建议地垫加厚、选择低噪设备）。");
  };

  // render by sections
  for (const sec of sections) {
    if (sec === "header") renderHeader();
    else if (sec === "overall") renderOverall();
    else if (sec === "compare") renderCompare();
    else if (sec === "table") renderTable();
    else if (sec === "brands") renderBrands();
    else if (sec === "supplement") renderSupplement();
    else if (sec === "remarks") renderRemarks();
  }

  doc.end();
  return await done;
}
