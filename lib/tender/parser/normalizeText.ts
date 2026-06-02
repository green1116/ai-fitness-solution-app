/** 统一中文标点（半角 → 全角常见项） */
const PUNCT_MAP: [RegExp, string][] = [
  [/,/g, "，"],
  [/;/g, "；"],
  [/:/g, "："],
  [/\(/g, "（"],
  [/\)/g, "）"],
];

function normalizeChinesePunctuation(text: string): string {
  let out = text;
  for (const [re, rep] of PUNCT_MAP) {
    out = out.replace(re, rep);
  }
  return out;
}

/** 清理 OCR 噪声与零宽字符 */
function stripOcrNoise(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
}

/**
 * 规范化招标正文：空格、换行、标点、OCR 噪声
 */
export function normalizeText(input: string): string {
  let text = String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/第\s*(\d+)\s*页\s*共\s*\d+\s*页/g, "")
    .replace(/\n{4,}/g, "\n\n\n");

  text = stripOcrNoise(text);
  text = normalizeChinesePunctuation(text);
  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function normalizePages(
  pages: { page: number; text: string }[],
): { page: number; text: string }[] {
  return pages.map((p) => ({
    page: p.page,
    text: normalizeText(p.text),
  }));
}
