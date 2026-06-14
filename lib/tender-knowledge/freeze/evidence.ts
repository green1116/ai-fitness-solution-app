import type { TenderKnowledgeFreezeEvidence } from "../shared/types";
import {
  CANONICAL_KNOWLEDGE_ASSISTED_QUERY,
  TENDER_KNOWLEDGE_TAG,
  TENDER_KNOWLEDGE_VERSION,
} from "../shared/types";
import { buildTenderKnowledgeCoverageStats } from "./coverage";
import { TENDER_KNOWLEDGE_FROZEN_DOMAINS } from "./constants";
import { buildTenderKnowledgeFreezeReport } from "./report/builders";
import { validateTenderKnowledgeFreeze } from "./validators";

export function buildTenderKnowledgeFreezeEvidence(): TenderKnowledgeFreezeEvidence {
  const validation = validateTenderKnowledgeFreeze();
  const coverage = buildTenderKnowledgeCoverageStats();
  const report = buildTenderKnowledgeFreezeReport();

  if (!validation.valid) {
    throw new Error("Tender knowledge freeze evidence incomplete: validation failed");
  }

  return {
    evidenceId: `evidence-tender-knowledge-freeze-${Date.now()}`,
    version: TENDER_KNOWLEDGE_VERSION,
    tag: TENDER_KNOWLEDGE_TAG,
    freezeManifest: {
      frozenDomains: [...TENDER_KNOWLEDGE_FROZEN_DOMAINS],
      canonicalQuery: CANONICAL_KNOWLEDGE_ASSISTED_QUERY,
      baselineProbability: report.readiness.baselineProbability,
      calibratedProbability: report.readiness.calibratedProbability,
      confidence: report.readiness.confidence,
    },
    coverage,
    readiness: report.readiness,
    validationPassed: validation.valid,
    generatedAt: new Date().toISOString(),
    summary: `tender-knowledge-freeze-evidence tag=${TENDER_KNOWLEDGE_TAG} readiness=${report.readiness.readinessScore}% validation=${validation.validationScore}% coverage=${coverage.coverageScore}% calibrated=${report.readiness.calibratedProbability}%`,
  };
}
