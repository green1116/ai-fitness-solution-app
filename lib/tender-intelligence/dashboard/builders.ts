import { collectTenderIntelligence } from "../assembly/builders";

export function buildTenderDashboardMetrics(input?: { deploymentId?: string }): {
  intelligenceCompleteness: number;
  projectUnderstanding: number;
  riskUnderstanding: number;
  complianceUnderstanding: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const collected = collectTenderIntelligence(deploymentId);

  const intelligenceCompleteness = 100;
  const projectUnderstanding = Math.round(
    (collected.classification.payload.classification.confidence +
      (collected.scale.payload.scale.tier ? 0.9 : 0)) *
      50,
  );
  const riskUnderstanding = Math.round(
    (collected.risk.payload.risk.drivers.length / 5) * 100,
  );
  const complianceUnderstanding = collected.compliance.payload.compliance.complianceCoverage;

  return {
    intelligenceCompleteness,
    projectUnderstanding,
    riskUnderstanding,
    complianceUnderstanding,
    summary: `tender-dashboard completeness=${intelligenceCompleteness}% project=${projectUnderstanding}% risk=${riskUnderstanding}% compliance=${complianceUnderstanding}%`,
  };
}
