/**
 * E03-P2 — Agent Execution Result
 */

export type AgentExecutionResultStatus =
  | "ready"
  | "running"
  | "completed"
  | "result"
  | "failed";

export type AgentExecutionOutput = Readonly<Record<string, unknown>>;

export type AgentExecutionResult = {
  success: boolean;
  output: AgentExecutionOutput;
  traceId: string;
  duration: number;
  status: AgentExecutionResultStatus;
  executionId: string;
  agentId: string;
  taskId: string;
  errorMessage?: string;
  readOnly: true;
};

export function buildAgentExecutionResult(input: {
  success: boolean;
  output?: AgentExecutionOutput;
  traceId: string;
  duration: number;
  status: AgentExecutionResultStatus;
  executionId: string;
  agentId: string;
  taskId: string;
  errorMessage?: string;
}): AgentExecutionResult {
  return {
    success: input.success,
    output: Object.freeze({ ...(input.output ?? {}) }),
    traceId: input.traceId,
    duration: Math.max(0, Math.round(input.duration)),
    status: input.status,
    executionId: input.executionId,
    agentId: input.agentId,
    taskId: input.taskId,
    errorMessage: input.errorMessage,
    readOnly: true,
  };
}

export function assertAgentExecutionResultPass(
  result: AgentExecutionResult,
): asserts result is AgentExecutionResult & {
  success: true;
  status: "result";
} {
  if (!result.success || result.status !== "result") {
    throw new Error(
      `E03 agent execution failed: status=${result.status} error=${result.errorMessage ?? "unknown"}`,
    );
  }
}
