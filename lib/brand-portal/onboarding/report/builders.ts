import { getAllOnboardingSubmissions, getOnboardingSubmissionById } from "../submissions";
import { validateBrandOnboardingSubmission } from "../validation/validators";
import type { BrandOnboardingReport } from "../../shared/types";
import {
  BRAND_PORTAL_VERSION,
  CANONICAL_BRAND_ONBOARDING_QUERY,
} from "../../shared/types";

export function buildBrandOnboardingReport(): BrandOnboardingReport {
  const submissions = getAllOnboardingSubmissions();
  const canonicalSubmission = getOnboardingSubmissionById(
    CANONICAL_BRAND_ONBOARDING_QUERY.submissionId,
  );
  const validation = validateBrandOnboardingSubmission(
    canonicalSubmission ?? submissions[0],
  );

  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;
  const publishedCount = submissions.filter((s) => s.status === "published").length;

  return {
    version: BRAND_PORTAL_VERSION,
    reportId: `brand-onboarding-report-${Date.now()}`,
    submissionCount: submissions.length,
    approvedCount,
    rejectedCount,
    publishedCount,
    validation,
    summary: [
      "brand-onboarding-report",
      `submissions=${submissions.length}`,
      `approved=${approvedCount}`,
      `rejected=${rejectedCount}`,
      `published=${publishedCount}`,
      `valid=${validation.valid}`,
      `canonical=${CANONICAL_BRAND_ONBOARDING_QUERY.submissionId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
