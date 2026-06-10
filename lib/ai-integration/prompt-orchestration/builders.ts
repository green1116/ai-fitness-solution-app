import type { PromptAuditEntry, PromptKind, PromptTemplate, PromptTrace } from "./types";
import { PROMPT_KINDS } from "./types";

const PROMPT_VERSION = "v13.0.1";

const TEMPLATE_CONTENT: Record<PromptKind, { title: string; content: string; variables: string[] }> = {
  system: {
    title: "System Prompt 系统指令",
    content: "你是 AI Fitness Solution 专业投标顾问，输出结构化、合规、可审计的方案内容。",
    variables: [],
  },
  user: {
    title: "User Prompt 用户指令",
    content: "请基于项目上下文生成 {{outputType}}，项目：{{projectName}}。",
    variables: ["outputType", "projectName"],
  },
  tender: {
    title: "Tender Prompt 招标上下文",
    content: "招标项目：{{projectName}}，类型：{{projectType}}，规模：{{scale}}，预算：{{budget}}。",
    variables: ["projectName", "projectType", "scale", "budget"],
  },
  proposal: {
    title: "Proposal Prompt 方案生成",
    content: "生成完整投标方案，包含执行摘要、技术方案、实施计划、风险与合规响应。",
    variables: ["sections"],
  },
  knowledge: {
    title: "Knowledge Prompt 知识注入",
    content: "参考知识库：项目类型知识、设备知识、风险模式、合规模式。",
    variables: ["knowledgeRefs"],
  },
};

function checksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash * 31 + content.charCodeAt(i)) >>> 0;
  }
  return `chk-${hash.toString(16)}`;
}

export function buildPromptTemplates(input?: {
  deploymentId?: string;
}): PromptTemplate[] {
  const deploymentId = input?.deploymentId ?? "prompt-default";
  return PROMPT_KINDS.map((kind) => {
    const meta = TEMPLATE_CONTENT[kind];
    return {
      templateId: `prompt-${kind}-${deploymentId}`,
      kind,
      version: PROMPT_VERSION,
      title: meta.title,
      content: meta.content,
      variables: meta.variables,
    };
  });
}

export function buildPromptAudit(templates: PromptTemplate[]): PromptAuditEntry[] {
  return templates.map((t) => ({
    auditId: `audit-${t.templateId}`,
    templateId: t.templateId,
    version: t.version,
    kind: t.kind,
    deployedAt: new Date().toISOString(),
    checksum: checksum(t.content),
  }));
}

export function buildPromptTrace(input: {
  deploymentId: string;
  templates: PromptTemplate[];
  projectName?: string;
}): PromptTrace {
  const projectName = input.projectName ?? "政府健身中心采购项目";
  const assembled = input.templates
    .map((t) => `[${t.kind}] ${t.content.replace("{{projectName}}", projectName)}`)
    .join("\n\n");

  return {
    traceId: `trace-${input.deploymentId}`,
    deploymentId: input.deploymentId,
    templates: input.templates.map((t) => ({
      kind: t.kind,
      templateId: t.templateId,
      version: t.version,
    })),
    assembledPrompt: assembled,
    tracedAt: new Date().toISOString(),
  };
}

export { PROMPT_KINDS, PROMPT_VERSION };
