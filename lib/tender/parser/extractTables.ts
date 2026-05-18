import type { ParsedPage, TenderSection, TenderTableBlock } from "@/lib/tender/types";

const TABLE_TITLE_HINTS = [
  "参数表",
  "技术参数",
  "评分表",
  "评分标准",
  "商务条款",
  "报价表",
  "清单",
];

function looksLikeTableTitle(line: string): boolean {
  const t = line.trim();
  return TABLE_TITLE_HINTS.some((h) => t.includes(h));
}

function parseTableRows(block: string): string[][] | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;

  const rows: string[][] = [];
  for (const line of lines) {
    if (/[\t|｜]/.test(line)) {
      const cells = line
        .split(/[\t|｜]+/)
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2) rows.push(cells);
      continue;
    }
    if (/\s{2,}/.test(line)) {
      const cells = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) rows.push(cells);
    }
  }
  return rows.length >= 2 ? rows : null;
}

/**
 * 从章节与全文中识别表格式块（参数表 / 评分表 / 商务表）
 */
export function extractTables(
  sections: TenderSection[],
  pages: ParsedPage[],
): TenderTableBlock[] {
  const tables: TenderTableBlock[] = [];
  let idx = 0;

  const scan = (text: string, title?: string, page?: number) => {
    const parts = text.split(/\n{2,}/);
    for (const part of parts) {
      const firstLine = part.split("\n")[0]?.trim() || "";
      const rows = parseTableRows(part);
      if (!rows) continue;
      const blockTitle =
        title ||
        (looksLikeTableTitle(firstLine) ? firstLine : undefined) ||
        `表格-${++idx}`;
      tables.push({ title: blockTitle, rows, page });
    }
  };

  for (const sec of sections) {
    scan(sec.content, sec.title, sec.startPage);
  }

  if (!tables.length) {
    const full = pages.map((p) => p.text).join("\n\n");
    scan(full, undefined, pages[0]?.page);
  }

  return tables;
}
