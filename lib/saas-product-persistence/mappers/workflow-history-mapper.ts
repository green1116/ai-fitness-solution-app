import type { WorkflowHistory as PrismaWorkflowHistory } from "@prisma/client";
import type { WorkflowHistoryRecord } from "../shared/persistence-types";

function toIso(date: Date): string {
  return date.toISOString();
}

export function toWorkflowHistoryDomain(row: PrismaWorkflowHistory): WorkflowHistoryRecord {
  return {
    id: row.id,
    workflowId: row.workflowId,
    fromState: row.fromState,
    toState: row.toState,
    actor: row.actor ?? undefined,
    reason: row.reason ?? undefined,
    createdAt: toIso(row.createdAt),
  };
}

export function toNullableWorkflowHistoryDomain(
  row: PrismaWorkflowHistory | null,
): WorkflowHistoryRecord | null {
  return row ? toWorkflowHistoryDomain(row) : null;
}
