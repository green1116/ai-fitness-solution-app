// @ts-nocheck
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";

export type TenderRiskMitigationInput = {
  score: number;
  level: "safe" | "caution" | "high";
  summary: {
    techPending: number;
    bizPending: number;
    deviations: number;
    missingAttachments: number;
  };
  topRisks: string[];
  missingAttachments: string[];
};

export type BuildRiskMitigationPdfOpts = {
  risk: TenderRiskMitigationInput;
  projectName?: string;
  tenderNo?: string;
  companyName?: string;
};

function packFontPath() {
  return path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
}

function wrapLineToWidth(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const raw = String(text || "").trim();
  if (!raw) return [""];
  const out: string[] = [];
  let cur = "";
  for (const ch of raw) {
    const next = cur + ch;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth || !cur) {
      cur = next;
    } else {
      out.push(cur);
      cur = ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}

const PAGE = [595.28, 841.89] as const;

/**
 * 风险与对策说明（评委向）：插在评分对照页之后、技术响应表之前。
 */
export async function buildRiskMitigationPdf(
  opts: BuildRiskMitigationPdfOpts
): Promise<Uint8Array> {
  const { risk } = opts;
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fp = packFontPath();
  if (!fs.existsSync(fp)) {
    throw new Error(`PACK_FONT_NOT_FOUND: ${fp}`);
  }
  const font = await pdf.embedFont(fs.readFileSync(fp), { subset: true });
  const titleFont = font;

  const M = 56;
  const bottom = M;
  const lineH = 18;
  const titleSize = 16;
  const bodySize = 10;

  let page = pdf.addPage(PAGE);
  let { width, height } = page.getSize();
  let y = height - M;
  const maxW = width - M * 2;

  const newPage = () => {
    page = pdf.addPage(PAGE);
    ({ width, height } = page.getSize());
    y = height - M;
  };

  const drawTitle = (text: string) => {
    if (y < bottom + 36) newPage();
    page.drawText(text, {
      x: M,
      y,
      size: titleSize,
      font: titleFont,
      color: rgb(0.12, 0.12, 0.12),
    });
    y -= 28;
  };

  const drawBodyLine = (text: string, size = bodySize) => {
    const lines = wrapLineToWidth(text, font, size, maxW);
    for (const line of lines) {
      if (y < bottom) newPage();
      page.drawText(line, {
        x: M,
        y,
        size,
        font,
        color: rgb(0.22, 0.22, 0.22),
      });
      y -= lineH;
    }
  };

  const gap = () => {
    y -= 10;
    if (y < bottom) newPage();
  };

  drawTitle("风险与对策说明");

  const meta = [
    opts.projectName ? `项目：${opts.projectName}` : "",
    opts.tenderNo ? `招标编号：${opts.tenderNo}` : "",
    opts.companyName ? `投标单位：${opts.companyName}` : "",
  ].filter(Boolean);
  for (const m of meta) {
    drawBodyLine(m, 9);
  }
  if (meta.length) gap();

  drawTitle("一、总体风险评估");

  drawBodyLine(`综合评分：${risk.score}`);
  drawBodyLine(
    `技术待确认：${risk.summary.techPending} 项，商务待确认：${risk.summary.bizPending} 项`
  );
  drawBodyLine(
    `偏离项：${risk.summary.deviations} 项，缺失附件：${risk.summary.missingAttachments} 项`
  );

  const levelText =
    risk.level === "safe"
      ? "整体风险可控"
      : risk.level === "caution"
        ? "存在一定风险，已制定应对措施"
        : "风险较高，已重点补强";

  drawBodyLine(`总体判断：${levelText}`);
  gap();

  drawTitle("二、重点风险项分析");

  if (risk.topRisks.length === 0) {
    drawBodyLine("本项目未识别出显著风险项。");
  } else {
    risk.topRisks.forEach((r, i) => {
      drawBodyLine(`${i + 1}. 条款 ${r}：已识别潜在风险`);
    });
  }
  gap();

  if (risk.missingAttachments.length > 0) {
    drawBodyLine(
      `缺失附件编号：${risk.missingAttachments.join("、")}（将在中标后按招标要求补齐）。`
    );
    gap();
  }

  drawTitle("三、补强与应对措施");

  drawBodyLine("针对上述风险，我方已采取如下措施：");
  drawBodyLine("1. 技术层面：完善参数说明，确保满足规范要求");
  drawBodyLine("2. 商务层面：补充响应说明，消除理解偏差");
  drawBodyLine("3. 附件层面：补充必要证明材料及合规文件");
  drawBodyLine("4. 实施层面：中标后进行二次深化确认");
  gap();

  drawTitle("四、综合承诺");

  drawBodyLine(
    "我方承诺严格按照招标文件要求执行，确保项目质量、进度及合规性，保证所有风险均在可控范围内。"
  );

  return pdf.save({ useObjectStreams: true });
}
