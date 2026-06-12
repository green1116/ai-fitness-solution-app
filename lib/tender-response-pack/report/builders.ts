import { buildResponsePackContext } from "../bridge/response-bridge";
import { buildTenderResponseDashboardMetrics } from "../dashboard/builders";
import { buildAllSubmissionReadinessAssessments } from "../submission-readiness/builders";
import type { TenderResponsePackReport } from "../shared/types";
import { RESPONSE_PACK_BIDDER_BRANDS, TENDER_RESPONSE_PACK_VERSION } from "../shared/types";

export function buildTenderResponsePackReport(input?: {
  deploymentId?: string;
}): TenderResponsePackReport {
  const deploymentId = input?.deploymentId ?? "tender-response-pack-report-default";
  const dashboard = buildTenderResponseDashboardMetrics({ deploymentId });
  const submission = buildAllSubmissionReadinessAssessments({ deploymentId });
  const primaryCtx = buildResponsePackContext({ deploymentId, bidderBrand: "Technogym" });

  const responsePacks = RESPONSE_PACK_BIDDER_BRANDS.map((brand) => {
    const assessment = submission.assessments.find((a) => a.bidderBrand === brand)!;
    const ctx = buildResponsePackContext({ deploymentId, bidderBrand: brand });
    return {
      packLabel: assessment.packLabel,
      bidderBrand: brand,
      packageLabel: ctx.proposalContext.equipmentContext.packageLabel,
      submissionReadiness: assessment.submissionReadinessScore,
    };
  });

  return {
    version: TENDER_RESPONSE_PACK_VERSION,
    reportId: `tender-response-pack-report-${deploymentId}`,
    deploymentId,
    tenderId: primaryCtx.tenderId,
    proposalReadiness: dashboard.proposalReadiness,
    complianceReadiness: dashboard.complianceReadiness,
    attachmentReadiness: dashboard.attachmentReadiness,
    submissionReadiness: dashboard.submissionReadiness,
    tenderResponseReadiness: dashboard.tenderResponseReadiness,
    responsePacks,
    summary: [
      "tender-response-pack-report",
      `tenderResponseReadiness=${dashboard.tenderResponseReadiness}%`,
      `proposalReadiness=${dashboard.proposalReadiness}%`,
      `complianceReadiness=${dashboard.complianceReadiness}%`,
      `attachmentReadiness=${dashboard.attachmentReadiness}%`,
      `submissionReadiness=${dashboard.submissionReadiness}%`,
      `packs=${responsePacks.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
