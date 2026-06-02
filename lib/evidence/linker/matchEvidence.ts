import type {
  EvidenceMatch,
  EvidenceRegistryState,
  KeywordMapping,
  OcrDocumentResult,
  RequirementItem,
  SemanticClassification,
} from "../types";
import type { OcrKeywordIndex } from "../ocr/keywordIndex";
import { lookupTerm } from "../ocr/keywordIndex";
import { locateTermsInOcr } from "./locateInOcr";
import { tokenizeTerms } from "./tokenize";

function newLinkId() {
  return `lnk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function classificationBoost(
  kind: SemanticClassification["kind"] | undefined,
  category: RequirementItem["category"],
): number {
  if (!kind || !category) return 0;
  if (kind === "certification" && category === "qualification") return 0.25;
  if (kind === "test_report" && category === "technical") return 0.15;
  if (kind === "datasheet" && category === "technical") return 0.1;
  if (kind === "case_study" && category === "commercial") return 0.1;
  return 0;
}

/**
 * Evidence Match — 需求关键词 ↔ 证据记录（基于 OCR 索引）
 */
export function matchRequirementToEvidence(input: {
  requirement: RequirementItem;
  mapping: KeywordMapping;
  index: OcrKeywordIndex;
  ocrDocuments: OcrDocumentResult[];
  classifications: SemanticClassification[];
  registry: EvidenceRegistryState;
  minLinkScore: number;
}): EvidenceMatch[] {
  const {
    requirement,
    mapping,
    index,
    ocrDocuments,
    classifications,
    registry,
    minLinkScore,
  } = input;

  const classByAtt = new Map(classifications.map((c) => [c.attachmentId, c]));
  const matches: EvidenceMatch[] = [];

  for (const record of registry.records) {
    const classification = classByAtt.get(record.attachmentId);
    const corpus = `${record.title}\n${record.extractedText || ""}`.slice(0, 8000);
    const docTokens = new Set(tokenizeTerms(corpus));

    const matchedTerms: string[] = [];
    const keywordHits: string[] = [];
    let hits = 0;

    for (const kw of mapping.keywords) {
      const indexHits = lookupTerm(index, kw);
      const inDoc =
        docTokens.has(kw) ||
        [...docTokens].some((t) => t.includes(kw) || kw.includes(t)) ||
        indexHits.some((e) => e.attachmentId === record.attachmentId);

      if (inDoc) {
        hits += 1;
        keywordHits.push(kw);
        matchedTerms.push(kw);
      }
    }

    if (!mapping.keywords.length) continue;

    let score = hits / mapping.keywords.length;
    score += classificationBoost(classification?.kind, requirement.category);
    score = Math.min(1, Math.round(score * 100) / 100);

    if (score < minLinkScore) continue;

    const locations = locateTermsInOcr(
      index,
      ocrDocuments,
      keywordHits,
      record.attachmentId,
    );

    const confidence = Math.min(
      1,
      Math.round((score * 0.7 + (locations.length > 0 ? 0.3 : 0)) * 100) / 100,
    );

    const explain: string[] = [
      `关键词命中 ${keywordHits.length}/${mapping.keywords.length}`,
      `匹配分 ${score}`,
    ];
    if (classification) {
      explain.push(`证据类型 ${classification.kind}（${classification.label}）`);
    }
    if (locations.length) {
      explain.push(
        `OCR 定位 ${locations.length} 处：${locations
          .slice(0, 2)
          .map((l) => `p${l.page}/${l.blockId}`)
          .join(", ")}`,
      );
    }

    matches.push({
      linkId: newLinkId(),
      requirementId: requirement.id,
      evidenceId: record.id,
      attachmentId: record.attachmentId,
      score,
      confidence,
      matchedTerms: [...new Set(matchedTerms)].slice(0, 12),
      keywordHits: [...new Set(keywordHits)].slice(0, 12),
      locations,
      classificationKind: classification?.kind,
      explain,
    });
  }

  return matches.sort((a, b) => b.score - a.score);
}
