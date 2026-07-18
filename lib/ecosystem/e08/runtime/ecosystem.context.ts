/**
 * E08-P1 — Ecosystem Execution Context
 */

export type EcosystemInput = Readonly<Record<string, unknown>>;
export type EcosystemMetadata = Readonly<Record<string, string>>;

export type EcosystemExecutionContext = {
  executionId: string;
  partnerId: string;
  workerId: string;
  taskId: string;
  relationshipId?: string;
  input: EcosystemInput;
  metadata: EcosystemMetadata;
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

export function createEcosystemExecutionContext(input: {
  partnerId: string;
  workerId: string;
  taskId?: string;
  relationshipId?: string;
  input?: EcosystemInput;
  metadata?: EcosystemMetadata;
  executionId?: string;
}): EcosystemExecutionContext {
  if (!input.partnerId.trim()) {
    throw new Error("partnerId is required");
  }
  if (!input.workerId.trim()) {
    throw new Error("workerId is required");
  }

  return {
    executionId: input.executionId?.trim() || createId("eco-exec"),
    partnerId: input.partnerId.trim(),
    workerId: input.workerId.trim(),
    taskId: input.taskId?.trim() || createId("eco-task"),
    relationshipId: input.relationshipId?.trim() || undefined,
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function assertValidEcosystemContext(
  context: EcosystemExecutionContext,
): void {
  if (!context.executionId.trim()) throw new Error("executionId is required");
  if (!context.partnerId.trim()) {
    throw new Error("partnerId is required");
  }
  if (!context.workerId.trim()) {
    throw new Error("workerId is required");
  }
  if (context.readOnly !== true) {
    throw new Error("context.readOnly must be true");
  }
}
