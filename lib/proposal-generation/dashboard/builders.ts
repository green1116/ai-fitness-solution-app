import { collectProposalSections } from "../assembly/builders";

export function buildProposalDashboardMetrics(input?: {
  deploymentId?: string;
}): Omit<
  import("./types").ProposalDashboardRuntimePayload,
  "version" | "proposalVersion" | "summary"
> & { summary: string } {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const collected = collectProposalSections(deploymentId);

  const sectionCount = collected.sectionSummaries.length;
  const proposalCompleteness = 100;
  const complianceCoverage =
    collected.complianceMatrix.complianceStatus.length > 0
      ? Math.round(
          collected.complianceMatrix.complianceStatus.reduce(
            (sum, entry) => sum + entry.coverageRate,
            0,
          ) / collected.complianceMatrix.complianceStatus.length,
        )
      : 0;
  const riskCoverage =
    collected.riskAnalysis.riskRegister.length > 0
      ? Math.round(
          (collected.riskAnalysis.mitigationStrategies.length /
            collected.riskAnalysis.riskRegister.length) *
            100,
        )
      : 0;
  const deliveryReadiness =
    collected.deliverySchedule.deliveryPlan.length > 0
      ? Math.round(
          (collected.deliverySchedule.acceptancePlan.length /
            collected.deliverySchedule.deliveryPlan.length) *
            80,
        )
      : 0;

  let proposalReadiness: import("./types").ProposalDashboardRuntimePayload["proposalReadiness"] =
    "contract-ready";
  if (proposalCompleteness >= 95 && complianceCoverage >= 90) {
    proposalReadiness = "generation-ready";
  } else if (proposalCompleteness >= 70) {
    proposalReadiness = "in-progress";
  }

  return {
    proposalCompleteness,
    proposalReadiness,
    complianceCoverage,
    riskCoverage,
    deliveryReadiness,
    sectionCount,
    summary: `proposal-dashboard completeness=${proposalCompleteness}% compliance=${complianceCoverage}% risk=${riskCoverage}% delivery=${deliveryReadiness}%`,
  };
}
