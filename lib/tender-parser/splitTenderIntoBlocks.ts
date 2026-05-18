import type { TenderTextBlock } from "@/lib/tender-parser/types";

const HEADING_PATTERNS: RegExp[] = [
  /^第[一二三四五六七八九十\d]+章/,
  /^[一二三四五六七八九十]+[、.]/,
  /^（[一二三四五六七八九十\d]+）/,
  /^\d+(\.\d+){0,2}\s+/,
  /评分标准|评标办法|技术要求|商务要求|采购需求/,
];

function looksLikeHeading(line: string): boolean {
  const s = line.trim();
  if (!s) return false;
  return HEADING_PATTERNS.some((p) => p.test(s));
}

export function splitTenderIntoBlocks(text: string): TenderTextBlock[] {
  const lines = String(text || "").split("\n");
  const blocks: TenderTextBlock[] = [];

  let heading = "";
  let buffer: string[] = [];
  let idx = 0;

  const flush = () => {
    const t = buffer.join("\n").trim();
    if (!t) return;
    blocks.push({
      id: `BLK-${String(blocks.length + 1).padStart(4, "0")}`,
      heading: heading || undefined,
      text: t,
      index: idx++,
    });
    buffer = [];
  };

  for (const line of lines) {
    if (looksLikeHeading(line)) {
      flush();
      heading = line.trim();
      buffer.push(line);
      continue;
    }
    buffer.push(line);
  }
  flush();

  return blocks;
}

