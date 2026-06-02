import type { TenderRequirement } from "@/lib/tender/types";

import type { SemanticRequirement } from "./types";

const MEASURABLE_PATTERNS: RegExp[] = [
  /[≥≤<>]=?\s*\d+/,
  /\d+\s*(年|个月|月|天|日|周|calendar)/i,
  /\d+\s*(km\/h|kg|mm|cm|m²|平方米|%|％)/i,
  /不少于|不低于|不小于|不超过|至多|至少\s*\d+/,
  /≤\s*\d+|≥\s*\d+/,
];

const EVIDENCE_PATTERNS: RegExp[] = [
  /ISO\s*\d+/i,
  /检测报告|检验报告|型式检验/,
  /营业执照|资质证书|信用等级|AAA/,
  /类似案例|业绩|合同复印件|授权书|承诺函/,
  /原件|扫描件|加盖公章/,
];

function normalizeRequirementText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[，,]/g, "，")
    .trim()
    .slice(0, 500);
}

function extractMeasurableFields(text: string): string[] {
  const fields: string[] = [];
  const patterns = [
    /[≥≤<>]=?\s*[\d.]+(?:\s*(?:km\/h|kg|mm|cm|m²|%|％|年|天|月))?/gi,
    /\d+\s*(?:年|个月|月|天|日|周)(?:\s*质保|\s*保修)?/gi,
    /(?:不少于|不低于|不超过|至少)\s*[\d.]+/g,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) fields.push(...m.map((x) => x.trim()));
  }
  return [...new Set(fields)].slice(0, 8);
}

function isMeasurable(text: string): boolean {
  return MEASURABLE_PATTERNS.some((p) => p.test(text));
}

function needsEvidence(text: string): boolean {
  return EVIDENCE_PATTERNS.some((p) => p.test(text));
}

/**
 * TenderRequirement → SemanticRequirement
 */
export function buildSemanticRequirements(
  requirements: TenderRequirement[],
  sectionIdByReq?: Map<string, string>,
): SemanticRequirement[] {
  return requirements.map((r) => {
    const measurable = isMeasurable(r.requirement);
    return {
      id: r.id,
      category: r.category,
      title: r.title,
      requirement: r.requirement,
      normalizedRequirement: normalizeRequirementText(r.requirement),
      sourceSectionId: sectionIdByReq?.get(r.id),
      sourcePage: r.sourcePage,
      importance: r.importance,
      evidenceRequired: needsEvidence(r.requirement) || r.category === "attachment",
      measurable,
      measurableFields: measurable ? extractMeasurableFields(r.requirement) : undefined,
      relatedRisks: [],
      relatedScoringItems: [],
    };
  });
}

export function attachRequirementRelations(
  reqs: SemanticRequirement[],
  riskIds: Map<string, string[]>,
  scoringIds: Map<string, string[]>,
): SemanticRequirement[] {
  return reqs.map((r) => ({
    ...r,
    relatedRisks: riskIds.get(r.id) || [],
    relatedScoringItems: scoringIds.get(r.id) || [],
  }));
}
