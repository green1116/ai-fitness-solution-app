import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import type { TenderScoreResult } from "@/lib/tender/scoreEngine";
import { formatEvidenceText } from "@/lib/tender/score/formatEvidenceText";

function packFontPath() {
  return path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
}

function wrapLineToWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
) {
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

const PAGE: [number, number] = [595.28, 841.89];

const SECTION_NUM = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

/**
 * 评审打分模拟（参考）：使用评分引擎结果 + 可选模型名称。
 */
export async function buildScoreSimulationPdf(input: {
  scoreResult: TenderScoreResult;
  profileName?: string;
}): Promise<Uint8Array> {
  const { scoreResult, profileName } = input;
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
  const rowSize = 11;
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
    y -= 26;
  };

  const drawRow = (text: string, size = rowSize) => {
    const lines = wrapLineToWidth(text, font, size, maxW);
    for (const ln of lines) {
      if (y < bottom) newPage();
      page.drawText(ln, {
        x: M,
        y,
        size,
        font,
        color: rgb(0.22, 0.22, 0.22),
      });
      y -= lineH;
    }
  };

  drawTitle("评审打分模拟（参考）");

  if (profileName) {
    drawRow(`评分模型：${profileName}`, 9);
    y -= 6;
  }

  scoreResult.breakdown.forEach((item, i) => {
    const num = SECTION_NUM[i] ?? String(i + 1);
    drawTitle(`${num}、${item.label}（${item.maxScore} 分）`);
    drawRow(`${item.label}：${item.score} / ${item.maxScore}`);
    drawRow(item.note, bodySize);
    if (item.evidence?.length) {
      const evidenceText = formatEvidenceText(
        item.evidence.map((e: any) =>
          typeof e === "string" ? { ref: e } : { ref: e.ref, source: e.source }
        )
      );
      if (evidenceText) drawRow(`支撑依据：${evidenceText}`, bodySize);
    }
    const weaknessText = (item.weaknesses || []).slice(0, 2).join("；");
    if (weaknessText) {
      drawRow(`扣分点：${weaknessText}`, bodySize);
    }
    const actionText = (item.actions || []).slice(0, 2).join("；");
    if (actionText) {
      drawRow(`建议动作：${actionText}`, bodySize);
    }
    y -= 6;
  });

  const n = scoreResult.breakdown.length;
  const totalNum = SECTION_NUM[n] ?? String(n + 1);
  drawTitle(`${totalNum}、综合得分`);
  drawRow(
    `综合得分：${scoreResult.totalScore} / ${scoreResult.totalMaxScore}`,
    rowSize
  );
  y -= 6;

  const conclNum = SECTION_NUM[n + 1] ?? String(n + 2);
  drawTitle(`${conclNum}、评审结论建议`);
  drawRow(scoreResult.conclusion, bodySize);
  drawRow(
    "（本页为投标方根据响应情况给出的模拟评分，仅供评审参考，最终以招标人/评标委员会评定为准。）",
    9
  );

  return pdf.save({ useObjectStreams: true });
}
