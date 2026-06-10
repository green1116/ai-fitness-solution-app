import { PDFDocument, rgb } from "pdf-lib";
import { loadChineseFont } from "@/lib/pdf/shared/chineseFont";
import type { ProposalCoverContent } from "../cover/types";
import {
  computeProposalReqsig,
  formatProposalReqsigLine,
  type ProposalDocumentContext,
} from "../shared/metadata";
import type { ProposalPdfSection } from "../sections/types";
import type { TocEntry } from "../toc/types";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;

async function drawFooter(
  page: ReturnType<PDFDocument["addPage"]>,
  font: Awaited<ReturnType<typeof loadChineseFont>>,
  pageNum: number,
  total: number,
  reqsigLine?: string,
) {
  const y = 30;
  page.drawText(`${PROPOSAL_FOOTER_BRAND}`, {
    x: MARGIN,
    y,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  if (reqsigLine) {
    page.drawText(reqsigLine, {
      x: PAGE_WIDTH / 2 - 60,
      y,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  page.drawText(`${pageNum} / ${total}`, {
    x: PAGE_WIDTH - MARGIN - 30,
    y,
    size: 8,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
}

const PROPOSAL_FOOTER_BRAND = "AI Fitness Solution — Proposal PDF Engine";

function drawWatermark(
  page: ReturnType<PDFDocument["addPage"]>,
  font: Awaited<ReturnType<typeof loadChineseFont>>,
  text: string,
) {
  page.drawText(text, {
    x: PAGE_WIDTH / 2 - 80,
    y: PAGE_HEIGHT / 2,
    size: 36,
    font,
    color: rgb(0.85, 0.85, 0.85),
    opacity: 0.25,
  });
}

export async function renderProposalPdf(input: {
  documentContext: ProposalDocumentContext;
  cover: ProposalCoverContent;
  toc: TocEntry[];
  sections: ProposalPdfSection[];
}): Promise<Buffer> {
  const ctx = { ...input.documentContext };
  if (!ctx.reqsig?.trim()) {
    ctx.reqsig = await computeProposalReqsig(ctx);
  }
  const reqsigLine = formatProposalReqsigLine(ctx.reqsig);

  const doc = await PDFDocument.create();
  doc.setTitle(`${input.cover.projectName} — 投标方案书`);
  doc.setAuthor(ctx.brand);
  doc.setCreator(`${ctx.brand} — ${ctx.deliverySystemLabel}`);
  doc.setProducer(ctx.deliverySystemLabel);
  doc.setSubject(`Proposal ${ctx.proposalId}`);
  doc.setKeywords(["proposal", "tender", ctx.projectId]);

  const font = await loadChineseFont(doc);

  const coverPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  if (ctx.watermarkEnabled) drawWatermark(coverPage, font, ctx.watermarkText);
  coverPage.drawText(input.cover.branding.logoLabel, {
    x: MARGIN,
    y: PAGE_HEIGHT - 80,
    size: 14,
    font,
    color: rgb(0.1, 0.2, 0.4),
  });
  coverPage.drawText("投标方案书", {
    x: MARGIN,
    y: PAGE_HEIGHT - 160,
    size: 28,
    font,
    color: rgb(0.1, 0.15, 0.3),
  });
  coverPage.drawText(`项目名称：${input.cover.projectName}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - 220,
    size: 14,
    font,
  });
  coverPage.drawText(`客户名称：${input.cover.customerName}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - 250,
    size: 12,
    font,
  });
  coverPage.drawText(`方案版本：${input.cover.proposalVersion}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - 290,
    size: 11,
    font,
  });
  coverPage.drawText(`生成日期：${input.cover.generatedDate}`, {
    x: MARGIN,
    y: PAGE_HEIGHT - 320,
    size: 11,
    font,
  });

  const tocPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  if (ctx.watermarkEnabled) drawWatermark(tocPage, font, ctx.watermarkText);
  tocPage.drawText("目  录", { x: MARGIN, y: PAGE_HEIGHT - 80, size: 20, font });
  let tocY = PAGE_HEIGHT - 120;
  for (const entry of input.toc) {
    tocPage.drawText(`${entry.index}. ${entry.title}`, { x: MARGIN, y: tocY, size: 11, font });
    tocPage.drawText(String(entry.pageNumber), {
      x: PAGE_WIDTH - MARGIN - 20,
      y: tocY,
      size: 11,
      font,
    });
    tocY -= 22;
  }

  for (const section of input.sections) {
    const sectionPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    if (ctx.watermarkEnabled) drawWatermark(sectionPage, font, ctx.watermarkText);
    sectionPage.drawText(section.title, {
      x: MARGIN,
      y: PAGE_HEIGHT - 80,
      size: 16,
      font,
      color: rgb(0.1, 0.2, 0.4),
    });
    let y = PAGE_HEIGHT - 120;
    for (const para of section.paragraphs) {
      const lines = para.length > 60 ? [para.slice(0, 60), para.slice(60)] : [para];
      for (const line of lines) {
        if (y < 80) break;
        sectionPage.drawText(line, { x: MARGIN, y, size: 10, font });
        y -= 16;
      }
      y -= 8;
    }
  }

  const total = doc.getPageCount();
  const pages = doc.getPages();
  pages.forEach((page, index) => {
    drawFooter(page, font, index + 1, total, reqsigLine);
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
