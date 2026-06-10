import { buildCompletionResponse } from "../completion/builders";
import { buildTokenUsage } from "../token/builders";
import type {
  AdapterGenerateInput,
  AdapterGenerateResult,
  AiAdapter,
} from "./types";

function stubResult(
  task: AdapterGenerateResult["task"],
  input: AdapterGenerateInput,
  content: string,
  tokens: { prompt: number; completion: number },
): AdapterGenerateResult {
  const requestId = `adapter-req-${task}-${input.deploymentId}`;
  const completion = buildCompletionResponse({
    deploymentId: input.deploymentId,
    request: {
      requestId,
      modelId: `gpt-4o-${input.deploymentId}`,
      promptKind: task,
      messages: [{ role: "user", content: input.projectName }],
      mode: "readiness-stub",
    },
  });
  return {
    resultId: `adapter-result-${task}-${input.deploymentId}`,
    task,
    completion: { ...completion, content },
    tokenUsage: buildTokenUsage({
      deploymentId: input.deploymentId,
      promptTokens: tokens.prompt,
      completionTokens: tokens.completion,
    }),
    mode: "readiness-stub",
  };
}

export function buildAiAdapter(input?: { deploymentId?: string }): AiAdapter {
  const deploymentId = input?.deploymentId ?? "adapter-default";
  const providerId = "openai";
  const modelId = `gpt-4o-${deploymentId}`;

  return {
    adapterId: `ai-adapter-${deploymentId}`,
    providerId,
    modelId,
    generateProposal(inp) {
      return stubResult(
        "proposal",
        inp,
        `【readiness-stub】投标方案：${inp.projectName} — 完整六章方案描述层占位。`,
        { prompt: 3200, completion: 4800 },
      );
    },
    generateSummary(inp) {
      return stubResult(
        "summary",
        inp,
        `【readiness-stub】执行摘要：${inp.projectName} 项目概述与核心优势。`,
        { prompt: 800, completion: 600 },
      );
    },
    generateRiskAnalysis(inp) {
      return stubResult(
        "risk-analysis",
        inp,
        `【readiness-stub】风险分析：${inp.projectName} — 供应链、施工、验收风险及缓解措施。`,
        { prompt: 1200, completion: 900 },
      );
    },
    generateComplianceMatrix(inp) {
      return stubResult(
        "compliance-matrix",
        inp,
        `【readiness-stub】合规矩阵：${inp.projectName} — 招标要求逐条响应映射。`,
        { prompt: 2000, completion: 1500 },
      );
    },
  };
}

export function runAdapterTasks(adapter: AiAdapter, input: AdapterGenerateInput): AdapterGenerateResult[] {
  return [
    adapter.generateProposal(input),
    adapter.generateSummary(input),
    adapter.generateRiskAnalysis(input),
    adapter.generateComplianceMatrix(input),
  ];
}
