import {
  CANONICAL_SUPPLIER_ONBOARDING_QUERY,
  SUPPLIER_PORTAL_VERSION,
} from "../../shared/types";
import type { SupplierOnboardingReport } from "../../shared/types";
import { getAllOnboardingSubmissions, getOnboardingSubmissionById } from "../submissions";
import { validateSupplierOnboardingSubmission } from "../validation/validators";

export function buildSupplierOnboardingReport(): SupplierOnboardingReport {
  const submissions = getAllOnboardingSubmissions();
  const canonicalSubmission = getOnboardingSubmissionById(
    CANONICAL_SUPPLIER_ONBOARDING_QUERY.submissionId,
  );
  const validation = validateSupplierOnboardingSubmission(
    canonicalSubmission ?? submissions[0],
  );

  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;
  const publishedCount = submissions.filter((s) => s.status === "published").length;

  return {
    version: SUPPLIER_PORTAL_VERSION,
    reportId: `supplier-onboarding-report-${Date.now()}`,
    submissionCount: submissions.length,
    approvedCount,
    rejectedCount,
    publishedCount,
    validation,
    summary: [
      "supplier-onboarding-report",
      `submissions=${submissions.length}`,
      `approved=${approvedCount}`,
      `rejected=${rejectedCount}`,
      `published=${publishedCount}`,
      `valid=${validation.valid}`,
      `canonical=${CANONICAL_SUPPLIER_ONBOARDING_QUERY.submissionId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
