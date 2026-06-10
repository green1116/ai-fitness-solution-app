import type { ProposalKnowledgeAsset, ProposalTemplateType } from "./types";
import { PROPOSAL_TEMPLATE_TYPES } from "./types";

const TEMPLATE_META: Record<
  ProposalTemplateType,
  { title: string; sections: string[]; wordCountEstimate: number }
> = {
  "executive-summary": {
    title: "Executive Summary Template 执行摘要模板",
    sections: ["项目概述", "方案亮点", "投资回报", "实施周期"],
    wordCountEstimate: 800,
  },
  "technical-proposal": {
    title: "Technical Proposal Template 技术方案模板",
    sections: ["需求分析", "设备选型", "空间布局", "技术参数", "品牌资质"],
    wordCountEstimate: 3500,
  },
  implementation: {
    title: "Implementation Template 实施计划模板",
    sections: ["项目里程碑", "施工计划", "验收标准", "培训交付", "售后服务"],
    wordCountEstimate: 2000,
  },
  compliance: {
    title: "Compliance Template 合规响应模板",
    sections: ["资质证明", "技术偏离表", "商务偏离表", "承诺书", "业绩案例"],
    wordCountEstimate: 2500,
  },
};

export function buildProposalKnowledgeAssets(input?: {
  deploymentId?: string;
}): ProposalKnowledgeAsset[] {
  const deploymentId = input?.deploymentId ?? "proposal-knowledge-default";
  return PROPOSAL_TEMPLATE_TYPES.map((type) => {
    const meta = TEMPLATE_META[type];
    return {
      assetId: `proposal-knowledge-${type}-${deploymentId}`,
      template: {
        templateId: `proposal-template-${type}-${deploymentId}`,
        type,
        title: meta.title,
        sections: meta.sections,
        wordCountEstimate: meta.wordCountEstimate,
      },
      mode: "readiness-stub" as const,
    };
  });
}

export { PROPOSAL_TEMPLATE_TYPES, TEMPLATE_META };
