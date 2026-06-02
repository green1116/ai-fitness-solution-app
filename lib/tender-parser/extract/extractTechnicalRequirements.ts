import type {
  ParsedTenderSection,
  ParsedTechnicalRequirement,
} from "@/lib/tender-parser/types";

const TECH_SECTION_CATEGORIES = new Set<ParsedTenderSection["category"]>([
  "technical",
]);

const TECH_TITLE_HINTS = [
  "技术要求",
  "采购需求",
  "设备要求",
  "参数要求",
  "功能要求",
  "建设内容",
  "实施要求",
  "服务要求",
  "技术规格",
  "规格参数",
  "项目需求",
  "技术方案要求",
];

const REQUIREMENT_PATTERNS = [
  /应当?/,
  /需/,
  /须/,
  /必须/,
  /提供/,
  /满足/,
  /达到/,
  /不少于/,
  /不低于/,
  /不小于/,
  /不得低于/,
  /应支持/,
  /应具备/,
  /应包含/,
  /应满足/,
  /应提供/,
  /可实现/,
  /能够/,
  /完成/,
  /配置/,
  /安装/,
  /部署/,
  /验收/,
  /培训/,
  /售后/,
  /安全/,
  /防护/,
];

const NOISE_PATTERNS = [
  /^项目(背景|概况|简介|介绍)/,
  /^为进一步/,
  /^根据.+(规定|要求|政策)/,
  /^本项目旨在/,
  /^现对.+进行/,
  /^通过.+提升/,
  /^供应商应充分考虑/,
  /^投标人应认真阅读/,
  /^本章(说明|适用)/,
  /^以下内容仅供/,
];

const PRIORITY_MUST_PATTERNS = [
  /必须/,
  /应/,
  /须/,
  /不得/,
  /不少于/,
  /不低于/,
  /不小于/,
  /应满足/,
  /应提供/,
  /应具备/,
];

const PRIORITY_PREFERRED_PATTERNS = [/优先/, /推荐/, /宜/, /建议/];

const SPACE_HINTS = [
  "场地",
  "空间",
  "面积",
  "布局",
  "分区",
  "动线",
  "区域",
  "房间",
];

const EQUIPMENT_HINTS = [
  "设备",
  "器械",
  "主机",
  "配件",
  "硬件",
  "终端",
  "系统",
  "设施",
];

const CAPACITY_HINTS = [
  "人数",
  "容量",
  "承载",
  "并发",
  "工位",
  "使用人数",
  "服务人数",
];

const SERVICE_HINTS = [
  "培训",
  "售后",
  "维护",
  "保修",
  "质保",
  "巡检",
  "服务响应",
  "支持服务",
];

const SAFETY_HINTS = [
  "安全",
  "消防",
  "防护",
  "合规",
  "环保",
  "警示",
  "防滑",
  "应急",
];

const IMPLEMENTATION_HINTS = [
  "实施",
  "安装",
  "部署",
  "交付",
  "上线",
  "进度",
  "工期",
  "调试",
];

const ACCEPTANCE_HINTS = ["验收", "测试", "联调", "检验", "交接", "试运行"];

const STOPWORDS = new Set([
  "本项目",
  "项目",
  "采购",
  "要求",
  "技术",
  "供应商",
  "投标人",
  "应",
  "应当",
  "必须",
  "提供",
  "满足",
  "进行",
  "相关",
  "包括",
  "完成",
]);

function normalizeSentenceText(s: string): string {
  return String(s || "")
    .replace(/[ \t]+/g, " ")
    .replace(/[•●▪■◆□▢▣◻◼⬜]/g, "")
    .replace(/[（(]\s*/g, "（")
    .replace(/\s*[）)]/g, "）")
    .replace(/\s*[:：]\s*/g, "：")
    .replace(/\s*[;；]\s*/g, "；")
    .replace(/\s*[，,]\s*/g, "，")
    .replace(/\s*[。]\s*/g, "。")
    .trim();
}

function splitIntoSentences(text: string): string[] {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .flatMap((line) =>
      line.split(/(?<=[。；;！!？?])|(?<=\d\.)|(?<=\))|(?<=）)/g)
    )
    .map((s) => normalizeSentenceText(s))
    .filter(Boolean);
}

