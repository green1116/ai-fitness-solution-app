import type { TenderSection } from "@/lib/tender/types";

import type { SemanticRole, SemanticSection, TenderPhase } from "./types";

type RoleRule = { patterns: RegExp[]; role: SemanticRole; phase: TenderPhase };

const ROLE_RULES: RoleRule[] = [
  {
    patterns: [/项目概况|项目背景|项目说明|招标公告|投标须知/],
    role: "overview",
    phase: "qualification",
  },
  {
    patterns: [/需求理解|技术要求|采购需求|技术规格|参数/],
    role: "requirement",
    phase: "technical",
  },
  {
    patterns: [/空间规划|分区|布局|配置清单|设备清单/],
    role: "configuration",
    phase: "technical",
  },
  {
    patterns: [/实施计划|进度|里程碑|施工|安装/],
    role: "implementation",
    phase: "delivery",
  },
  {
    patterns: [/商务响应|技术响应|响应摘要|服务承诺/],
    role: "response",
    phase: "commercial",
  },
  {
    patterns: [/评分|评标|综合评分|得分/],
    role: "scoring",
    phase: "evaluation",
  },
  {
    patterns: [/风险|对策|应急预案/],
    role: "risk",
    phase: "delivery",
  },
  {
    patterns: [/附件|附录|资格|资质/],
    role: "appendix",
    phase: "qualification",
  },
  {
    patterns: [/方案设计|设计原则|总体规划/],
    role: "planning",
    phase: "technical",
  },
];

function inferRoleAndPhase(
  title: string,
  content: string,
): { role: SemanticRole; phase: TenderPhase } {
  const blob = `${title}\n${content}`.slice(0, 2000);
  for (const rule of ROLE_RULES) {
    if (rule.patterns.some((p) => p.test(blob))) {
      return { role: rule.role, phase: rule.phase };
    }
  }
  if (/商务|付款|报价|合同/.test(blob)) {
    return { role: "response", phase: "commercial" };
  }
  return { role: "requirement", phase: "technical" };
}

/**
 * 从解析章节构建语义章节（title + content + TOC 层级 hint）
 */
export function buildSemanticSections(
  sections: TenderSection[],
): SemanticSection[] {
  return sections.map((sec) => {
    const { role, phase } = inferRoleAndPhase(sec.title, sec.content);
    return {
      id: sec.id,
      title: sec.title,
      semanticRole: role,
      tenderPhase: phase,
      content: sec.content,
      linkedRequirements: [],
      linkedScoringItems: [],
      linkedRisks: [],
    };
  });
}

export function linkSectionRelations(
  semanticSections: SemanticSection[],
  requirementIdsBySection: Map<string, string[]>,
  scoringIdsBySection: Map<string, string[]>,
  riskIdsBySection: Map<string, string[]>,
): SemanticSection[] {
  return semanticSections.map((s) => ({
    ...s,
    linkedRequirements: requirementIdsBySection.get(s.id) || [],
    linkedScoringItems: scoringIdsBySection.get(s.id) || [],
    linkedRisks: riskIdsBySection.get(s.id) || [],
  }));
}
