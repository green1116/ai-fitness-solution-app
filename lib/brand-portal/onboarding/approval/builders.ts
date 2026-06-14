import type {
  BrandOnboardingApprovalGate,
  BrandOnboardingSubmission,
} from "../../shared/types";
import { validateBrandOnboardingSubmission } from "../validation/validators";

export function buildBrandOnboardingApprovalGate(
  submission: BrandOnboardingSubmission,
): BrandOnboardingApprovalGate {
  const validation = validateBrandOnboardingSubmission(submission);
  const decision = validation.valid ? "approved" : "rejected";

  const reasons: string[] = [];
  if (validation.valid) {
    reasons.push("Brand profile complete");
    reasons.push(`${submission.products.length} products verified`);
    reasons.push(`${submission.certifications.length} certifications verified`);
    reasons.push(`${submission.caseStudies.length} case studies verified`);
  } else {
    if (!validation.brandExists) reasons.push("Brand profile missing or invalid");
    if (!validation.productsExist) reasons.push("Products missing or invalid");
    if (!validation.certificationsExist) reasons.push("Certifications missing or invalid");
    if (!validation.caseStudiesExist) reasons.push("Case studies missing or invalid");
  }

  return {
    submissionId: submission.submissionId,
    decision,
    reasons,
    validatedAt: new Date().toISOString(),
  };
}
