import { runProposalAssemblyRuntime } from "@/lib/proposal-generation/assembly";
import type { ProposalPdfSection, ProposalSectionKind } from "./types";
import { PROPOSAL_SECTION_KINDS } from "./types";

const SECTION_TITLES: Record<ProposalSectionKind, string> = {
  "executive-summary": "第一章  项目概述与执行摘要",
  "technical-proposal": "第二章  技术方案",
  "implementation-plan": "第三章  实施计划",
  "risk-analysis": "第四章  风险分析",
  "delivery-schedule": "第五章  交付与验收计划",
  "compliance-matrix": "第六章  合规响应矩阵",
};

function paragraphsFromSummary(kind: ProposalSectionKind, summary: string): string[] {
  return [
    `${SECTION_TITLES[kind]} — 由 Proposal Generation Runtime 派生`,
    summary,
    "（描述层占位，未调用 AI 模型）",
  ];
}

export function buildProposalPdfSections(input?: {
  deploymentId?: string;
}): ProposalPdfSection[] {
  const deploymentId = input?.deploymentId ?? "section-default";
  const assembly = runProposalAssemblyRuntime({ deploymentId });
  const pkg = assembly.payload.proposalPackage;

  const summaryByKind: Record<ProposalSectionKind, string> = {
    "executive-summary": assembly.payload.executiveSummary.summary,
    "technical-proposal": assembly.payload.technicalProposal.summary,
    "implementation-plan": assembly.payload.implementationPlan.summary,
    "risk-analysis": assembly.payload.riskAnalysis.summary,
    "delivery-schedule": assembly.payload.deliverySchedule.summary,
    "compliance-matrix": assembly.payload.complianceMatrix.summary,
  };

  const pageEstimates: Record<ProposalSectionKind, number> = {
    "executive-summary": 3,
    "technical-proposal": 8,
    "implementation-plan": 5,
    "risk-analysis": 4,
    "delivery-schedule": 4,
    "compliance-matrix": 6,
  };

  return PROPOSAL_SECTION_KINDS.map((kind, index) => {
    const pkgSection = pkg.sections.find((s) => s.domain === kind);
    return {
      sectionId: `pdf-section-${kind}-${deploymentId}`,
      kind,
      title: SECTION_TITLES[kind],
      pageEstimate: pageEstimates[kind],
      paragraphs: paragraphsFromSummary(kind, pkgSection?.summary ?? summaryByKind[kind]),
    };
  });
}
