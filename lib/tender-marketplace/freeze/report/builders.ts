import { getAllEvaluationProfiles } from "../../evaluation-profile";
import { getAllOpportunityProfiles } from "../../opportunity-profile";
import { buildTenderPublishingReport } from "../../onboarding/report/builders";
import { getAllRequirementProfiles } from "../../requirement-profile";
import { getAllTenderProfiles } from "../../tender-profile";
import type { TenderMarketplaceFreezeReport } from "../../shared/types";
import {
  CANONICAL_TENDER_PUBLISHING_QUERY,
  TENDER_MARKETPLACE_TAG,
  TENDER_MARKETPLACE_VERSION,
  TENDER_PUBLISHING_WORKFLOW_STATES,
} from "../../shared/types";
import { buildTenderMarketplaceCoverageStats } from "../coverage";
import {
  TENDER_MARKETPLACE_FROZEN_DOMAINS,
  TENDER_MARKETPLACE_VALIDATION_GATES,
  TENDER_MARKETPLACE_WORKFLOW_TENDERS,
} from "../constants";
import {
  validateTenderMarketplaceFreeze,
  validateTenderPublishingWorkflowPath,
} from "../validators";

export function buildTenderMarketplaceFreezeReport(): TenderMarketplaceFreezeReport {
  const coverage = buildTenderMarketplaceCoverageStats();
  const validation = validateTenderMarketplaceFreeze();
  const publishingReport = validation.valid ? buildTenderPublishingReport() : null;
  const workflowPaths = TENDER_MARKETPLACE_WORKFLOW_TENDERS.map(
    validateTenderPublishingWorkflowPath,
  );

  const readinessScore = Math.round((coverage.coverageScore + validation.validationScore) / 2);

  const readiness = {
    readinessScore,
    validationScore: validation.validationScore,
    coverageScore: coverage.coverageScore,
    tenderCount: getAllTenderProfiles().length,
    requirementCount: getAllRequirementProfiles().length,
    evaluationCount: getAllEvaluationProfiles().length,
    opportunityCount: getAllOpportunityProfiles().length,
    submissionCount: publishingReport?.submissionCount ?? 0,
    approvalCount: publishingReport?.approvedCount ?? 0,
    publishedCount: publishingReport?.publishedCount ?? 0,
  };

  return {
    version: TENDER_MARKETPLACE_VERSION,
    tag: TENDER_MARKETPLACE_TAG,
    reportId: `tender-marketplace-freeze-report-${Date.now()}`,
    status: "frozen",
    coverage,
    validation,
    readiness,
    workflowPaths,
    examplePublishingReport: publishingReport,
    moduleStatistics: {
      frozenDomains: TENDER_MARKETPLACE_FROZEN_DOMAINS.length,
      profileCatalogs: 4,
      workflowStates: TENDER_PUBLISHING_WORKFLOW_STATES.length,
      validationGates: TENDER_MARKETPLACE_VALIDATION_GATES,
      reportBuilders: 3,
    },
    canonicalQuery: CANONICAL_TENDER_PUBLISHING_QUERY,
    summary: [
      "tender-marketplace-freeze-report",
      `tag=${TENDER_MARKETPLACE_TAG}`,
      `valid=${validation.valid}`,
      `readinessScore=${readinessScore}`,
      `validationScore=${validation.validationScore}`,
      `coverageScore=${coverage.coverageScore}`,
      `tenders=${readiness.tenderCount}`,
      `requirements=${readiness.requirementCount}`,
      `published=${readiness.publishedCount}`,
      `workflowPaths=${workflowPaths.filter((p) => p.pathValid).length}/${workflowPaths.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
