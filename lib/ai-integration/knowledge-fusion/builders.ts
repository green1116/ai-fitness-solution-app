import { runKnowledgeAssemblyRuntime } from "@/lib/knowledge-base/assembly";
import { runProposalAssemblyRuntime } from "@/lib/proposal-generation/assembly";
import { runTenderIntelligenceAssemblyRuntime } from "@/lib/tender-intelligence/assembly";
import type {
  AiComplianceContext,
  AiProposalContext,
  AiRiskContext,
  AiTenderContext,
  ProjectContext,
} from "./types";

export function buildProjectContext(input?: { deploymentId?: string }): ProjectContext {
  const deploymentId = input?.deploymentId ?? "fusion-default";
  return {
    projectId: `proj-${deploymentId}`,
    projectName: "政府健身中心健身器材采购项目",
    tenderCompany: "某市体育局",
    areaSqm: 1200,
    budgetCny: 2_800_000,
  };
}

export function collectFusionSources(deploymentId: string) {
  const tender = runTenderIntelligenceAssemblyRuntime({ deploymentId });
  const knowledge = runKnowledgeAssemblyRuntime({ deploymentId });
  const proposal = runProposalAssemblyRuntime({ deploymentId });
  const project = buildProjectContext({ deploymentId });

  return { tender, knowledge, proposal, project };
}

export function buildAiProposalContext(input: {
  deploymentId: string;
  sources: ReturnType<typeof collectFusionSources>;
}): AiProposalContext {
  const { proposal, knowledge, tender, project } = input.sources;
  return {
    contextId: `ai-proposal-ctx-${input.deploymentId}`,
    projectName: project.projectName,
    proposalSections: proposal.payload.proposalPackage.sections
      .filter((s) => s.included)
      .map((s) => s.name),
    knowledgeRefs: knowledge.payload.proposal.assets.map((a) => a.template.title),
    tenderClassification: tender.payload.profile.classification,
    mode: "stub",
  };
}

export function buildAiTenderContext(input: {
  deploymentId: string;
  sources: ReturnType<typeof collectFusionSources>;
}): AiTenderContext {
  const profile = input.sources.tender.payload.profile;
  return {
    contextId: `ai-tender-ctx-${input.deploymentId}`,
    projectType: profile.classification,
    scale: profile.scale,
    riskLevel: profile.riskLevel,
    complianceCoverage: profile.complianceCoverage,
  };
}

export function buildAiRiskContext(input: {
  deploymentId: string;
  sources: ReturnType<typeof collectFusionSources>;
}): AiRiskContext {
  const risk = input.sources.tender.payload.risk.risk;
  const knowledgeRisk = input.sources.knowledge.payload.risk.assets;
  return {
    contextId: `ai-risk-ctx-${input.deploymentId}`,
    riskLevel: risk.riskLevel,
    drivers: risk.drivers.map((d) => d.category),
    knowledgePatterns: knowledgeRisk.map((a) => a.riskPattern.name),
  };
}

export function buildAiComplianceContext(input: {
  deploymentId: string;
  sources: ReturnType<typeof collectFusionSources>;
}): AiComplianceContext {
  const compliance = input.sources.tender.payload.compliance.compliance;
  return {
    contextId: `ai-compliance-ctx-${input.deploymentId}`,
    coverage: compliance.complianceCoverage,
    missingAreas: compliance.missingAreas,
    attentionAreas: compliance.attentionAreas,
  };
}
