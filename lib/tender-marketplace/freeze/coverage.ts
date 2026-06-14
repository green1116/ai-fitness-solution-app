import { getAllEvaluationProfiles } from "../evaluation-profile";
import { getAllOpportunityProfiles } from "../opportunity-profile";
import { buildTenderApprovalGate } from "../onboarding/approval/builders";
import { buildTenderPublishingIntake } from "../onboarding/intake/builders";
import { buildTenderPublishingReport } from "../onboarding/report/builders";
import { advanceTenderPublishingWorkflow } from "../onboarding/workflow/builders";
import { getAllRequirementProfiles } from "../requirement-profile";
import { getAllTenderProfiles } from "../tender-profile";
import type { TenderMarketplaceCoverageStats } from "../shared/types";
import { CANONICAL_TENDER_PUBLISHING_QUERY } from "../shared/types";
import { TENDER_MARKETPLACE_WORKFLOW_TENDERS } from "./constants";

export function buildTenderMarketplaceCoverageStats(): TenderMarketplaceCoverageStats {
  const tenders = getAllTenderProfiles();
  const tenderProfileChecks = [
    tenders.length >= 10,
    tenders.every((t) => t.tenderId.length > 0 && t.budget > 0),
    tenders.every((t) => t.mode === "tender-marketplace"),
    tenders.some((t) => t.tenderId === CANONICAL_TENDER_PUBLISHING_QUERY.tenderId),
  ];
  const tenderProfileCoverage = Math.round(
    (tenderProfileChecks.filter(Boolean).length / tenderProfileChecks.length) * 100,
  );

  const requirements = getAllRequirementProfiles();
  const requirementProfileChecks = [
    requirements.length >= 10,
    requirements.every((r) => r.equipmentCategory.length > 0 && r.quantity > 0),
    requirements.every((r) => r.mode === "tender-marketplace"),
    new Set(requirements.map((r) => r.tenderId)).size >= 5,
  ];
  const requirementProfileCoverage = Math.round(
    (requirementProfileChecks.filter(Boolean).length / requirementProfileChecks.length) * 100,
  );

  const evaluations = getAllEvaluationProfiles();
  const evaluationProfileChecks = [
    evaluations.length >= 5,
    evaluations.every(
      (e) =>
        e.priceWeight +
          e.technicalWeight +
          e.serviceWeight +
          e.deliveryWeight +
          e.brandWeight ===
        100,
    ),
    evaluations.every((e) => e.mode === "tender-marketplace"),
    new Set(evaluations.map((e) => e.tenderId)).size >= 5,
  ];
  const evaluationProfileCoverage = Math.round(
    (evaluationProfileChecks.filter(Boolean).length / evaluationProfileChecks.length) * 100,
  );

  const opportunities = getAllOpportunityProfiles();
  const opportunityProfileChecks = [
    opportunities.length >= 5,
    opportunities.every(
      (o) => o.targetBrands.length > 0 && o.targetSuppliers.length > 0,
    ),
    opportunities.every((o) => o.mode === "tender-marketplace"),
    new Set(opportunities.map((o) => o.tenderId)).size >= 5,
  ];
  const opportunityProfileCoverage = Math.round(
    (opportunityProfileChecks.filter(Boolean).length / opportunityProfileChecks.length) * 100,
  );

  const publishingReport = buildTenderPublishingReport();
  const canonicalIntake = buildTenderPublishingIntake({
    tenderId: CANONICAL_TENDER_PUBLISHING_QUERY.tenderId,
  });
  const publishingChecks = [
    publishingReport.submissionCount >= 3,
    publishingReport.validation.valid,
    canonicalIntake !== null,
    (canonicalIntake?.requirements.length ?? 0) >= 1,
  ];
  const publishingCoverage = Math.round(
    (publishingChecks.filter(Boolean).length / publishingChecks.length) * 100,
  );

  const workflowChecks = TENDER_MARKETPLACE_WORKFLOW_TENDERS.map((tenderId) => {
    let submission = buildTenderPublishingIntake({ tenderId });
    if (!submission) return false;
    while (submission.status !== "published") {
      if (submission.status === "review") {
        const gate = buildTenderApprovalGate(submission);
        if (gate.decision !== "approved") return false;
      }
      const next = advanceTenderPublishingWorkflow(submission);
      if (next.status === submission.status) return false;
      submission = next;
    }
    return submission.status === "published";
  });
  const approvalWorkflowCoverage = Math.round(
    (workflowChecks.filter(Boolean).length / workflowChecks.length) * 100,
  );

  const coverageScore = Math.round(
    (tenderProfileCoverage +
      requirementProfileCoverage +
      evaluationProfileCoverage +
      opportunityProfileCoverage +
      publishingCoverage +
      approvalWorkflowCoverage) /
      6,
  );

  return {
    tenderProfileCoverage,
    requirementProfileCoverage,
    evaluationProfileCoverage,
    opportunityProfileCoverage,
    publishingCoverage,
    approvalWorkflowCoverage,
    coverageScore,
  };
}
