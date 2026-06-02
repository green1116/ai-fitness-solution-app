import type { SemanticSection } from "./types";
import type { ScoringCategory, SemanticScoringItem } from "./types";

const SCORING_LINE = /评分|得分|满分|分值|权重|评标|综合评分|\d+\s*分/;

const FOCUS_MAP: { pattern: RegExp; focus: string[] }[] = [
  {
    pattern: /技术方案|方案先进性|系统设计/,
    focus: ["系统化设计", "扩展能力", "稳定性", "可维护性"],
  },
  {
    pattern: /类似案例|业绩|成功经验/,
    focus: ["行业案例", "交付规模", "客户验证"],
  },
  {
    pattern: /服务|SLA|响应|售后/,
    focus: ["响应时效", "运维体系", "培训交付"],
  },
  {
    pattern: /交付|工期|周期/,
    focus: ["里程碑", "并行策略", "资源保障"],
  },
  {
    pattern: /价格|报价|商务/,
    focus: ["价格合理性", "分项闭环", "性价比"],
  },
];

const EVIDENCE_HINTS = [
  "技术方案说明",
  "案例证明材料",
  "服务承诺书",
  "交付计划",
  "资质证书",
  "检测报告",
];

function inferScoringCategory(text: string): ScoringCategory {
  if (/资格|资质|信用/.test(text)) return "qualification";
  if (/商务|价格|报价/.test(text)) return "commercial";
  if (/服务|售后|SLA/.test(text)) return "service";
  return "technical";
}

function inferEvaluationFocus(title: string): string[] {
  for (const { pattern, focus } of FOCUS_MAP) {
    if (pattern.test(title)) return focus;
  }
  return ["响应完整性", "可核验性"];
}

function extractScoringLines(content: string): string[] {
  return content
    .split(/\n|；|;/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 4 && SCORING_LINE.test(l))
    .slice(0, 24);
}

/**
 * 从评分相关章节抽取 SemanticScoringItem
 */
export function buildSemanticScoringItems(
  sections: SemanticSection[],
): SemanticScoringItem[] {
  const items: SemanticScoringItem[] = [];
  let seq = 0;

  const scoringSections = sections.filter(
    (s) => s.semanticRole === "scoring" || /评分|评标/.test(s.title),
  );

  for (const sec of scoringSections) {
    const lines = extractScoringLines(sec.content);
    for (const line of lines) {
      seq += 1;
      const title = line.slice(0, 60);
      items.push({
        id: `SCR-${String(seq).padStart(4, "0")}`,
        title,
        scoringCategory: inferScoringCategory(line),
        evidenceNeeded: EVIDENCE_HINTS.filter((e) =>
          line.includes(e.slice(0, 2)),
        ).length
          ? EVIDENCE_HINTS.slice(0, 3)
          : ["方案材料", "证明材料"],
        relatedSections: [sec.id],
        evaluationFocus: inferEvaluationFocus(title),
        possibleRiskFactors: ["材料不完整", "响应偏离"],
      });
    }
  }

  if (!items.length) {
    for (const sec of sections) {
      if (!/评分|评标|得分/.test(sec.content.slice(0, 500))) continue;
      seq += 1;
      items.push({
        id: `SCR-${String(seq).padStart(4, "0")}`,
        title: sec.title,
        scoringCategory: "technical",
        evidenceNeeded: ["评分对照表"],
        relatedSections: [sec.id],
        evaluationFocus: inferEvaluationFocus(sec.title),
        possibleRiskFactors: ["评分项遗漏"],
      });
    }
  }

  return items;
}
