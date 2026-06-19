import type { WorkflowEvent as PrismaWorkflowEvent } from "@prisma/client";
import type { EventType, WorkflowEventRecord } from "../shared/persistence-types";

function toIso(date: Date): string {
  return date.toISOString();
}

export function toWorkflowEventDomain(row: PrismaWorkflowEvent): WorkflowEventRecord {
  return {
    id: row.id,
    workflowId: row.workflowId,
    eventType: row.eventType as EventType,
    fromState: row.fromState ?? undefined,
    toState: row.toState ?? undefined,
    actor: row.actor ?? undefined,
    reason: row.reason ?? undefined,
    createdAt: toIso(row.createdAt),
  };
}

export function toNullableWorkflowEventDomain(row: PrismaWorkflowEvent | null): WorkflowEventRecord | null {
  return row ? toWorkflowEventDomain(row) : null;
}
