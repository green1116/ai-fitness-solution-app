/**
 * E05-P1 — Intelligence Execution Context
 */

export type IntelligenceInput = Readonly<Record<string, unknown>>;
export type IntelligenceMetadata = Readonly<Record<string, string>>;

export type IntelligenceExecutionContext = {
  executionId: string;
  intelligenceId: string;
  businessAgentId: string;
  taskId: string;
  insightId?: string;
  input: IntelligenceInput;
  metadata: IntelligenceMetadata;
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

export function createIntelligenceExecutionContext(input: {
  intelligenceId: string;
  businessAgentId: string;
  taskId?: string;
  insightId?: string;
  input?: IntelligenceInput;
  metadata?: IntelligenceMetadata;
  executionId?: string;
}): IntelligenceExecutionContext {
  if (!input.intelligenceId.trim()) {
    throw new Error("intelligenceId is required");
  }
  if (!input.businessAgentId.trim()) {
    throw new Error("businessAgentId is required");
  }

  return {
    executionId: input.executionId?.trim() || createId("intel-exec"),
    intelligenceId: input.intelligenceId.trim(),
    businessAgentId: input.businessAgentId.trim(),
    taskId: input.taskId?.trim() || createId("intel-task"),
    insightId: input.insightId?.trim() || undefined,
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function assertValidIntelligenceContext(
  context: IntelligenceExecutionContext,
): void {
  if (!context.executionId.trim()) throw new Error("executionId is required");
  if (!context.intelligenceId.trim()) {
    throw new Error("intelligenceId is required");
  }
  if (!context.businessAgentId.trim()) {
    throw new Error("businessAgentId is required");
  }
  if (context.readOnly !== true) {
    throw new Error("context.readOnly must be true");
  }
}
