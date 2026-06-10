import { runComplianceMatrixRuntime } from "../compliance-matrix/runtime";
import { runDeliveryScheduleRuntime } from "../delivery-schedule/runtime";
import { runExecutiveSummaryRuntime } from "../executive-summary/runtime";
import { runImplementationPlanRuntime } from "../implementation-plan/runtime";
import { runRiskAnalysisRuntime } from "../risk-analysis/runtime";
import { buildTenderParseSnapshot } from "../shared/tender-input";
import { runTechnicalProposalRuntime } from "../technical-proposal/runtime";
import type { ProposalPackage, ProposalPackageSection } from "./types";
import { PROPOSAL_ASSEMBLY_RUNTIME_VERSION } from "./types";

export function buildProposalPackageSections(input: {
  deploymentId: string;
  summaries: Array<{ domain: string; name: string; summary: string }>;
}): ProposalPackageSection[] {
  return input.summaries.map((item, index) => ({
    sectionId: `section-${index}-${input.deploymentId}`,
    name: item.name,
    domain: item.domain,
    included: true,
    summary: item.summary,
  }));
}

export function buildProposalPackage(input: {
  deploymentId: string;
  sections: ProposalPackageSection[];
}): ProposalPackage {
  const tender = buildTenderParseSnapshot({ deploymentId: input.deploymentId });
  const included = input.sections.filter((s) => s.included).length;
  const completeness = Math.round((included / input.sections.length) * 1000) / 10;

  return {
    packageId: `proposal-package-${input.deploymentId}`,
    projectId: tender.projectId,
    projectName: tender.projectName,
    version: PROPOSAL_ASSEMBLY_RUNTIME_VERSION,
    sections: input.sections,
    completeness,
    generatedAt: new Date().toISOString(),
    mode: "readiness-stub",
  };
}

export function collectProposalSections(deploymentId: string) {
  const executiveSummary = runExecutiveSummaryRuntime({ deploymentId });
  const technicalProposal = runTechnicalProposalRuntime({ deploymentId });
  const implementationPlan = runImplementationPlanRuntime({ deploymentId });
  const riskAnalysis = runRiskAnalysisRuntime({ deploymentId });
  const deliverySchedule = runDeliveryScheduleRuntime({ deploymentId });
  const complianceMatrix = runComplianceMatrixRuntime({ deploymentId });

  return {
    executiveSummary: executiveSummary.payload,
    technicalProposal: technicalProposal.payload,
    implementationPlan: implementationPlan.payload,
    riskAnalysis: riskAnalysis.payload,
    deliverySchedule: deliverySchedule.payload,
    complianceMatrix: complianceMatrix.payload,
    sectionSummaries: [
      { domain: "executive-summary", name: "Executive Summary", summary: executiveSummary.summary },
      { domain: "technical-proposal", name: "Technical Proposal", summary: technicalProposal.summary },
      { domain: "implementation-plan", name: "Implementation Plan", summary: implementationPlan.summary },
      { domain: "risk-analysis", name: "Risk Analysis", summary: riskAnalysis.summary },
      { domain: "delivery-schedule", name: "Delivery Schedule", summary: deliverySchedule.summary },
      { domain: "compliance-matrix", name: "Compliance Matrix", summary: complianceMatrix.summary },
    ],
  };
}
