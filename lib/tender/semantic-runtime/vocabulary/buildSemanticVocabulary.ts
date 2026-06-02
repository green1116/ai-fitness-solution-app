import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { EvidenceType } from "@/lib/tender/evidence/types";
import type { SemanticVocabulary } from "../types";

const STOP = new Set([
  "的",
  "和",
  "与",
  "或",
  "及",
  "等",
  "应",
  "须",
  "需",
  "提供",
  "要求",
  "投标",
  "人",
]);

function tokenize(text: string): string[] {
  return text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9%/.\-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

/**
 * V3.2 从语义图抽取运行时词汇表
 */
export function buildSemanticVocabulary(
  graph: TenderSemanticGraph,
): SemanticVocabulary {
  const categories = [...new Set(graph.requirements.map((r) => r.category))];
  const phases = [...new Set(graph.sections.map((s) => s.tenderPhase))];
  const importanceLevels = [
    ...new Set(graph.requirements.map((r) => r.importance)),
  ];

  const evidenceTypes = new Set<EvidenceType>();
  const keywordSet = new Set<string>();

  for (const req of graph.requirements) {
    for (const t of tokenize(req.normalizedRequirement || req.requirement)) {
      keywordSet.add(t);
    }
    if (req.measurable) keywordSet.add("measurable");
    if (req.evidenceRequired) keywordSet.add("evidence_required");
  }

  for (const item of graph.scoringItems) {
    for (const e of item.evidenceNeeded) {
      for (const t of tokenize(e)) keywordSet.add(t);
    }
    if (/技术|参数/.test(item.title)) evidenceTypes.add("datasheet");
    if (/资质|认证/.test(item.title)) evidenceTypes.add("certification");
  }

  for (const risk of graph.risks) {
    for (const t of tokenize(risk.description)) keywordSet.add(t);
  }

  const defaultTypes: EvidenceType[] = [
    "datasheet",
    "certification",
    "test_report",
    "case_study",
  ];
  for (const t of defaultTypes) evidenceTypes.add(t);

  const keywords = [...keywordSet].slice(0, 80);

  return {
    categories,
    evidenceTypes: [...evidenceTypes],
    phases,
    importanceLevels,
    keywords,
    termCount: keywords.length + categories.length + evidenceTypes.size,
  };
}
