/**
 * E03-P2 — Agent Execution Context
 * Reuses E03 P1 AgentDefinition identity fields
 */

export type AgentExecutionInput = Readonly<Record<string, unknown>>;

export type AgentExecutionMetadata = Readonly<Record<string, string>>;

export type AgentExecutionContext = {
  executionId: string;
  agentId: string;
  taskId: string;
  input: AgentExecutionInput;
  metadata: AgentExecutionMetadata;
  createdAt: string;
  readOnly: true;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function createAgentExecutionContext(input: {
  agentId: string;
  taskId?: string;
  input?: AgentExecutionInput;
  metadata?: AgentExecutionMetadata;
  executionId?: string;
}): AgentExecutionContext {
  if (!input.agentId.trim()) {
    throw new Error("agentId is required");
  }

  return {
    executionId: input.executionId?.trim() || createId("exec"),
    agentId: input.agentId.trim(),
    taskId: input.taskId?.trim() || createId("task"),
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function assertValidExecutionContext(
  context: AgentExecutionContext,
): void {
  if (!context.executionId.trim()) {
    throw new Error("executionId is required");
  }
  if (!context.agentId.trim()) {
    throw new Error("agentId is required");
  }
  if (!context.taskId.trim()) {
    throw new Error("taskId is required");
  }
  if (context.readOnly !== true) {
    throw new Error("context.readOnly must be true");
  }
}
