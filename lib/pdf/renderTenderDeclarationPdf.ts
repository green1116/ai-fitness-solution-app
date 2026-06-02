import { PDFDocument, rgb } from "pdf-lib";
import { loadChineseFont } from "@/lib/pdf/shared/chineseFont";

const W = 595.28;
const H = 841.89;
const M = 52;

export async function renderTenderDeclarationPdf(): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await loadChineseFont(doc);
  const page = doc.addPage([W, H]);

  page.drawText("投标承诺声明", {
    x: M,
    y: H - 100,
    size: 22,
    font,
    color: rgb(0.12, 0.2, 0.38),
  });

  const lines = [
    "本单位郑重承诺：",
    "一、严格遵循招标文件要求，提交真实、完整、有效的投标文件。",
    "二、如本单位中标，将按照合同约定组织实施，确保质量、工期与服务承诺落地。",
    "三、在项目实施与交付阶段，接受招标方监督管理，确保项目成果满足验收标准。",
    "四、本声明作为投标文件组成部分，与本次投标承诺具有同等法律效力。",
    "",
    "投标单位（盖章）：___________________________",
    "授权代表签字：_____________________________",
    "日期：_____________________________________",
  ];

  let y = H - 160;
  for (const line of lines) {
    page.drawText(line, {
      x: M,
      y,
      size: 13,
      font,
      color: rgb(0.14, 0.14, 0.16),
    });
    y -= 34;
  }

  return Buffer.from(await doc.save());
}
