// lib/pdf/render-bundle.ts
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PlanBundle, PlanTier } from "@/lib/plan/types";

function pickFontFile() {
  const ttf = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  const otf = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.otf");
  if (fs.existsSync(ttf)) return ttf;
  if (fs.existsSync(otf)) return otf;
  return ttf; // 用于报错提示
}

function s(v: any) {
  return String(v ?? "");
}

type WriterState = { page: any; y: number };

export async function renderBundlePdf(bundle: PlanBundle): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const pageSize: [number, number] = [595.28, 841.89]; // A4
  const margin = 48;
  const lineH = 16;

  const addPage = () => pdfDoc.addPage(pageSize);

  const fontFile = pickFontFile();
  if (!fs.existsSync(fontFile)) {
    throw new Error(
      `缺少中文字体文件：${fontFile}\n请放置到 public/fonts/NotoSansSC-Regular.ttf（推荐）或 .otf`
    );
  }

  const fontBytes = fs.readFileSync(fontFile);
  const noto = await pdfDoc.embedFont(fontBytes, { subset: true });
  await pdfDoc.embedFont(StandardFonts.Helvetica); // 备用

  const ensureSpace = (st: WriterState, need = lineH) => {
    if (st.y - need < margin) {
      st.page = addPage();
      st.y = pageSize[1] - margin;
    }
  };

  const writeLine = (st: WriterState, text: string, size = 11) => {
    ensureSpace(st);
    st.page.drawText(text, { x: margin, y: st.y, size, font: noto, color: rgb(0, 0, 0) });
    st.y -= lineH;
  };

  const writeTitle = (st: WriterState, title: string) => {
    ensureSpace(st, 28);
    st.page.drawText(title, { x: margin, y: st.y, size: 18, font: noto, color: rgb(0, 0, 0) });
    st.y -= 28;
  };

  const blank = (st: WriterState, lines = 1) => {
    for (let i = 0; i < lines; i++) {
      ensureSpace(st);
      st.y -= lineH;
    }
  };

  // 1) 封面
  {
    const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
    writeTitle(st, "办公健康支持方案（自动生成）");
    const meta = bundle.input;
    writeLine(st, `Plan ID：${s(meta.planId)}`);
    writeLine(st, `行业：${s(meta.industry)}`);
    writeLine(st, `企业规模：${meta.companySize} 人`);
    writeLine(st, `面积：${meta.areaSize}㎡`);
    writeLine(st, `预算范围：${s(meta.budgetRange)}`);
    blank(st, 1);
    writeLine(st, `推荐档位：${bundle.recommended}（standard）`);
    blank(st, 1);
    writeLine(st, `定位：为 ${meta.companySize} 人规模${meta.industry}企业打造的高性价比办公健康支持解决方案`);
  }

  // 2) 执行摘要（标准版）
  {
    const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
    writeTitle(st, "执行摘要");
    const standard = bundle.plans.standard;
    for (const b of standard.executiveSummary) writeLine(st, `• ${s(b)}`);
  }

  // 3) 三档对比页
  if (bundle.compare.enabled) {
    const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
    writeTitle(st, "三档方案配置对比");
    for (const it of bundle.compare.items) {
      writeLine(st, s(it.label), 13);
      writeLine(st, `- 同时使用：${s(it.concurrentUsers)}`);
      writeLine(st, `- 参与率：${s(it.participationRate)}（企业员工中经常使用的比例）`);
      writeLine(st, `- 覆盖：${s(it.coverage)}`);
      writeLine(st, `- 适合：${s(it.fit)}`);
      writeLine(st, `- 特点：${s(it.feature)}`);
      blank(st, 1);
    }
    writeLine(st, `结论：${s(bundle.compare.conclusion)}`);
  }

  // 4) 三档各自输出（含话术/风险）
  const tiers: PlanTier[] = ["lite", "standard", "pro"];
  for (const tier of tiers) {
    const plan = bundle.plans[tier];

    // 使用场景与覆盖能力
    {
      const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
      writeTitle(st, `${plan.title}｜使用场景与覆盖能力`);
      writeLine(st, `定位：${s(plan.positioning)}`);
      blank(st, 1);
      writeLine(st, "使用场景假设：", 13);
      writeLine(st, `- 主要使用人群：${s(plan.usage.mainUsers)}`);
      writeLine(st, `- 使用高峰时段：${s(plan.usage.peakHours)}`);
      blank(st, 1);
      writeLine(st, "覆盖能力：", 13);
      writeLine(st, `- 同时使用能力：约 ${s(plan.usage.concurrentUsers)}`);
      writeLine(st, `- 预计参与率：${s(plan.usage.participationRate)}（企业员工中经常使用的比例）`);
    }

    // 器材配置（含理由）
    {
      const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
      writeTitle(st, `${plan.title}｜器材配置方案（含配置逻辑）`);
      for (const [cat, items] of Object.entries(plan.equipments)) {
        if (!items?.length) continue;
        writeLine(st, `【${cat}】`, 13);
        for (const it of items) {
          writeLine(st, `- ${it.qty} × ${it.name}`);
          writeLine(st, `  → ${it.rationale}`);
        }
        blank(st, 1);
      }
    }

    // 实施计划
    {
      const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
      writeTitle(st, `${plan.title}｜实施计划与周期`);
      for (const ph of plan.implementation) {
        writeLine(st, `${ph.name}（${ph.duration}）`, 13);
        writeLine(st, `- ${ph.desc}`);
        blank(st, 1);
      }
    }

    // 增购/推荐/话术
    {
      const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
      writeTitle(st, `${plan.title}｜增购模块 / 推荐说明 / 话术`);
      writeLine(st, "可选增购模块：", 13);
      for (const m of plan.addOnModules) {
        writeLine(st, `- ${m.name}：${m.enabled ? "已开启" : "未开启"}`);
        writeLine(st, `  → ${m.value}`);
      }
      blank(st, 1);
      writeLine(st, `推荐说明：${plan.recommendation}`, 13);
      blank(st, 1);
      writeLine(st, "销售/客服话术：", 13);
      writeLine(st, `- 一句话：${plan.salesCopy.oneLine}`);
      writeLine(st, `- 对 HR 解释：${plan.salesCopy.hrPitch}`);
      writeLine(st, "  反对意见应对：");
      for (const o of plan.salesCopy.objectionHandling) writeLine(st, `  • ${o}`);
    }

    // 风险与不适合
    {
      const st: WriterState = { page: addPage(), y: pageSize[1] - margin };
      writeTitle(st, `${plan.title}｜使用风险与不适合说明`);
      writeLine(st, "使用前提：", 13);
      for (const t of plan.risks.prerequisites) writeLine(st, `- ${t}`);
      blank(st, 1);
      writeLine(st, "不适合场景：", 13);
      for (const t of plan.risks.notSuitable) writeLine(st, `- ${t}`);
      blank(st, 1);
      writeLine(st, "风险控制建议：", 13);
      for (const t of plan.risks.mitigations) writeLine(st, `- ${t}`);
      blank(st, 1);
      writeLine(st, `边界说明：${plan.risks.disclaimer}`);
    }
  }

  return pdfDoc.save();
}
