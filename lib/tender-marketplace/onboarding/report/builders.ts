import {
  CANONICAL_TENDER_PUBLISHING_QUERY,
  TENDER_MARKETPLACE_VERSION,
} from "../../shared/types";
import type { TenderPublishingReport } from "../../shared/types";
import { getAllPublishingSubmissions, getPublishingSubmissionById } from "../submissions";
import { validateTenderSubmission } from "../validation/validators";

export function buildTenderPublishingReport(): TenderPublishingReport {
  const submissions = getAllPublishingSubmissions();
  const canonicalSubmission = getPublishingSubmissionById(
    CANONICAL_TENDER_PUBLISHING_QUERY.submissionId,
  );
  const validation = validateTenderSubmission(canonicalSubmission ?? submissions[0]);

  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;
  const publishedCount = submissions.filter((s) => s.status === "published").length;

  return {
    version: TENDER_MARKETPLACE_VERSION,
    reportId: `tender-publishing-report-${Date.now()}`,
    submissionCount: submissions.length,
    approvedCount,
    rejectedCount,
    publishedCount,
    validation,
    summary: [
      "tender-publishing-report",
      `submissions=${submissions.length}`,
      `approved=${approvedCount}`,
      `rejected=${rejectedCount}`,
      `published=${publishedCount}`,
      `valid=${validation.valid}`,
      `canonical=${CANONICAL_TENDER_PUBLISHING_QUERY.submissionId}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
