import type { TenderParseMetadata } from "@/lib/tender/types";

type MetadataRule = {
  key: keyof TenderParseMetadata;
  patterns: RegExp[];
  transform?: (m: RegExpMatchArray) => string;
};

const RULES: MetadataRule[] = [
  {
    key: "projectName",
    patterns: [
      /项目名称[：:]\s*([^\n\r]{2,80})/,
      /采购项目名称[：:]\s*([^\n\r]{2,80})/,
      /招标项目名称[：:]\s*([^\n\r]{2,80})/,
    ],
    transform: (m) => m[1].trim(),
  },
  {
    key: "tenderCompany",
    patterns: [
      /招标人[：:]\s*([^\n\r]{2,60})/,
      /采购人[：:]\s*([^\n\r]{2,60})/,
      /招标单位[：:]\s*([^\n\r]{2,60})/,
    ],
    transform: (m) => m[1].trim(),
  },
  {
    key: "projectCode",
    patterns: [
      /项目编号[：:]\s*([A-Za-z0-9\-_/]{4,40})/,
      /招标编号[：:]\s*([A-Za-z0-9\-_/]{4,40})/,
      /采购编号[：:]\s*([A-Za-z0-9\-_/]{4,40})/,
    ],
    transform: (m) => m[1].trim(),
  },
  {
    key: "publishDate",
    patterns: [
      /公告发布(?:时间|日期)[：:]\s*(\d{4}[年\-/.]\d{1,2}[月\-/.]\d{1,2}日?)/,
      /发布时间[：:]\s*(\d{4}[年\-/.]\d{1,2}[月\-/.]\d{1,2}日?)/,
    ],
    transform: (m) => m[1].trim(),
  },
  {
    key: "deadline",
    patterns: [
      /投标截止(?:时间|日期)[：:]\s*([^\n\r]{8,40})/,
      /递交截止(?:时间|日期)[：:]\s*([^\n\r]{8,40})/,
      /开标时间[：:]\s*([^\n\r]{8,40})/,
    ],
    transform: (m) => m[1].trim(),
  },
];

/**
 * 从全文提取招标元数据（规则可扩展 / 后续接 LLM）
 */
export function extractMetadata(rawText: string): TenderParseMetadata {
  const head = rawText.slice(0, 12000);
  const meta: TenderParseMetadata = {};

  for (const rule of RULES) {
    if (meta[rule.key]) continue;
    for (const pattern of rule.patterns) {
      const m = head.match(pattern);
      if (m) {
        const val = rule.transform ? rule.transform(m) : m[1]?.trim();
        if (val) {
          (meta as Record<string, string>)[rule.key] = val;
          break;
        }
      }
    }
  }

  return meta;
}
