import type {
  TenderParseResult,
  TenderRequirement,
  TenderSection,
} from "@/lib/tender/types";

import { classifyRequirement } from "./classifyRequirement";
import { detectImportance } from "./detectImportance";

const LINE_SPLITTERS = /\n+|；|;/;

const REQUIREMENT_LINE_PATTERNS = [
  /应当?/,
  /必须/,
  /须/,
  /不得/,
  /提供/,
  /满足/,
  /达到/,
  /不少于/,
  /不低于/,
  /应支持/,
  /应具备/,
  /质保/,
  /交付/,
  /评分/,
  /得分/,
  /ISO/i,
  /营业执照/,
  /附件/,
  /≥|≤|>=|<=/,
  /\d+\s*分/,
];

function isRequirementLike(line: string): boolean {
  const t = line.trim();
  if (t.length < 6 || t.length > 500) return false;
  if (/^第[一二三四五六七八九十\d]+[章节]/.test(t)) return false;
  return REQUIREMENT_LINE_PATTERNS.some((p) => p.test(t));
}

function titleFromLine(line: string, max = 48): string {
  const t = line.trim().replace(/^[\d、.．)\s]+/, "");
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function extractFromSection(
  section: TenderSection,
  seq: { n: number },
): TenderRequirement[] {
  const out: TenderRequirement[] = [];
  const lines = section.content.split(LINE_SPLITTERS).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (!isRequirementLike(line)) continue;
    const category = classifyRequirement(line, section);
    const importance =
      category === "scoring" ? "scored" : detectImportance(line);

    seq.n += 1;
    out.push({
      id: `REQ-${String(seq.n).padStart(4, "0")}`,
      category,
      title: titleFromLine(line),
      requirement: line,
      sourcePage: section.startPage,
      importance,
      rawChunk: line,
    });
  }
  return out;
}

function extractFromTables(
  parsed: TenderParseResult,
  seq: { n: number },
): TenderRequirement[] {
  const out: TenderRequirement[] = [];
  for (const table of parsed.tables) {
    const title = table.title || "表格条款";
    for (const row of table.rows.slice(0, 80)) {
      const line = row.filter(Boolean).join(" | ").trim();
      if (!isRequirementLike(line) && line.length < 12) continue;
      seq.n += 1;
      out.push({
        id: `REQ-${String(seq.n).padStart(4, "0")}`,
        category: classifyRequirement(`${title} ${line}`),
        title: titleFromLine(line),
        requirement: line,
        sourcePage: table.page,
        importance: detectImportance(line),
        rawChunk: line,
      });
    }
  }
  return out;
}

/**
 * 从 parse 结果抽取结构化 requirements
 */
export function extractRequirements(parsed: TenderParseResult): TenderRequirement[] {
  const seq = { n: 0 };
  const fromSections = parsed.sections.flatMap((s) => extractFromSection(s, seq));
  const fromTables = extractFromTables(parsed, seq);

  const merged = [...fromSections, ...fromTables];
  const seen = new Set<string>();
  return merged.filter((r) => {
    const key = r.requirement.slice(0, 120);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
