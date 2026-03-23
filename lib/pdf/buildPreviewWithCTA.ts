import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function buildPreviewWithCTA(
  fullBytes: Uint8Array
): Promise<Uint8Array> {
  const fullDoc = await PDFDocument.load(fullBytes);
  const previewDoc = await PDFDocument.create();

  const total = fullDoc.getPageCount();
  const keepCount = Math.min(4, total);
  const indexes = Array.from({ length: keepCount }, (_, i) => i);

  const pages = await previewDoc.copyPages(fullDoc, indexes);
  pages.forEach((p) => previewDoc.addPage(p));

  const page = previewDoc.addPage();
  const { height } = page.getSize();

  const fontBold = await previewDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await previewDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("ENTERPRISE FITNESS SOLUTION", {
    x: 50,
    y: height - 100,
    size: 18,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText("Preview Ended", {
    x: 50,
    y: height - 140,
    size: 28,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  page.drawText("You have viewed the first 4 pages of the proposal.", {
    x: 50,
    y: height - 180,
    size: 12,
    font: fontRegular,
    color: rgb(0, 0, 0),
  });

  const bullets = [
    "Full 22-page enterprise fitness solution",
    "Detailed budget estimation & equipment plan",
    "Space layout & implementation roadmap",
    "Designed for corporate / tender submission",
  ];

  let y = height - 240;
  bullets.forEach((item) => {
    page.drawText(`- ${item}`, {
      x: 70,
      y,
      size: 12,
      font: fontRegular,
      color: rgb(0, 0, 0),
    });
    y -= 24;
  });

  page.drawText("Unlock Full Report", {
    x: 50,
    y: 150,
    size: 20,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  page.drawText("Submit your email to download the complete version", {
    x: 50,
    y: 120,
    size: 12,
    font: fontRegular,
    color: rgb(0, 0, 0),
  });

  return await previewDoc.save();
}
