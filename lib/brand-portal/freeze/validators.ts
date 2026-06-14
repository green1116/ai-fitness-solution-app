import type { BrandPortalWorkflowPathResult } from "../shared/types";
import { buildBrandOnboardingApprovalGate } from "../onboarding/approval/builders";
import { buildBrandOnboardingIntake } from "../onboarding/intake/builders";
import { buildBrandOnboardingReport } from "../onboarding/report/builders";
import { validateBrandOnboardingSubmission } from "../onboarding/validation/validators";
import { advanceBrandOnboardingWorkflow } from "../onboarding/workflow/builders";
import { validateBrandPortal } from "../validation/validators";
import type { BrandPortalFreezeValidation } from "../shared/types";
import { BRAND_PORTAL_VALIDATION_GATES, BRAND_PORTAL_WORKFLOW_BRANDS } from "./constants";

export function validateBrandOnboardingWorkflowPath(
  brandId: string,
): BrandPortalWorkflowPathResult {
  const intake = buildBrandOnboardingIntake({ brandId });
  if (!intake) {
    return {
      brandId,
      brandName: brandId,
      finalStatus: "draft",
      approvalDecision: "rejected",
      pathValid: false,
    };
  }

  let submission = intake;
  let approvalDecision: BrandPortalWorkflowPathResult["approvalDecision"] = "approved";

  while (submission.status !== "published") {
    if (submission.status === "review") {
      const gate = buildBrandOnboardingApprovalGate(submission);
      approvalDecision = gate.decision;
      if (gate.decision !== "approved") {
        return {
          brandId,
          brandName: submission.brandProfile.brandName,
          finalStatus: submission.status,
          approvalDecision,
          pathValid: false,
        };
      }
    }
    const next = advanceBrandOnboardingWorkflow(submission);
    if (next.status === submission.status) {
      return {
        brandId,
        brandName: submission.brandProfile.brandName,
        finalStatus: submission.status,
        approvalDecision,
        pathValid: false,
      };
    }
    submission = next;
  }

  return {
    brandId,
    brandName: submission.brandProfile.brandName,
    finalStatus: "published",
    approvalDecision,
    pathValid: true,
  };
}

export function validateBrandPortalFreeze(): BrandPortalFreezeValidation {
  const phase1 = validateBrandPortal();
  const onboardingReport = buildBrandOnboardingReport();
  const canonicalIntake = buildBrandOnboardingIntake({ brandId: "brand-life-fitness" });
  const canonicalValidation = canonicalIntake
    ? validateBrandOnboardingSubmission(canonicalIntake)
    : { valid: false, brandExists: false, productsExist: false, certificationsExist: false, caseStudiesExist: false };

  const workflowPaths = BRAND_PORTAL_WORKFLOW_BRANDS.map(validateBrandOnboardingWorkflowPath);
  const workflowPathValid = workflowPaths.every((path) => path.pathValid);

  const phase2Valid =
    onboardingReport.validation.valid &&
    onboardingReport.submissionCount >= 3 &&
    canonicalValidation.valid;

  const gates = [
    phase1.brandExists,
    phase1.productExists,
    phase1.certificationExists,
    phase1.caseStudyExists,
    phase1.v20CatalogCompatible,
    phase1.valid,
    phase2Valid,
    onboardingReport.validation.brandExists,
    onboardingReport.validation.productsExist,
    onboardingReport.validation.certificationsExist,
    onboardingReport.validation.caseStudiesExist,
    workflowPathValid,
  ];

  const validationScore = Math.round((gates.filter(Boolean).length / gates.length) * 100);
  const valid = phase1.valid && phase2Valid && workflowPathValid && validationScore === 100;

  return {
    valid,
    phase1Valid: phase1.valid,
    phase2Valid,
    workflowPathValid,
    validationScore,
  };
}

export { BRAND_PORTAL_VALIDATION_GATES };
