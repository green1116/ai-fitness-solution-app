import { buildKnowledgeAssistedWinProbabilityReport } from "../../report/builders";
import type { TenderKnowledgeFreezeReport } from "../../shared/types";
import {
  CANONICAL_KNOWLEDGE_ASSISTED_QUERY,
  TENDER_KNOWLEDGE_TAG,
  TENDER_KNOWLEDGE_VERSION,
} from "../../shared/types";
import { buildTenderKnowledgeCoverageStats } from "../coverage";
import {
  TENDER_KNOWLEDGE_FROZEN_DOMAINS,
  TENDER_KNOWLEDGE_MATCHING_DIMENSIONS,
  TENDER_KNOWLEDGE_VALIDATION_GATES,
} from "../constants";
import { validateTenderKnowledgeFreeze } from "../validators";

export function buildTenderKnowledgeFreezeReport(): TenderKnowledgeFreezeReport {
  const coverage = buildTenderKnowledgeCoverageStats();
  const validation = validateTenderKnowledgeFreeze();
  const exampleKnowledgeReport = validation.valid
    ? buildKnowledgeAssistedWinProbabilityReport(CANONICAL_KNOWLEDGE_ASSISTED_QUERY)
    : null;

  const readinessScore = Math.round((coverage.coverageScore + validation.validationScore) / 2);

  const readiness = {
    readinessScore,
    validationScore: validation.validationScore,
    coverageScore: coverage.coverageScore,
    baselineProbability: exampleKnowledgeReport?.winProbability.baselineProbability ?? 0,
    calibratedProbability: exampleKnowledgeReport?.winProbability.calibratedProbability ?? 0,
    confidence: exampleKnowledgeReport?.winProbability.confidence ?? "low",
  };

  return {
    version: TENDER_KNOWLEDGE_VERSION,
    tag: TENDER_KNOWLEDGE_TAG,
    reportId: `tender-knowledge-freeze-report-${Date.now()}`,
    status: "frozen",
    coverage,
    validation,
    readiness,
    exampleKnowledgeReport,
    moduleStatistics: {
      frozenDomains: TENDER_KNOWLEDGE_FROZEN_DOMAINS.length,
      archiveCatalogs: 4,
      matchingDimensions: TENDER_KNOWLEDGE_MATCHING_DIMENSIONS.length,
      validationGates: TENDER_KNOWLEDGE_VALIDATION_GATES,
      reportBuilders: 3,
    },
    canonicalQuery: CANONICAL_KNOWLEDGE_ASSISTED_QUERY,
    summary: [
      "tender-knowledge-freeze-report",
      `tag=${TENDER_KNOWLEDGE_TAG}`,
      `valid=${validation.valid}`,
      `readinessScore=${readinessScore}`,
      `validationScore=${validation.validationScore}`,
      `coverageScore=${coverage.coverageScore}`,
      exampleKnowledgeReport
        ? `baseline=${exampleKnowledgeReport.winProbability.baselineProbability} calibrated=${exampleKnowledgeReport.winProbability.calibratedProbability} confidence=${exampleKnowledgeReport.winProbability.confidence}`
        : "example=null",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
