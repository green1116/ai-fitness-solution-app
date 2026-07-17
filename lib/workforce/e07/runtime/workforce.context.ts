/**
 * E07-P1 — Workforce Execution Context
 */

export type WorkforceInput = Readonly<Record<string, unknown>>;
export type WorkforceMetadata = Readonly<Record<string, string>>;

export type WorkforceExecutionContext = {
  executionId: string;
  workerId: string;
  operationId: string;
  taskId: string;
  skillId?: string;
  input: WorkforceInput;
  metadata: WorkforceMetadata;
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

export function createWorkforceExecutionContext(input: {
  workerId: string;
  operationId: string;
  taskId?: string;
  skillId?: string;
  input?: WorkforceInput;
  metadata?: WorkforceMetadata;
  executionId?: string;
}): WorkforceExecutionContext {
  if (!input.workerId.trim()) {
    throw new Error("workerId is required");
  }
  if (!input.operationId.trim()) {
    throw new Error("operationId is required");
  }

  return {
    executionId: input.executionId?.trim() || createId("wf7-exec"),
    workerId: input.workerId.trim(),
    operationId: input.operationId.trim(),
    taskId: input.taskId?.trim() || createId("wf7-task"),
    skillId: input.skillId?.trim() || undefined,
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function assertValidWorkforceContext(
  context: WorkforceExecutionContext,
): void {
  if (!context.executionId.trim()) throw new Error("executionId is required");
  if (!context.workerId.trim()) {
    throw new Error("workerId is required");
  }
  if (!context.operationId.trim()) {
    throw new Error("operationId is required");
  }
  if (context.readOnly !== true) {
    throw new Error("context.readOnly must be true");
  }
}
