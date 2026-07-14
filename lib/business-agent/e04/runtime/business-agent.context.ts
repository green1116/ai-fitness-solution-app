/**
 * E04-P1 — Business Agent Execution Context
 */

export type BusinessAgentInput = Readonly<Record<string, unknown>>;
export type BusinessAgentMetadata = Readonly<Record<string, string>>;

export type BusinessAgentExecutionContext = {
  executionId: string;
  businessAgentId: string;
  runtimeAgentId: string;
  taskId: string;
  capabilityId?: string;
  input: BusinessAgentInput;
  metadata: BusinessAgentMetadata;
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

export function createBusinessAgentExecutionContext(input: {
  businessAgentId: string;
  runtimeAgentId: string;
  taskId?: string;
  capabilityId?: string;
  input?: BusinessAgentInput;
  metadata?: BusinessAgentMetadata;
  executionId?: string;
}): BusinessAgentExecutionContext {
  if (!input.businessAgentId.trim()) {
    throw new Error("businessAgentId is required");
  }
  if (!input.runtimeAgentId.trim()) {
    throw new Error("runtimeAgentId is required");
  }

  return {
    executionId: input.executionId?.trim() || createId("ba-exec"),
    businessAgentId: input.businessAgentId.trim(),
    runtimeAgentId: input.runtimeAgentId.trim(),
    taskId: input.taskId?.trim() || createId("ba-task"),
    capabilityId: input.capabilityId?.trim() || undefined,
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function assertValidBusinessAgentContext(
  context: BusinessAgentExecutionContext,
): void {
  if (!context.executionId.trim()) throw new Error("executionId is required");
  if (!context.businessAgentId.trim()) {
    throw new Error("businessAgentId is required");
  }
  if (!context.runtimeAgentId.trim()) {
    throw new Error("runtimeAgentId is required");
  }
  if (context.readOnly !== true) {
    throw new Error("context.readOnly must be true");
  }
}
