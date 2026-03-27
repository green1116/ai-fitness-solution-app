// lib/pdf/plan/v4Sections.ts
// V4 新增 6 个页面模块（主方案 PDF 产品级升级）

import type { PDFDocument, PDFPage, PDFFont } from "pdf-lib";
import { TOKENS } from "@/lib/pdf/tokens";
import { drawChapterTitle, drawInfoCard } from "@/lib/pdf/components";

const PAGE_TOP = TOKENS.topY;
const M = TOKENS.marginX;

type V4Context = {
  doc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  companyName?: string;
  budgetRange?: string;
  budgetTier?: string;
};

type V4SectionFlags = {
  showDecisionSummary: boolean;
  showBudgetLogic: boolean;
  showValuePage: boolean;
  showPhases: boolean;
  showBusinessNotes: boolean;
  showNextSteps: boolean;
};

/** 1. 决策摘要页 */
export function drawDecisionSummary(ctx: V4Context): PDFPage {
  const page = ctx.doc.addPage();
  const yRef = { y: PAGE_TOP };

  drawChapterTitle(
    page,
    ctx.font,
    ctx.fontBold,
    yRef,
    "项目决策摘要",
    "Decision Summary"
  );

  let y = yRef.y;
  const cardH = 70;
  const cardW = 120;

  drawInfoCard(
    page,
    ctx.font,
    ctx.fontBold,
    "推荐档位",
    "标准版",
    50,
    y,
    cardW,
    cardH
  );
  drawInfoCard(
    page,
    ctx.font,
    ctx.fontBold,
    "预算区间",
    ctx.budgetRange || "¥10-20万",
    180,
    y,
    cardW,
    cardH
  );
  drawInfoCard(page, ctx.font, ctx.fontBold, "面积", "120㎡", 310, y, cardW, cardH);
  drawInfoCard(page, ctx.font, ctx.fontBold, "周期", "3-6周", 440, y, cardW, cardH);

  y -= 100;

  page.drawText(
    "本方案适用于中大型企业办公场景，旨在提升员工健康体验与企业形象。",
    {
      x: M,
      y,
      size: TOKENS.fsBody,
      font: ctx.font,
      color: TOKENS.colorText,
    }
  );

  return page;
}

/** 2. 预算构成说明页 */
export function drawBudgetLogic(ctx: V4Context): PDFPage {
  const page = ctx.doc.addPage();
  const yRef = { y: PAGE_TOP };

  drawChapterTitle(
    page,
    ctx.font,
    ctx.fontBold,
    yRef,
    "预算构成说明",
    "Budget Logic"
  );

  let y = yRef.y;

  const items: [string, string][] = [
    ["设备投入", "覆盖有氧与力量训练需求"],
    ["基础装修", "地面、灯光及基础空间处理"],
    ["配套设施", "储物、镜面及安全模块"],
    ["交付实施", "运输、安装与调试"],
  ];

  items.forEach(([title, desc]) => {
    page.drawText(title, {
      x: M,
      y,
      size: TOKENS.fsH3,
      font: ctx.fontBold,
      color: TOKENS.colorText,
    });
    y -= 18;
    page.drawText(desc, {
      x: M,
      y,
      size: TOKENS.fsBody,
      font: ctx.font,
      color: TOKENS.colorSubtle,
    });
    y -= TOKENS.gapLg;
  });

  return page;
}

/** 3. 企业价值页 */
export function drawValuePage(ctx: V4Context): PDFPage {
  const page = ctx.doc.addPage();
  const yRef = { y: PAGE_TOP };

  drawChapterTitle(
    page,
    ctx.font,
    ctx.fontBold,
    yRef,
    "企业价值与收益",
    "Business Value"
  );

  let y = yRef.y;

  const sections: [string, string][] = [
    ["员工价值", "提升健康参与度与办公体验"],
    ["企业价值", "增强品牌与福利竞争力"],
    ["空间价值", "提升空间利用率与展示效果"],
  ];

  sections.forEach(([title, desc]) => {
    page.drawText(title, {
      x: M,
      y,
      size: TOKENS.fsH3,
      font: ctx.fontBold,
      color: TOKENS.colorText,
    });
    y -= 18;
    page.drawText(desc, {
      x: M,
      y,
      size: TOKENS.fsBody,
      font: ctx.font,
      color: TOKENS.colorSubtle,
    });
    y -= 30;
  });

  return page;
}

