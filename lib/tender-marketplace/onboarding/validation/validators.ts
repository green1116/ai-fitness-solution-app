import type { TenderSubmission, TenderSubmissionValidation } from "../../shared/types";

export function validateTenderSubmission(
  submission: TenderSubmission,
): TenderSubmissionValidation {
  const tenderExists =
    submission.tenderProfile.tenderId.length > 0 &&
    submission.tenderProfile.title.length > 0 &&
    submission.tenderProfile.budget > 0 &&
    submission.tenderProfile.mode === "tender-marketplace";

  const requirementsExist =
    submission.requirements.length > 0 &&
    submission.requirements.every(
      (requirement) =>
        requirement.tenderId === submission.tenderProfile.tenderId &&
        requirement.equipmentCategory.length > 0 &&
        requirement.quantity > 0 &&
        requirement.mode === "tender-marketplace",
    );

  const evaluationExists =
    submission.evaluation.tenderId === submission.tenderProfile.tenderId &&
    submission.evaluation.priceWeight +
      submission.evaluation.technicalWeight +
      submission.evaluation.serviceWeight +
      submission.evaluation.deliveryWeight +
      submission.evaluation.brandWeight ===
      100 &&
    submission.evaluation.mode === "tender-marketplace";

  const opportunityExists =
    submission.opportunity.tenderId === submission.tenderProfile.tenderId &&
    submission.opportunity.estimatedValue > 0 &&
    submission.opportunity.targetBrands.length > 0 &&
    submission.opportunity.targetSuppliers.length > 0 &&
    submission.opportunity.mode === "tender-marketplace";

  return {
    valid: tenderExists && requirementsExist && evaluationExists && opportunityExists,
    tenderExists,
    requirementsExist,
    evaluationExists,
    opportunityExists,
  };
}
