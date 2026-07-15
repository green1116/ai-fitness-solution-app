/**
 * E06-P1 — Operation Execution Context
 */

export type OperationInput = Readonly<Record<string, unknown>>;
export type OperationMetadata = Readonly<Record<string, string>>;

export type OperationExecutionContext = {
  executionId: string;
  operationId: string;
  intelligenceId: string;
  taskId: string;
  insightId?: string;
  input: OperationInput;
  metadata: OperationMetadata;
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

export function createOperationExecutionContext(input: {
  operationId: string;
  intelligenceId: string;
  taskId?: string;
  insightId?: string;
  input?: OperationInput;
  metadata?: OperationMetadata;
  executionId?: string;
}): OperationExecutionContext {
  if (!input.operationId.trim()) {
    throw new Error("operationId is required");
  }
  if (!input.intelligenceId.trim()) {
    throw new Error("intelligenceId is required");
  }

  return {
    executionId: input.executionId?.trim() || createId("op-exec"),
    operationId: input.operationId.trim(),
    intelligenceId: input.intelligenceId.trim(),
    taskId: input.taskId?.trim() || createId("op-task"),
    insightId: input.insightId?.trim() || undefined,
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function assertValidOperationContext(
  context: OperationExecutionContext,
): void {
  if (!context.executionId.trim()) throw new Error("executionId is required");
  if (!context.operationId.trim()) {
    throw new Error("operationId is required");
  }
  if (!context.intelligenceId.trim()) {
    throw new Error("intelligenceId is required");
  }
  if (context.readOnly !== true) {
    throw new Error("context.readOnly must be true");
  }
}
