import { buildOcrKeywordIndex } from "../ocr/keywordIndex";
import { addEvidenceLink } from "../registry";
import type {
  EvidenceLinkRecord,
  EvidenceLinkingRuntimeInput,
  EvidenceLinkingRuntimeResult,
  EvidenceMatch,
} from "../types";
import { LINKING_RUNTIME_VERSION } from "../types";
import { buildRequirementLinkingResults } from "./evaluateLinkingCoverage";
import { appendLinkingEvent, createLinkingTrace } from "./linkingTrace";
import { mapAllRequirementKeywords } from "./mapKeywords";
import { matchRequirementToEvidence } from "./matchEvidence";

function newLinkingRunId() {
  return `elr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * V3.4-E3 Evidence Linking Runtime
 *
 * Requirement → Keyword Mapping → Evidence Match → OCR Location → Coverage Status
 */
export function runEvidenceLinkingRuntime(
  input: EvidenceLinkingRuntimeInput,
): EvidenceLinkingRuntimeResult {
  const started = Date.now();
  const runId = input.runId || newLinkingRunId();
  const ranAt = new Date().toISOString();
  let trace = createLinkingTrace(runId);
  const minLinkScore = input.minLinkScore ?? 0.35;

  trace = appendLinkingEvent(trace, "index_built", "构建 OCR 关键词索引");
  const index = buildOcrKeywordIndex(input.ocrDocuments);
  trace = appendLinkingEvent(trace, "index_built", `索引词条 ${Object.keys(index.byTerm).length} 项`, undefined, {
    entryCount: index.entryCount,
    attachments: index.attachmentIds.length,
  });

  trace = appendLinkingEvent(trace, "keyword_map", "需求关键词映射");
  const mappings = mapAllRequirementKeywords(input.requirements);

  let registry = input.registry;
  const allMatches: EvidenceMatch[] = [];
  const matchesByRequirement = new Map<string, EvidenceMatch[]>();
  const links: EvidenceLinkRecord[] = [];

  for (const requirement of input.requirements) {
    const mapping = mappings.find((m) => m.requirementId === requirement.id)!;

    trace = appendLinkingEvent(
      trace,
      "keyword_map",
      `需求 ${requirement.id} → ${mapping.keywords.length} 个检索词`,
      requirement.id,
      { keywords: mapping.keywords.slice(0, 8) },
    );

    const matches = matchRequirementToEvidence({
      requirement,
      mapping,
      index,
      ocrDocuments: input.ocrDocuments,
      classifications: input.classifications,
      registry,
      minLinkScore,
    });

    matchesByRequirement.set(requirement.id, matches);
    allMatches.push(...matches);

    trace = appendLinkingEvent(
      trace,
      "evidence_match",
      `匹配 ${matches.length} 条证据`,
      requirement.id,
      { bestScore: matches[0]?.score ?? 0 },
    );

    for (const m of matches) {
      if (m.locations.length) {
        trace = appendLinkingEvent(
          trace,
          "ocr_locate",
          `OCR 定位 ${m.locations.length} 处`,
          requirement.id,
          { evidenceId: m.evidenceId, blocks: m.locations.map((l) => l.blockId).slice(0, 3) },
        );
      }

      const link: EvidenceLinkRecord = {
        requirementId: m.requirementId,
        evidenceId: m.evidenceId,
        score: m.score,
        matchedTerms: m.matchedTerms,
      };
      links.push(link);
      registry = addEvidenceLink(registry, link);
    }
  }

  const results = buildRequirementLinkingResults(
    input.requirements,
    matchesByRequirement,
    mappings,
  );

  for (const r of results) {
    trace = appendLinkingEvent(
      trace,
      "coverage",
      `覆盖 ${r.coverageLevel} (score=${r.bestScore})`,
      r.requirementId,
    );
  }

  return {
    version: LINKING_RUNTIME_VERSION,
    runId,
    ranAt,
    durationMs: Date.now() - started,
    requirements: input.requirements,
    results,
    registry,
    links,
    matches: allMatches,
    trace,
  };
}
