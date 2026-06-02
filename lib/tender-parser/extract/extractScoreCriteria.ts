import type {
  ParsedTenderSection,
  ParsedScoreCriterion,
} from "../types";

const EVAL_SECTION_CATEGORIES = new Set<ParsedTenderSection["category"]>([
  "evaluation",
]);

const EVAL_TITLE_HINTS = [
  "评标办法",
  "评分标准",
  "评分细则",
  "综合评分",
  "评审标准",
  "技术分",
  "商务分",
  "价格分",
  "评分因素",
  "评分项",
];

function normalizeText(s: string) {
  return String(s || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();
}

function looksLikeEvaluationSection(section: ParsedTenderSection) {
  if (EVAL_SECTION_CATEGORIES.has(section.category)) return true;
  const title = section.title || "";
  return EVAL_TITLE_HINTS.some((k) => title.includes(k));
}

function inferCategory(
  text: string
): ParsedScoreCriterion["category"] {
  if (/价格|报价|低价|价分|投标报价/.test(text)) return "price";
  if (/售后|服务|培训|维护|质保|响应|支持/.test(text)) return "service";
  if (/实施|进度|组织|交付|部署|安装|项目经理|团队|风险控制/.test(text)) {
    return "implementation";
  }
  if (/技术|方案|参数|功能|配置|设备|建设|系统/.test(text)) {
    return "technical";
  }
  if (/商务|资质|业绩|经验|合同|信誉|履约/.test(text)) {
    return "business";
  }
  return "other";
}

function extractKeywords(text: string): string[] {
  const words = (text.match(/[\u4e00-\u9fa5A-Za-z0-9_-]{2,24}/g) || [])
    .map((x) => x.trim())
    .filter(Boolean);

  return Array.from(new Set(words)).slice(0, 6);
}

function canonicalForDedup(text: string) {
  return text
    .replace(/\s+/g, "")
    .replace(/[，。；：、“”"'‘’（）()【】\[\]\-—]/g, "")
    .trim();
}

function splitEvaluationLines(text: string): string[] {
  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /^\d+[\.、]/.test(line) || /^[一二三四五六七八九十]+、/.test(line));
}

function parseScoreLine(line: string): { scoreItem: string; criteria: string } | null {
  const s = normalizeText(
    line.replace(/^\s*(\d+[\.、]?|[一二三四五六七八九十]+、)\s*/, "")
  );

  if (!s) return null;

  const m = s.match(/^([^：:]{2,40})[：:](.+)$/);
  if (m) {
    return {
      scoreItem: m[1].trim(),
      criteria: m[2].trim(),
    };
  }

  if (/评分|得分|满分|评审|计算|低价/.test(s)) {
    return {
      scoreItem: s.slice(0, 20).replace(/[：:，,。；;]$/, "").trim() || "评分项",
      criteria: s,
    };
  }

  return null;
}

export function extractScoreCriteria(
  sections: ParsedTenderSection[]
): ParsedScoreCriterion[] {
  const out: ParsedScoreCriterion[] = [];
  const seen = new Set<string>();

  const evalSections = sections.filter(looksLikeEvaluationSection);

  for (const section of evalSections) {
    const lines = splitEvaluationLines(section.text);

    for (const line of lines) {
      const parsed = parseScoreLine(line);
      if (!parsed) continue;

      const merged = `${parsed.scoreItem} ${parsed.criteria}`;
      if (!/评分|得分|满分|评审|计算|低价/.test(merged)) continue;

      const dedupKey = canonicalForDedup(`${parsed.scoreItem}::${parsed.criteria}`);
      if (!dedupKey || seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      out.push({
        id: `score-${out.length + 1}`,
        scoreItem: parsed.scoreItem,
        criteria: parsed.criteria,
        keywords: extractKeywords(merged),
        category: inferCategory(merged),
        sourceSectionId: section.id,
      });
    }
  }

  return out;
}
