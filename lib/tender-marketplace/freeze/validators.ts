import type {
  TenderMarketplaceFreezeValidation,
  TenderMarketplaceWorkflowPathResult,
} from "../shared/types";
import { buildTenderApprovalGate } from "../onboarding/approval/builders";
import { buildTenderPublishingIntake } from "../onboarding/intake/builders";
import { buildTenderPublishingReport } from "../onboarding/report/builders";
import { validateTenderSubmission } from "../onboarding/validation/validators";
import { advanceTenderPublishingWorkflow } from "../onboarding/workflow/builders";
import { validateTenderMarketplace } from "../validation/validators";
import {
  TENDER_MARKETPLACE_VALIDATION_GATES,
  TENDER_MARKETPLACE_WORKFLOW_TENDERS,
} from "./constants";

export function validateTenderPublishingWorkflowPath(
  tenderId: string,
): TenderMarketplaceWorkflowPathResult {
  const intake = buildTenderPublishingIntake({ tenderId });
  if (!intake) {
    return {
      tenderId,
      tenderTitle: tenderId,
      finalStatus: "draft",
      approvalDecision: "rejected",
      pathValid: false,
    };
  }

  let submission = intake;
  let approvalDecision: TenderMarketplaceWorkflowPathResult["approvalDecision"] = "approved";

  while (submission.status !== "published") {
    if (submission.status === "review") {
      const gate = buildTenderApprovalGate(submission);
      approvalDecision = gate.decision;
      if (gate.decision !== "approved") {
        return {
          tenderId,
          tenderTitle: submission.tenderProfile.title,
          finalStatus: submission.status,
          approvalDecision,
          pathValid: false,
        };
      }
    }
    const next = advanceTenderPublishingWorkflow(submission);
    if (next.status === submission.status) {
      return {
        tenderId,
        tenderTitle: submission.tenderProfile.title,
        finalStatus: submission.status,
        approvalDecision,
        pathValid: false,
      };
    }
    submission = next;
  }

  return {
    tenderId,
    tenderTitle: submission.tenderProfile.title,
    finalStatus: "published",
    approvalDecision,
    pathValid: true,
  };
}

export function validateTenderMarketplaceFreeze(): TenderMarketplaceFreezeValidation {
  const phase1 = validateTenderMarketplace();
  const publishingReport = buildTenderPublishingReport();
  const canonicalIntake = buildTenderPublishingIntake({
    tenderId: "tender-sh-commercial-gym-2025-001",
  });
  const canonicalValidation = canonicalIntake
    ? validateTenderSubmission(canonicalIntake)
    : {
        valid: false,
        tenderExists: false,
        requirementsExist: false,
        evaluationExists: false,
        opportunityExists: false,
      };

  const workflowPaths = TENDER_MARKETPLACE_WORKFLOW_TENDERS.map(
    validateTenderPublishingWorkflowPath,
  );
  const workflowPathValid = workflowPaths.every((path) => path.pathValid);

  const phase2Valid =
    publishingReport.validation.valid &&
    publishingReport.submissionCount >= 3 &&
    canonicalValidation.valid;

  const layerCompatibility =
    phase1.v20CatalogCompatible &&
    phase1.v21SupplierCompatible &&
    phase1.v22ProcurementCompatible &&
    phase1.v23ProposalCompatible &&
    phase1.v24IntelligenceCompatible &&
    phase1.v25KnowledgeCompatible;

  const gates = [
    phase1.tenderExists,
    phase1.requirementsExist,
    phase1.evaluationExists,
    phase1.opportunityExists,
    layerCompatibility,
    phase1.valid,
    phase2Valid,
    publishingReport.validation.tenderExists,
    publishingReport.validation.requirementsExist,
    publishingReport.validation.evaluationExists,
    publishingReport.validation.opportunityExists,
    workflowPathValid,
  ];

  const validationScore = Math.round(
    (gates.filter(Boolean).length / TENDER_MARKETPLACE_VALIDATION_GATES) * 100,
  );
  const valid = phase1.valid && phase2Valid && workflowPathValid && validationScore === 100;

  return {
    valid,
    phase1Valid: phase1.valid,
    phase2Valid,
    workflowPathValid,
    validationScore,
  };
}

export { TENDER_MARKETPLACE_VALIDATION_GATES };
