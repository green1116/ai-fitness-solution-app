import type { WorkflowInstance as PrismaWorkflowInstance, Prisma } from "@prisma/client";
import type { WorkflowRecord, WorkflowState, WorkflowType } from "../shared/persistence-types";

function toIso(date: Date): string {
  return date.toISOString();
}

function toMetadata(value: PrismaWorkflowInstance["metadata"]): Record<string, unknown> | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

export function toWorkflowDomain(row: PrismaWorkflowInstance): WorkflowRecord {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    quoteId: row.quoteId ?? undefined,
    workflowType: row.workflowType as WorkflowType,
    currentState: row.currentState as WorkflowState,
    metadata: toMetadata(row.metadata),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function toNullableWorkflowDomain(row: PrismaWorkflowInstance | null): WorkflowRecord | null {
  return row ? toWorkflowDomain(row) : null;
}

export function toWorkflowPersistenceMetadata(
  metadata?: Record<string, unknown>,
): Prisma.InputJsonValue | undefined {
  return metadata as Prisma.InputJsonValue | undefined;
}
