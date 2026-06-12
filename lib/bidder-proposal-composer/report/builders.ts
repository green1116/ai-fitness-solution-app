import { buildBidderProposalDashboardMetrics } from "../dashboard/builders";
import { buildAllProposalVariants } from "../proposal-variant/builders";
import { buildAllProposalQualityAssessments } from "../proposal-quality/builders";
import { buildProposalContext } from "../bridge/context-bridge";
import type { BidderProposalComposerReport } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION, COMPOSER_BIDDER_BRANDS } from "../shared/types";

export function buildBidderProposalComposerReport(input?: {
  deploymentId?: string;
}): BidderProposalComposerReport {
  const deploymentId = input?.deploymentId ?? "bidder-proposal-composer-report-default";
  const dashboard = buildBidderProposalDashboardMetrics({ deploymentId });
  const { variants } = buildAllProposalVariants({ deploymentId });
  const quality = buildAllProposalQualityAssessments({ deploymentId });
  const primaryCtx = buildProposalContext({ deploymentId, bidderBrand: "Technogym" });

  const proposalSummaries = COMPOSER_BIDDER_BRANDS.map((brand) => {
    const variant = variants.find((v) => v.bidderBrand === brand)!;
    const assessment = quality.assessments.find((a) => a.bidderBrand === brand)!;
    const ctx = buildProposalContext({ deploymentId, bidderBrand: brand });
    return {
      proposalLabel: variant.proposalLabel,
      bidderBrand: brand,
      packageLabel: variant.packageLabel,
      executiveHeadline: variant.executive.strategicPosition,
      budgetTotal: ctx.budgetContext.totalBudgetMin,
      qualityScore: assessment.qualityScore,
    };
  });

  return {
    version: BIDDER_PROPOSAL_COMPOSER_VERSION,
    reportId: `bidder-proposal-composer-report-${deploymentId}`,
    deploymentId,
    tenderId: primaryCtx.tenderContext.tenderId,
    proposalDifferentiationScore: dashboard.proposalDifferentiationScore,
    brandAlignmentScore: dashboard.brandAlignmentScore,
    equipmentAlignmentScore: dashboard.equipmentAlignmentScore,
    budgetAlignmentScore: dashboard.budgetAlignmentScore,
    proposalSummaries,
    summary: [
      "bidder-proposal-composer-report",
      `proposalDifferentiationScore=${dashboard.proposalDifferentiationScore}%`,
      `brandAlignment=${dashboard.brandAlignmentScore}%`,
      `equipmentAlignment=${dashboard.equipmentAlignmentScore}%`,
      `budgetAlignment=${dashboard.budgetAlignmentScore}%`,
      `variants=${proposalSummaries.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
