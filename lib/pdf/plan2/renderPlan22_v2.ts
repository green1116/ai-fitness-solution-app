// lib/pdf/plan2/renderPlan22_v2.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument } from "pdf-lib";

import { renderCover } from "./sections/cover";
import { renderExecSummary } from "./sections/execSummary";
import { renderTOC } from "./sections/toc";
import { drawFooter } from "./components/headerFooter";
import { sig8 } from "@/lib/pdf/engine/sig";

export type Plan22V2Input = {
  planId: string;
  companyName: string;
  ymd: string;
  reqsig?: string;
  internalPack?: boolean;
};

export async function renderPlan22PdfBytes_v2(
  input: Plan22V2Input
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // 加载字体
  const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  const boldFontPath = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Bold.ttf");
  
  const fontBytes = await fs.readFile(fontPath);
  const boldFontBytes = await fs.readFile(boldFontPath);
  
  const font = await doc.embedFont(fontBytes, { subset: true });
  const boldFont = await doc.embedFont(boldFontBytes, { subset: true });

  // 渲染各个章节
  renderCover(doc, font, boldFont, {
    planId: input.planId,
    companyName: input.companyName,
    ymd: input.ymd,
  });
  
  renderTOC(doc, font);
  renderExecSummary(doc, font);

  // 统一添加页脚
  const pages = doc.getPages();
  const pageTotal = pages.length;
  const sig = sig8(input.reqsig);

  pages.forEach((p, i) => {
    // 封面不加页脚
    if (i === 0) return;

    if (!input.internalPack) {
      drawFooter(p, font, {
        planId: input.planId,
        ymd: input.ymd,
        pageNo: i + 1,
        pageTotal,
        sig8: sig,
      });
    }
  });

  // 设置 PDF 元数据
  try {
    doc.setTitle(`Plan - ${input.planId}`);
    doc.setSubject("AI Fitness Solution Plan");
    doc.setCreator("AI_FITNESS_SOLUTION");
    doc.setProducer("AI_FITNESS_SOLUTION_PLAN_V2");
    doc.setKeywords([
      `PLAN:${input.planId}`,
      `REQSIG:${input.reqsig || ""}`,
      `YMD:${input.ymd}`,
    ]);
  } catch (e) {
    console.warn("[PLAN22_V2] Failed to set metadata:", e);
  }

  const bytes = await doc.save();
  return new Uint8Array(bytes);
}
