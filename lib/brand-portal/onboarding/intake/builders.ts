import { getBrandProfileById } from "../../brand-profile";
import { getCaseStudyProfilesByBrandId } from "../../case-study-profile";
import { getCertificationProfilesByBrandId } from "../../certification-profile";
import { getProductProfilesByBrandId } from "../../product-profile";
import type {
  BrandOnboardingIntakeInput,
  BrandOnboardingSubmission,
} from "../../shared/types";

export function buildBrandOnboardingIntake(
  input: BrandOnboardingIntakeInput,
): BrandOnboardingSubmission | null {
  const brandProfile = getBrandProfileById(input.brandId);
  if (!brandProfile) return null;

  const products = getProductProfilesByBrandId(input.brandId);
  const certifications = getCertificationProfilesByBrandId(input.brandId);
  const caseStudies = getCaseStudyProfilesByBrandId(input.brandId);

  return {
    submissionId: `onboarding-${input.brandId.replace("brand-", "")}-draft`,
    brandProfile,
    products,
    certifications,
    caseStudies,
    submittedAt: null,
    status: "draft",
    mode: "brand-portal",
  };
}

export function buildBrandOnboardingIntakeFromSubmission(
  submission: BrandOnboardingSubmission,
): BrandOnboardingSubmission {
  return {
    ...submission,
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
    status: submission.status === "draft" ? "submitted" : submission.status,
  };
}
