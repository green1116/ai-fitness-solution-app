import type {
  EvidenceLinkRecord,
  EvidenceRegistryState,
  OcrDocumentResult,
  OcrExtraction,
  RequirementAnchor,
  RequirementItem,
  SemanticClassification,
} from "../types";
import { addEvidenceLink } from "../registry";
import { requirementItemsFromAnchors } from "./normalizeRequirement";
import { runEvidenceLinkingRuntime } from "./runEvidenceLinkingRuntime";
import { tokenizeTerms } from "./tokenize";

export type LinkRequirementsInput = {
  extractions: OcrExtraction[];
  classifications: SemanticClassification[];
  requirements?: RequirementAnchor[];
  requirementItems?: RequirementItem[];
  registry: EvidenceRegistryState;
  minLinkScore?: number;
  /** V3.4-E3：提供块级 OCR 时走完整 Linking Runtime */
  ocrDocuments?: OcrDocumentResult[];
  runId?: string;
};

export type LinkRequirementsResult = {
  registry: EvidenceRegistryState;
  links: EvidenceLinkRecord[];
  linking?: import("../types").EvidenceLinkingRuntimeResult;
};

/**
 * Linker — 委托 V3.4-E3 Evidence Linking Runtime（有 ocrDocuments 时）
 */
export function linkRequirements(input: LinkRequirementsInput): LinkRequirementsResult {
  const items =
    input.requirementItems?.length
      ? input.requirementItems
      : requirementItemsFromAnchors(input.requirements || []);

  if (input.ocrDocuments?.length && items.length) {
    const linking = runEvidenceLinkingRuntime({
      runId: input.runId,
      requirements: items,
      ocrDocuments: input.ocrDocuments,
      classifications: input.classifications,
      registry: input.registry,
      minLinkScore: input.minLinkScore,
    });
    return {
      registry: linking.registry,
      links: linking.links,
      linking,
    };
  }

  return linkRequirementsLegacy(input);
}

/** E1 扁平 OCR 回退路径 */
function linkRequirementsLegacy(input: LinkRequirementsInput): LinkRequirementsResult {
  const minScore = input.minLinkScore ?? 0.35;
  let registry = input.registry;
  const links: EvidenceLinkRecord[] = [];
  const classByAtt = new Map(input.classifications.map((c) => [c.attachmentId, c]));

  const anchors = input.requirements || [];
  if (!anchors.length && input.requirementItems?.length) {
    for (const item of input.requirementItems) {
      anchors.push({
        id: item.id,
        text: item.text,
        category: item.category,
        mandatory: item.mandatory,
      });
    }
  }

  for (const ext of input.extractions) {
    const classification = classByAtt.get(ext.attachmentId);
    const corpus = `${ext.fileName}\n${ext.rawText}`.slice(0, 6000);
    const docTokens = tokenizeTerms(corpus);
    const evidenceId = `ev-${ext.attachmentId}`;

    for (const req of anchors) {
      const reqTokens = tokenizeTerms(req.text);
      if (!reqTokens.length) continue;

      const matchedTerms: string[] = [];
      let hits = 0;
      for (const t of reqTokens) {
        if (docTokens.some((d) => d.includes(t) || t.includes(d))) {
          hits += 1;
          matchedTerms.push(t);
        }
      }

      let score = hits / Math.max(reqTokens.length, 1);
      if (classification?.kind === "certification" && req.category === "qualification") {
        score += 0.25;
      }
      if (classification?.kind === "test_report" && req.category === "technical") {
        score += 0.15;
      }
      if (classification?.kind === "datasheet" && req.category === "technical") {
        score += 0.1;
      }

      score = Math.min(1, Math.round(score * 100) / 100);
      if (score < minScore) continue;

      const link: EvidenceLinkRecord = {
        requirementId: req.id,
        evidenceId,
        score,
        matchedTerms: [...new Set(matchedTerms)].slice(0, 12),
      };
      links.push(link);
      registry = addEvidenceLink(registry, link);
    }
  }

  return { registry, links };
}
