import { PDFDocument } from "pdf-lib";
import { drawCommercialCoverV3, formatCoverDateIso } from "@/lib/pdf/cover";
import { loadChineseFont } from "@/lib/pdf/shared/chineseFont";

type CoverInput = {
  projectName: string;
  bidderName: string;
  tenderNo: string;
  dateText: string;
  brand?: string;
};

const W = 595.28;
const H = 841.89;

/** ZIP / 独立封面：复用 V3 商业封面系统 */
export async function renderTenderCoverPdf(input: CoverInput): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await loadChineseFont(doc);
  const page = doc.addPage([W, H]);

  const rawDate = String(input.dateText || "").trim();
  const dateText = rawDate.includes("-")
    ? rawDate
    : formatCoverDateIso();

  await drawCommercialCoverV3(doc, page, font, {
    companyName: input.bidderName,
    projectName: input.projectName,
    tenderNo: input.tenderNo,
    dateText,
  });

  return Buffer.from(await doc.save());
}
