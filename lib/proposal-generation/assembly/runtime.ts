import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import { buildProposalPackage, buildProposalPackageSections, collectProposalSections } from "./builders";
import type { ProposalAssemblyRuntimePayload } from "./types";
import { PROPOSAL_ASSEMBLY_RUNTIME_VERSION } from "./types";

export function validateProposalAssemblyRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const collected = collectProposalSections(deploymentId);
  return {
    valid:
      collected.sectionSummaries.length === 6 &&
      collected.executiveSummary.projectOverview.projectName.length > 0 &&
      collected.complianceMatrix.requirementMappings.length >= 4,
  };
}

export function runProposalAssemblyRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<ProposalAssemblyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "assembly-default";
  const stages: ProposalStageResult[] = [];

  const collected = runStage("assembly-collect", "Collect Proposal Sections", () => collectProposalSections(deploymentId), stages);
  const sections = runStage("assembly-sections", "Proposal Package Sections", () => buildProposalPackageSections({ deploymentId, summaries: collected.sectionSummaries }), stages);
  const proposalPackage = runStage("assembly-package", "Proposal Package", () => buildProposalPackage({ deploymentId, sections }), stages);

  const validation = runStage("assembly-validate", "Proposal Assembly Validation", () => validateProposalAssemblyRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal assembly validation failed");

  const payload: ProposalAssemblyRuntimePayload = {
    version: PROPOSAL_ASSEMBLY_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    executiveSummary: collected.executiveSummary,
    technicalProposal: collected.technicalProposal,
    implementationPlan: collected.implementationPlan,
    riskAnalysis: collected.riskAnalysis,
    deliverySchedule: collected.deliverySchedule,
    complianceMatrix: collected.complianceMatrix,
    proposalPackage,
    summary: `proposal-assembly package=${proposalPackage.packageId} sections=${sections.length} completeness=${proposalPackage.completeness}%`,
  };

  return finalizeRuntime({ domain: "proposal-assembly", deploymentId, stages, payload, summary: payload.summary });
}
