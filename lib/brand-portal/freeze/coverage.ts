import { getAllBrandProfiles } from "../brand-profile";
import { getAllCaseStudyProfiles } from "../case-study-profile";
import { getAllCertificationProfiles } from "../certification-profile";
import { buildBrandOnboardingApprovalGate } from "../onboarding/approval/builders";
import { buildBrandOnboardingIntake } from "../onboarding/intake/builders";
import { buildBrandOnboardingReport } from "../onboarding/report/builders";
import { validateBrandOnboardingSubmission } from "../onboarding/validation/validators";
import { advanceBrandOnboardingWorkflow } from "../onboarding/workflow/builders";
import { getAllProductProfiles } from "../product-profile";
import type { BrandPortalCoverageStats } from "../shared/types";
import { CANONICAL_BRAND_ONBOARDING_QUERY } from "../shared/types";
import { BRAND_PORTAL_WORKFLOW_BRANDS } from "./constants";

export function buildBrandPortalCoverageStats(): BrandPortalCoverageStats {
  const brands = getAllBrandProfiles();
  const brandProfileChecks = [
    brands.length >= 10,
    brands.every((b) => b.brandId.length > 0 && b.status === "active"),
    brands.every((b) => b.mode === "brand-portal"),
    brands.some((b) => b.brandId === CANONICAL_BRAND_ONBOARDING_QUERY.brandId),
  ];
  const brandProfileCoverage = Math.round(
    (brandProfileChecks.filter(Boolean).length / brandProfileChecks.length) * 100,
  );

  const products = getAllProductProfiles();
  const productProfileChecks = [
    products.length >= 50,
    products.every((p) => p.sku.length > 0 && p.documentRefs.length > 0),
    products.every((p) => p.mode === "brand-portal"),
    new Set(products.map((p) => p.brandId)).size >= 10,
  ];
  const productProfileCoverage = Math.round(
    (productProfileChecks.filter(Boolean).length / productProfileChecks.length) * 100,
  );

  const certifications = getAllCertificationProfiles();
  const certificationChecks = [
    certifications.length >= 20,
    certifications.every((c) => c.certificateType.length > 0),
    certifications.every((c) => c.mode === "brand-portal"),
    new Set(certifications.map((c) => c.brandId)).size >= 10,
  ];
  const certificationCoverage = Math.round(
    (certificationChecks.filter(Boolean).length / certificationChecks.length) * 100,
  );

  const caseStudies = getAllCaseStudyProfiles();
  const caseStudyChecks = [
    caseStudies.length >= 10,
    caseStudies.every((c) => c.projectName.length > 0),
    caseStudies.every((c) => c.mode === "brand-portal"),
    new Set(caseStudies.map((c) => c.brandId)).size >= 10,
  ];
  const caseStudyCoverage = Math.round(
    (caseStudyChecks.filter(Boolean).length / caseStudyChecks.length) * 100,
  );

  const onboardingReport = buildBrandOnboardingReport();
  const canonicalIntake = buildBrandOnboardingIntake({
    brandId: CANONICAL_BRAND_ONBOARDING_QUERY.brandId,
  });
  const onboardingChecks = [
    onboardingReport.submissionCount >= 3,
    onboardingReport.validation.valid,
    canonicalIntake !== null,
    canonicalIntake?.products.length === 5,
  ];
  const onboardingCoverage = Math.round(
    (onboardingChecks.filter(Boolean).length / onboardingChecks.length) * 100,
  );

  const workflowChecks = BRAND_PORTAL_WORKFLOW_BRANDS.map((brandId) => {
    let submission = buildBrandOnboardingIntake({ brandId });
    if (!submission) return false;
    while (submission.status !== "published") {
      if (submission.status === "review") {
        const gate = buildBrandOnboardingApprovalGate(submission);
        if (gate.decision !== "approved") return false;
      }
      const next = advanceBrandOnboardingWorkflow(submission);
      if (next.status === submission.status) return false;
      submission = next;
    }
    return submission.status === "published";
  });
  const approvalWorkflowCoverage = Math.round(
    (workflowChecks.filter(Boolean).length / workflowChecks.length) * 100,
  );

  const coverageScore = Math.round(
    (brandProfileCoverage +
      productProfileCoverage +
      certificationCoverage +
      caseStudyCoverage +
      onboardingCoverage +
      approvalWorkflowCoverage) /
      6,
  );

  return {
    brandProfileCoverage,
    productProfileCoverage,
    certificationCoverage,
    caseStudyCoverage,
    onboardingCoverage,
    approvalWorkflowCoverage,
    coverageScore,
  };
}
