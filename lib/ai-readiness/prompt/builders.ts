import type { PromptKind, PromptTemplate } from "./types";
import { PROMPT_KINDS } from "./types";

const PROMPT_META: Record<
  PromptKind,
  { name: string; description: string; content: string; variables: string[] }
> = {
  system: {
    name: "System Prompt",
    description: "全局系统角色与输出约束",
    content: "你是 AI Fitness Solution 投标方案生成助手，输出结构化中文内容，不编造未提供的数据。",
    variables: [],
  },
  user: {
    name: "User Prompt",
    description: "用户任务指令模板",
    content: "请根据以下项目信息生成{{section}}章节：\n{{context}}",
    variables: ["section", "context"],
  },
  proposal: {
    name: "Proposal Prompt",
    description: "完整投标方案生成提示",
    content: "基于招标要求生成投标方案，包含：执行摘要、技术方案、实施计划、风险分析、交付计划、合规矩阵。\n项目：{{projectName}}\n客户：{{customerName}}",
    variables: ["projectName", "customerName", "requirements"],
  },
  tender: {
    name: "Tender Prompt",
    description: "招标文件解析与需求提取",
    content: "解析以下招标文件，提取技术要求、商务条款、资质要求与评分项。\n{{tenderText}}",
    variables: ["tenderText"],
  },
};

export function buildPromptTemplates(input?: {
  deploymentId?: string;
}): PromptTemplate[] {
  const deploymentId = input?.deploymentId ?? "prompt-default";
  return PROMPT_KINDS.map((kind) => ({
    templateId: `prompt-${kind}-${deploymentId}`,
    kind,
    ...PROMPT_META[kind],
  }));
}
