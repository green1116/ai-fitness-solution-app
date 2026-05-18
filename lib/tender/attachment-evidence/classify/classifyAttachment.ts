import type { EvidenceType } from "@/lib/tender/evidence/types";
import type { ExtractedAttachment } from "../types";

type ClassificationRule = {
  type: EvidenceType;
  label: string;
  patterns: RegExp[];
  filePatterns?: RegExp[];
  weight: number;
};

const RULES: ClassificationRule[] = [
  {
    type: "certification",
    label: "资质/认证证书",
    patterns: [/ISO\s*9001|ISO\s*14001|CE\b|认证|证书|资质|许可/gi],
    filePatterns: [/资质|认证|证书|license|cert/i],
    weight: 1,
  },
  {
    type: "test_report",
    label: "检测/检验报告",
    patterns: [/检测报告|检验报告|测试报告|报告编号|CNAS|CMA/gi],
    filePatterns: [/检测|检验|报告|test/i],
    weight: 1,
  },
  {
    type: "case_study",
    label: "业绩/案例材料",
    patterns: [/业绩|合同|案例|项目经验|中标通知书/gi],
    filePatterns: [/业绩|案例|合同|case/i],
    weight: 0.9,
  },
  {
    type: "datasheet",
    label: "技术参数/规格表",
    patterns: [/技术参数|规格|datasheet|功率|速度|尺寸|额定/gi],
    filePatterns: [/参数|规格|技术|datasheet/i],
    weight: 0.85,
  },
  {
    type: "warranty",
    label: "质保/保修承诺",
    patterns: [/质保|保修|warranty/gi],
    filePatterns: [/质保|保修/i],
    weight: 0.8,
  },
  {
    type: "sla",
    label: "售后服务/SLA",
    patterns: [/SLA|售后服务|响应时间|服务等级/gi],
    filePatterns: [/售后|sla|服务/i],
    weight: 0.8,
  },
  {
    type: "drawing",
    label: "图纸/布置图",
    patterns: [/图纸|布置图|安装图|平面图|drawing/gi],
    filePatterns: [/图纸|布置|安装图/i],
    weight: 0.85,
  },
];

/**
 * V3.3 确定性附件分类 → EvidenceType
 */
export function classifyAttachment(
  extraction: ExtractedAttachment,
): ExtractedAttachment {
  const corpus = `${extraction.fileName}\n${extraction.rawText}`.slice(0, 8000);
  let bestType: EvidenceType = "datasheet";
  let bestLabel = "通用附件材料";
  let bestScore = 0.35;

  const tags: string[] = [];

  for (const rule of RULES) {
    let score = 0;
    for (const p of rule.patterns) {
      if (p.test(corpus)) {
        score += rule.weight;
        tags.push(rule.type);
      }
    }
    for (const fp of rule.filePatterns || []) {
      if (fp.test(extraction.fileName)) score += rule.weight * 0.5;
    }
    if (score > bestScore) {
      bestScore = score;
      bestType = rule.type;
      bestLabel = rule.label;
    }
  }

  if (extraction.extractionMethod === "filename_only") {
    bestScore = Math.min(bestScore, 0.45);
  }

  return {
    ...extraction,
    evidenceType: bestType,
    classificationLabel: bestLabel,
    classificationConfidence: Math.min(1, Math.round(bestScore * 100) / 100),
    semanticTags: [...new Set(tags)].slice(0, 8),
  };
}
