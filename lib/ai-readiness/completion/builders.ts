import type { CompletionRequest, CompletionResponse } from "./types";

export function buildCompletionRequest(input?: {
  deploymentId?: string;
}): CompletionRequest {
  const deploymentId = input?.deploymentId ?? "completion-default";
  return {
    requestId: `completion-req-${deploymentId}`,
    modelId: `gpt-4o-${deploymentId}`,
    promptKind: "proposal",
    messages: [
      { role: "system", content: "你是投标方案生成助手（readiness-stub）。" },
      { role: "user", content: "请生成智慧健身中心项目的技术方案摘要。" },
    ],
    mode: "readiness-stub",
  };
}

export function buildCompletionResponse(input?: {
  deploymentId?: string;
  request?: CompletionRequest;
}): CompletionResponse {
  const deploymentId = input?.deploymentId ?? "completion-default";
  const request = input?.request ?? buildCompletionRequest({ deploymentId });
  return {
    responseId: `completion-res-${deploymentId}`,
    requestId: request.requestId,
    content: "【readiness-stub】技术方案摘要：本项目采用分区器械配置与智能化管理系统，满足招标技术要求。（未调用真实模型）",
    finishReason: "stop",
    mode: "readiness-stub",
  };
}