function looksLikeTechnicalSection(section: ParsedTenderSection): boolean {
  if (TECH_SECTION_CATEGORIES.has(section.category)) return true;
  const title = section.title || "";
  return TECH_TITLE_HINTS.some((k) => title.includes(k));
}

function isNoiseSentence(sentence: string): boolean {
  if (!sentence) return true;
  if (sentence.length < 8) return true;
  if (sentence.length > 240) return true;
  return NOISE_PATTERNS.some((re) => re.test(sentence));
}

function looksLikeRequirementSentence(sentence: string): boolean {
  if (isNoiseSentence(sentence)) return false;
  return REQUIREMENT_PATTERNS.some((re) => re.test(sentence));
}

function inferPriority(
  sentence: string
): ParsedTechnicalRequirement["priority"] {
  if (PRIORITY_MUST_PATTERNS.some((re) => re.test(sentence))) return "must";
  if (PRIORITY_PREFERRED_PATTERNS.some((re) => re.test(sentence)))
    return "preferred";
  return "optional";
}

function inferRequirementType(
  sentence: string
): ParsedTechnicalRequirement["requirementType"] {
  if (SPACE_HINTS.some((k) => sentence.includes(k))) return "space";
  if (EQUIPMENT_HINTS.some((k) => sentence.includes(k))) return "equipment";
  if (CAPACITY_HINTS.some((k) => sentence.includes(k))) return "capacity";
  if (SERVICE_HINTS.some((k) => sentence.includes(k))) return "service";
  if (SAFETY_HINTS.some((k) => sentence.includes(k))) return "safety";
  if (IMPLEMENTATION_HINTS.some((k) => sentence.includes(k)))
    return "implementation";
  if (ACCEPTANCE_HINTS.some((k) => sentence.includes(k))) return "acceptance";
  return "other";
}

function extractKeywords(sentence: string): string[] {
  const candidates = Array.from(
    new Set(
      (sentence.match(/[\u4e00-\u9fa5A-Za-z0-9_-]{2,20}/g) || [])
        .map((x) => x.trim())
        .filter(Boolean)
        .filter((x) => !STOPWORDS.has(x))
    )
  );

  return candidates
    .map((word) => ({
      word,
      score:
        (/\d/.test(word) ? 2 : 0) +
        (/(系统|设备|器械|场地|安装|部署|培训|验收|安全|消防|维护|质保)/.test(
          word
        )
          ? 3
          : 0) +
        Math.min(word.length, 4),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.word);
}

function canonicalForDedup(sentence: string): string {
  return sentence
    .replace(/\s+/g, "")
    .replace(/[，。；：、“”"'‘’（）()【】\[\]\-—]/g, "")
    .trim();
}

function maybeTrimLeadingNumbering(sentence: string): string {
  return sentence.replace(
    /^\s*((第[一二三四五六七八九十0-9]+[章节条款项])|([一二三四五六七八九十]+[、.])|(\d+(\.\d+){0,3})|([（(]?[0-9一二三四五六七八九十]+[）)]))\s*/,
    ""
  );
}

export function extractTechnicalRequirements(
  sections: ParsedTenderSection[]
): ParsedTechnicalRequirement[] {
  const out: ParsedTechnicalRequirement[] = [];
  const seen = new Set<string>();

  const technicalSections = (sections || []).filter(looksLikeTechnicalSection);
  for (const section of technicalSections) {
    const sentences = splitIntoSentences(section.text);
    for (const rawSentence of sentences) {
      const sentence = normalizeSentenceText(
        maybeTrimLeadingNumbering(rawSentence)
      );
      if (!looksLikeRequirementSentence(sentence)) continue;

      const dedupKey = canonicalForDedup(sentence);
      if (!dedupKey || seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      out.push({
        id: `tech-${out.length + 1}`,
        sectionTitle: section.title,
        text: sentence,
        requirementType: inferRequirementType(sentence),
        keywords: extractKeywords(sentence),
        priority: inferPriority(sentence),
        sourceSectionId: section.id,
      });
    }
  }

  return out;
}

