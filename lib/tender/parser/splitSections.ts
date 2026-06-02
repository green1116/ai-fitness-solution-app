import type { ParsedPage, TenderSection } from "@/lib/tender/types";

const SECTION_HEADING_PATTERNS: { re: RegExp; titleHint?: string }[] = [
  { re: /^第[一二三四五六七八九十百千\d]+章[\s:：、.．]*/ },
  { re: /^第[一二三四五六七八九十\d]+节[\s:：、.．]*/ },
  { re: /^[一二三四五六七八九十]+[、.．]\s*/ },
  { re: /^（[一二三四五六七八九十\d]+）\s*/ },
  { re: /^\d+(\.\d+){0,3}\s+/ },
  { re: /^附件\s*[一二三四五六七八九十\d]*/ },
];

const KNOWN_SECTION_TITLES: { pattern: RegExp; id: string; title: string }[] = [
  { pattern: /投标须知|投标人须知/, id: "notice", title: "投标须知" },
  { pattern: /项目概况|项目说明|项目背景/, id: "overview", title: "项目概况" },
  { pattern: /技术要求|技术规格|采购需求|技术参数/, id: "technical", title: "技术要求" },
  { pattern: /商务要求|商务条款|合同条款/, id: "commercial", title: "商务要求" },
  { pattern: /评分标准|评标办法|综合评分|评审办法/, id: "scoring", title: "评分标准" },
  { pattern: /资格|资质|投标人资格/, id: "qualification", title: "资格要求" },
  { pattern: /附件/, id: "attachment", title: "附件" },
];

function looksLikeSectionHeading(line: string): boolean {
  const s = line.trim();
  if (!s || s.length > 80) return false;
  return SECTION_HEADING_PATTERNS.some(({ re }) => re.test(s));
}

function resolveSectionMeta(heading: string): { id: string; title: string } {
  const h = heading.trim();
  for (const known of KNOWN_SECTION_TITLES) {
    if (known.pattern.test(h)) {
      return { id: known.id, title: known.title };
    }
  }
  const slug = h.slice(0, 24).replace(/\s+/g, "-") || "section";
  return { id: `sec-${slug}`, title: h.slice(0, 60) || "未命名章节" };
}

function pageForCharOffset(pages: ParsedPage[], offset: number): number | undefined {
  let acc = 0;
  for (const p of pages) {
    acc += p.text.length + 2;
    if (offset < acc) return p.page;
  }
  return pages[pages.length - 1]?.page;
}

/**
 * 按标题模式切分章节（可扩展为 LLM sectionizer）
 */
export function splitSections(
  normalizedText: string,
  pages: ParsedPage[],
): TenderSection[] {
  const lines = normalizedText.split("\n");
  const sections: TenderSection[] = [];
  let currentTitle = "前言";
  let currentId = "preface";
  let buffer: string[] = [];
  let charOffset = 0;
  let sectionStartOffset = 0;
  let seq = 0;

  const flush = () => {
    const content = buffer.join("\n").trim();
    if (!content && sections.length > 0) return;
    const startPage = pageForCharOffset(pages, sectionStartOffset);
    const endPage = pageForCharOffset(pages, charOffset);
    sections.push({
      id: `${currentId}-${String(++seq).padStart(2, "0")}`,
      title: currentTitle,
      content: content || buffer.join("\n").trim(),
      startPage,
      endPage,
    });
    buffer = [];
    sectionStartOffset = charOffset;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    charOffset += line.length + 1;

    if (looksLikeSectionHeading(trimmed)) {
      flush();
      const meta = resolveSectionMeta(trimmed);
      currentId = meta.id;
      currentTitle = trimmed.length <= 60 ? trimmed : meta.title;
      buffer.push(trimmed);
      continue;
    }
    buffer.push(line);
  }
  flush();

  if (!sections.length && normalizedText.trim()) {
    sections.push({
      id: "sec-whole-01",
      title: "全文",
      content: normalizedText.trim(),
      startPage: pages[0]?.page,
      endPage: pages[pages.length - 1]?.page,
    });
  }

  return sections;
}
