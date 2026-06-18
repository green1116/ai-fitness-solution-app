import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildProjectRegistry } from "../project-foundation/project-registry";
import { buildDeliveryIssueRegistry } from "./delivery-issue-registry";
import { buildDeliveryRiskRegistry } from "./delivery-risk-registry";
import type { ProjectRiskIssueSummary, RiskIssueContext } from "./risk-issue-types";

function buildProjectSummaries(
  risks: ReturnType<typeof buildDeliveryRiskRegistry>["records"],
  issues: ReturnType<typeof buildDeliveryIssueRegistry>["records"],
): ProjectRiskIssueSummary[] {
  return buildProjectRegistry().records.map((project) => {
    const projectRisks = risks.filter((risk) => risk.projectId === project.projectId);
    const projectIssues = issues.filter((issue) => issue.projectId === project.projectId);

    return {
      projectId: project.projectId,
      riskCount: projectRisks.length,
      issueCount: projectIssues.length,
      highRiskCount: projectRisks.filter((risk) => risk.riskLevel === "high").length,
      openIssueCount: projectIssues.filter((issue) => issue.status === "open").length,
      maxRiskScore: projectRisks.reduce((max, risk) => Math.max(max, risk.riskScore), 0),
    };
  });
}

let cachedContext: RiskIssueContext | undefined;

export function buildRiskIssueContext(): RiskIssueContext {
  if (cachedContext) return cachedContext;

  const riskRegistry = buildDeliveryRiskRegistry();
  const issueRegistry = buildDeliveryIssueRegistry();
  const summaries = buildProjectSummaries(riskRegistry.records, issueRegistry.records);

  const summary = [
    `risks=${riskRegistry.count}`,
    `issues=${issueRegistry.count}`,
    `highRisks=${riskRegistry.highRiskCount}`,
    `openIssues=${issueRegistry.openIssueCount}`,
  ].join(" ");

  cachedContext = {
    contextId: "pdi-risk-issue-context-v45-p3",
    summaries,
    risks: riskRegistry.records,
    issues: issueRegistry.records,
    summary,
    highRiskCount: riskRegistry.highRiskCount,
    openIssueCount: issueRegistry.openIssueCount,
    mode: PDI_CANONICAL_ID,
  };

  return cachedContext;
}
