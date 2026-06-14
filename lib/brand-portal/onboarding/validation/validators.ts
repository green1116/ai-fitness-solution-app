import type { BrandOnboardingSubmissionValidation } from "../../shared/types";
import type { BrandOnboardingSubmission } from "../../shared/types";

export function validateBrandOnboardingSubmission(
  submission: BrandOnboardingSubmission,
): BrandOnboardingSubmissionValidation {
  const brandExists =
    submission.brandProfile.brandId.length > 0 &&
    submission.brandProfile.brandName.length > 0 &&
    submission.brandProfile.status === "active" &&
    submission.brandProfile.mode === "brand-portal";

  const productsExist =
    submission.products.length > 0 &&
    submission.products.every(
      (product) =>
        product.brandId === submission.brandProfile.brandId &&
        product.sku.length > 0 &&
        product.documentRefs.length > 0 &&
        product.mode === "brand-portal",
    );

  const certificationsExist =
    submission.certifications.length > 0 &&
    submission.certifications.every(
      (cert) =>
        cert.brandId === submission.brandProfile.brandId &&
        cert.certificateType.length > 0 &&
        cert.mode === "brand-portal",
    );

  const caseStudiesExist =
    submission.caseStudies.length > 0 &&
    submission.caseStudies.every(
      (study) =>
        study.brandId === submission.brandProfile.brandId &&
        study.projectName.length > 0 &&
        study.mode === "brand-portal",
    );

  return {
    valid: brandExists && productsExist && certificationsExist && caseStudiesExist,
    brandExists,
    productsExist,
    certificationsExist,
    caseStudiesExist,
  };
}
