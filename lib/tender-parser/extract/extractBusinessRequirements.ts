import type {
  ParsedTenderSection,
  ParsedBusinessRequirement,
} from "@/lib/tender-parser/types";

const BUSINESS_SECTION_CATEGORIES = new Set<ParsedTenderSection["category"]>([
  "business",
  "contract",
]);

const BUSINESS_TITLE_HINTS = [
  "商务要求",
  "商务条款",
  "报价要求",
  "付款方式",
  "交货期限",
  "交付地点",
  "售后服务",
  "质保期",
  "合同条款",
  "合同主要条款",
  "验收要求",
  "服务要求",
];

const REQUIREMENT_PATTERNS = [
  /应当?/,
  /需/,
  /须/,
  /必须/,
  /提供/,
  /满足/,
  /达到/,
  /执行/,
  /承担/,
  /负责/,
  /交付/,
  /验收/,
  /付款/,
  /支付/,
  /报价/,
  /税费/,
  /质保/,
  /售后/,
  /服务响应/,
  /违约/,
  /期限/,
];

const NOISE_PATTERNS = [
  /^项目(背景|概况|简介|介绍)/,
  /^根据.+(规定|要求|政策)/,
  /^本项目旨在/,
  /^本章(说明|适用)/,
  /^现对.+进行/,
  /^投标人应认真阅读/,
  /^以下内容仅供/,
];

const PRIORITY_MUST_PATTERNS = [
  /必须/,
  /应/,
  /须/,
  /不得/,
  /应满足/,
  /应提供/,
  /应承担/,
  /应负责/,
  /不低于/,
  /不少于/,
  /不超过/,
];

const PRIORITY_PREFERRED_PATTERNS = [/优先/, /推荐/, /宜/, /建议/];

const PRICING_HINTS = [
  "报价",
  "总价",
  "单价",
  "税费",
  "含税",
  "不含税",
  "价格",
  "费用",
  "结算",
  "优惠",
];

const PAYMENT_HINTS = [
  "付款",
  "支付",
  "预付款",
  "进度款",
  "尾款",
  "结算",
  "发票",
];

const DELIVERY_HINTS = [
  "交货",
  "交付",
  "到货",
  "工期",
  "期限",
  "进度",
  "实施周期",
  "交付地点",
  "履约",
];

const SERVICE_HINTS = [
  "质保",
  "保修",
  "售后",
  "维护",
  "培训",
  "服务响应",
  "技术支持",
  "巡检",
];

const STOPWORDS = new Set([
  "本项目",
  "项目",
  "采购",
  "要求",
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
  "合同",
  "商务",
  "条款",
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

function looksLikeBusinessSection(section: ParsedTenderSection): boolean { 
  if (BUSINESS_SECTION_CATEGORIES.has(section.category)) return true;
  const title = section.title || "";
  return BUSINESS_TITLE_HINTS.some((k) => title.includes(k));
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
): ParsedBusinessRequirement["priority"] {
  if (PRIORITY_MUST_PATTERNS.some((re) => re.test(sentence))) return "must";
  if (PRIORITY_PREFERRED_PATTERNS.some((re) => re.test(sentence)))
    return "preferred";
  return "optional";
}

function inferRequirementType(
  sentence: string
): ParsedBusinessRequirement["requirementType"] {
  if (PRICING_HINTS.some((k) => sentence.includes(k))) return "pricing";
  if (PAYMENT_HINTS.some((k) => sentence.includes(k))) return "payment";
  if (DELIVERY_HINTS.some((k) => sentence.includes(k))) return "delivery";
  if (SERVICE_HINTS.some((k) => sentence.includes(k))) return "service";
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
        (/(报价|税费|付款|支付|发票|交付|交货|工期|质保|售后|维护|服务)/.test(
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

export function extractBusinessRequirements(
  sections: ParsedTenderSection[]
): ParsedBusinessRequirement[] {
  const out: ParsedBusinessRequirement[] = [];
  const seen = new Set<string>();

  const businessSections = sections.filter(looksLikeBusinessSection);
  for (const section of businessSections) {
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
        id: `biz-${out.length + 1}`,
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

