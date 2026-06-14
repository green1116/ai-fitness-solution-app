import type { TenderApprovalGate, TenderSubmission } from "../../shared/types";
import { validateTenderSubmission } from "../validation/validators";

export function buildTenderApprovalGate(submission: TenderSubmission): TenderApprovalGate {
  const validation = validateTenderSubmission(submission);
  const decision = validation.valid ? "approved" : "rejected";

  const reasons: string[] = [];
  if (validation.valid) {
    reasons.push("Tender profile complete");
    reasons.push(`${submission.requirements.length} requirements verified`);
    reasons.push("Evaluation weights verified");
    reasons.push(
      `Opportunity verified with ${submission.opportunity.targetBrands.length} brands and ${submission.opportunity.targetSuppliers.length} suppliers`,
    );
  } else {
    if (!validation.tenderExists) reasons.push("Tender profile missing or invalid");
    if (!validation.requirementsExist) reasons.push("Requirements missing or invalid");
    if (!validation.evaluationExists) reasons.push("Evaluation missing or invalid");
    if (!validation.opportunityExists) reasons.push("Opportunity missing or invalid");
  }

  return {
    submissionId: submission.submissionId,
    decision,
    reasons,
    validatedAt: new Date().toISOString(),
  };
}