/** 4. 分阶段实施页 */
export function drawPhases(ctx: V4Context): PDFPage {
  const page = ctx.doc.addPage();
  const yRef = { y: PAGE_TOP };

  drawChapterTitle(
    page,
    ctx.font,
    ctx.fontBold,
    yRef,
    "分阶段实施建议",
    "Implementation Phases"
  );

  let y = yRef.y;

  const phases: [string, string][] = [
    ["第一阶段", "基础设备与空间建设"],
    ["第二阶段", "体验升级与扩展"],
    ["第三阶段", "运营优化与迭代"],
  ];

  phases.forEach(([title, desc]) => {
    page.drawText(title, {
      x: M,
      y,
      size: TOKENS.fsH3,
      font: ctx.fontBold,
      color: TOKENS.colorText,
    });
    y -= 18;
    page.drawText(desc, {
      x: M,
      y,
      size: TOKENS.fsBody,
      font: ctx.font,
      color: TOKENS.colorSubtle,
    });
    y -= 30;
  });

  return page;
}

/** 5. 商务说明页 */
export function drawBusinessNotes(ctx: V4Context): PDFPage {
  const page = ctx.doc.addPage();
  const yRef = { y: PAGE_TOP };

  drawChapterTitle(page, ctx.font, ctx.fontBold, yRef, "商务说明", "Commercial Notes");

  let y = yRef.y;

  const notes = [
    "最终价格以现场复尺为准",
    "设备品牌可替换同档次型号",
    "运输安装按地区调整",
    "正式合同为最终执行依据",
  ];

  notes.forEach((t) => {
    page.drawText("• " + t, {
      x: M,
      y,
      size: TOKENS.fsBody,
      font: ctx.font,
      color: TOKENS.colorText,
    });
    y -= 24;
  });

  return page;
}

/** 6. 行动引导页（收尾） */
export function drawNextSteps(ctx: V4Context): PDFPage {
  const page = ctx.doc.addPage();
  const yRef = { y: PAGE_TOP };

  drawChapterTitle(page, ctx.font, ctx.fontBold, yRef, "建议下一步", "Next Steps");

  let y = yRef.y;

  const steps = [
    "确认预算与建设目标",
    "安排现场勘测",
    "输出正式报价方案",
  ];

  steps.forEach((s, i) => {
    page.drawText(`${i + 1}. ${s}`, {
      x: M,
      y,
      size: TOKENS.fsBody,
      font: ctx.font,
      color: TOKENS.colorText,
    });
    y -= 28;
  });

  return page;
}

/** 按推荐顺序渲染全部 V4 页面，返回新增的页面数组 */
export function renderV4Sections(
  ctx: V4Context,
  flags?: Partial<V4SectionFlags>
): PDFPage[] {
  const merged: V4SectionFlags = {
    showDecisionSummary: true,
    showBudgetLogic: true,
    showValuePage: true,
    showPhases: true,
    showBusinessNotes: true,
    showNextSteps: true,
    ...flags,
  };
  const pages: PDFPage[] = [];
  if (merged.showDecisionSummary) {
    console.log("drawDecisionSummary");
    pages.push(drawDecisionSummary(ctx));
  }
  if (merged.showBudgetLogic) {
    console.log("drawBudgetLogic");
    pages.push(drawBudgetLogic(ctx));
  }
  if (merged.showValuePage) {
    console.log("drawValuePage");
    pages.push(drawValuePage(ctx));
  }
  if (merged.showPhases) {
    console.log("drawPhases");
    pages.push(drawPhases(ctx));
  }
  if (merged.showBusinessNotes) {
    console.log("drawBusinessNotes");
    pages.push(drawBusinessNotes(ctx));
  }
  if (merged.showNextSteps) {
    console.log("drawNextSteps");
    pages.push(drawNextSteps(ctx));
  }
  return pages;
}
