import type { ParityBackendSnapshot, ParityMismatch } from "./parity-types";

function compareField(
  field: string,
  memoryValue: unknown,
  prismaValue: unknown,
  mismatches: ParityMismatch[],
): void {
  if (memoryValue !== prismaValue) {
    mismatches.push({
      field,
      memoryValue,
      prismaValue,
      message: `parity mismatch at ${field}`,
    });
  }
}

export function detectParityMismatches(
  memory: ParityBackendSnapshot,
  prisma: ParityBackendSnapshot,
): ParityMismatch[] {
  const mismatches: ParityMismatch[] = [];

  compareField("workspace.tenantId", memory.workspace.tenantId, prisma.workspace.tenantId, mismatches);
  compareField("workspace.name", memory.workspace.name, prisma.workspace.name, mismatches);
  compareField(
    "workspace.statusAfterCreate",
    memory.workspace.statusAfterCreate,
    prisma.workspace.statusAfterCreate,
    mismatches,
  );
  compareField(
    "workspace.statusAfterArchive",
    memory.workspace.statusAfterArchive,
    prisma.workspace.statusAfterArchive,
    mismatches,
  );

  compareField(
    "workflow.workflowType",
    memory.workflow.workflowType,
    prisma.workflow.workflowType,
    mismatches,
  );
  compareField(
    "workflow.stateAfterCreate",
    memory.workflow.stateAfterCreate,
    prisma.workflow.stateAfterCreate,
    mismatches,
  );
  compareField(
    "workflow.stateAfterApprove",
    memory.workflow.stateAfterApprove,
    prisma.workflow.stateAfterApprove,
    mismatches,
  );
  compareField(
    "workflow.createEventType",
    memory.workflow.createEventType,
    prisma.workflow.createEventType,
    mismatches,
  );
  compareField(
    "workflow.approveEventType",
    memory.workflow.approveEventType,
    prisma.workflow.approveEventType,
    mismatches,
  );
  compareField(
    "workflow.approveHistoryFrom",
    memory.workflow.approveHistoryFrom,
    prisma.workflow.approveHistoryFrom,
    mismatches,
  );
  compareField(
    "workflow.approveHistoryTo",
    memory.workflow.approveHistoryTo,
    prisma.workflow.approveHistoryTo,
    mismatches,
  );
  compareField("workflow.historyCount", memory.workflow.historyCount, prisma.workflow.historyCount, mismatches);
  compareField("workflow.eventCount", memory.workflow.eventCount, prisma.workflow.eventCount, mismatches);

  return mismatches;
}

export function hasParityMismatches(mismatches: ParityMismatch[]): boolean {
  return mismatches.length > 0;
}
