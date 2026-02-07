// lib/pdf/renderBudget.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// @ts-ignore
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

type ModuleKey =
  | "header"
  | "overall"
  | "budgetCompare"
  | "table"
  | "brands"
  | "supplement"
  | "remarks";

type BudgetTier = "low" | "mid" | "high";

export type PdfCfg = {
  companyName?: string;
  budgetTier?: BudgetTier;
  area?: number;
  headcount?: number;
  participation?: number; // 0-1
  preferSmart?: boolean;
  preferQuiet?: boolean;

  modules?: Partial<Record<ModuleKey, boolean>>;
  order?: ModuleKey[];
};

type RenderBudgetOpts = {
  cfg?: PdfCfg;
};

// 预算条目（你后续可替换成 plan.json 或 DB 的真实预算明细）
type BudgetItem = {
  category: string;
  name: string;
  qty: number;
  unitPrice: number;
  unit: string;
  note?: string;
};

function tryLoadFontBytes(): Uint8Array | null {
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.otf"),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch {}
  }
  return null;
}

function clamp(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function money(n: number) {
  const v = Math.round(n);
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function mockBudget(cfg?: PdfCfg): BudgetItem[] {
  // 你之后接真实预算时，把这里换成“读取 plan.json / DB 的预算明细”
  const tier = cfg?.budgetTier || "mid";
  const base =
    tier === "low" ? 0.8 : tier === "high" ? 1.25 : 1.0;

  const items: BudgetItem[] = [
    { category: "有氧", name: "商用跑步机", qty: tier === "high" ? 3 : tier === "low" ? 1 : 2, unitPrice: 68000 * base, unit: "台", note: "含安装" },
    { category: "力量", name: "史密斯机", qty: tier === "low" ? 0 : 1, unitPrice: 52000 * base, unit: "套", note: "企业安全优先" },
    { category: "自由力量", name: "可调哑铃组", qty: tier === "high" ? 2 : 1, unitPrice: 12000 * base, unit: "套", note: "节省空间" },
    { category: "拉伸", name: "拉伸垫/泡沫轴/弹力带", qty: 1, unitPrice: 3500 * base, unit: "套", note: "基础耗材" },
    { category: "地面/辅材", name: "减震地垫与辅材", qty: 1, unitPrice: 18000 * base, unit: "批", note: "防滑、耐磨" },
    { category: "运营", name: "安全提示与基础导引", qty: 1, unitPrice: 2000 * base, unit: "项", note: "上墙物料" },
  ];

  // 填充一些行以便看分页效果（你可以删）
  while (items.length < 28) {
    items.push({
      category: "配件",
      name: `配件项-${items.length + 1}`,
      qty: 1,
      unitPrice: 600 * base,
      unit: "件",
      note: "可选",
    });
  }
  return items;
}

export async function renderBudgetPdf(planId: string, opts: RenderBudgetOpts): Promise<Uint8Array> {
  const cfg = opts.cfg || {};
  const pdf = await PDFDocument.create();

  // A4
  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 42;

  const fontBytes = tryLoadFontBytes();
  let font: any;
  let fontBold: any;

  if (fontBytes) {
    pdf.registerFontkit(fontkit);
    font = await pdf.embedFont(fontBytes, { subset: true });
    fontBold = font;
  } else {
    // 兜底（中文可能无法正确显示）
    font = await pdf.embedFont(StandardFonts.Helvetica);
    fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  }

  const items = mockBudget(cfg);
  const rowsPerPage = 18;
  const pages = chunk(items, rowsPerPage);

  const companyName = cfg.companyName || "示例企业";
  const headcount = cfg.headcount ?? 200;
  const area = cfg.area ?? 120;
  const tierLabel = cfg.budgetTier === "low" ? "低" : cfg.budgetTier === "high" ? "高" : "中";

  const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);

  // 颜色：白底黑字（不再用深色底，避免“看不清/像乱码”）
  const cText = rgb(0.12, 0.12, 0.14);
  const cMuted = rgb(0.45, 0.45, 0.5);
  const cLine = rgb(0.87, 0.87, 0.9);

  pages.forEach((rows, idx) => {
    const page = pdf.addPage([pageW, pageH]);

    // 标题
    page.drawText("预算清单", {
      x: margin,
      y: pageH - margin - 10,
      size: 20,
      font: fontBold,
      color: cText,
    });

    page.drawText(`Plan ID：${planId}  ｜  企业：${companyName}`, {
      x: margin,
      y: pageH - margin - 34,
      size: 11,
      font,
      color: cMuted,
    });

    page.drawText(`人数：${headcount}  ｜  面积：${area}㎡  ｜  预算档位：${tierLabel}`, {
      x: margin,
      y: pageH - margin - 52,
      size: 11,
      font,
      color: cMuted,
    });

    // 分隔线
    page.drawLine({
      start: { x: margin, y: pageH - margin - 66 },
      end: { x: pageW - margin, y: pageH - margin - 66 },
      thickness: 1,
      color: cLine,
    });

    // 表格头
    let y = pageH - margin - 92;
    const cols = {
      cat: margin,
      name: margin + 70,
      qty: margin + 290,
      unit: margin + 330,
      unitPrice: margin + 370,
      sub: margin + 460,
    };

    page.drawText("品类", { x: cols.cat, y, size: 10, font: fontBold, color: cText });
    page.drawText("名称", { x: cols.name, y, size: 10, font: fontBold, color: cText });
    page.drawText("数量", { x: cols.qty, y, size: 10, font: fontBold, color: cText });
    page.drawText("单位", { x: cols.unit, y, size: 10, font: fontBold, color: cText });
    page.drawText("单价", { x: cols.unitPrice, y, size: 10, font: fontBold, color: cText });
    page.drawText("小计", { x: cols.sub, y, size: 10, font: fontBold, color: cText });

    y -= 10;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageW - margin, y },
      thickness: 1,
      color: cLine,
    });

    // 表格行
    y -= 18;
    rows.forEach((it) => {
      const sub = it.qty * it.unitPrice;

      page.drawText(it.category, { x: cols.cat, y, size: 10, font, color: cText });
      page.drawText(it.name, { x: cols.name, y, size: 10, font, color: cText });
      page.drawText(String(it.qty), { x: cols.qty, y, size: 10, font, color: cText });
      page.drawText(it.unit, { x: cols.unit, y, size: 10, font, color: cText });
      page.drawText(money(it.unitPrice), { x: cols.unitPrice, y, size: 10, font, color: cText });
      page.drawText(money(sub), { x: cols.sub, y, size: 10, font, color: cText });

      y -= 18;
      if (it.note) {
        page.drawText(`备注：${it.note}`, { x: cols.name, y: y + 6, size: 9, font, color: cMuted });
        y -= 10;
      }
    });

    // 页脚：本页/总页 + 总计（只在最后一页显示总计更专业，但这里每页都给）
    page.drawLine({
      start: { x: margin, y: margin + 52 },
      end: { x: pageW - margin, y: margin + 52 },
      thickness: 1,
      color: cLine,
    });

    page.drawText(`页码：${idx + 1} / ${pages.length}`, {
      x: margin,
      y: margin + 30,
      size: 9,
      font,
      color: cMuted,
    });

    page.drawText(`总计：${money(total)} 元`, {
      x: pageW - margin - 160,
      y: margin + 28,
      size: 11,
      font: fontBold,
      color: cText,
    });
  });

  return await pdf.save();
}
