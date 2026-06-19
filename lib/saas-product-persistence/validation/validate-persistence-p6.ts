import { SAAS_PRODUCT_PERSISTENCE_P6_TAG } from "../shared/persistence-constants";
import type { PersistenceP6Validation } from "../shared/persistence-types";
import { detectParityMismatches } from "../parity/mismatch-detector";
import { runMemoryPrismaParity, runParityScenarioForBackend, runSelfParityCheck } from "../parity/parity-runner";
import { createMemoryPersistenceRuntime } from "../runtime/persistence-backend";
import {
  P6_PARITY_TENANT,
  buildP6QuoteTitle,
  buildP6WorkspaceName,
} from "../test/parity-fixtures";

const parityInput = {
  tenantId: P6_PARITY_TENANT,
  workspaceName: buildP6WorkspaceName("validate"),
  quoteTitle: buildP6QuoteTitle("validate"),
  actor: "p6-parity-validator",
};

export async function validatePersistenceP6(): Promise<PersistenceP6Validation> {
  const selfParity = await runSelfParityCheck(parityInput);
  const memoryRuntime = createMemoryPersistenceRuntime();
  const memoryOnly = await runParityScenarioForBackend(memoryRuntime, parityInput);

  const memoryBaselineValid =
    memoryOnly.snapshot.workspace.statusAfterCreate === "ACTIVE" &&
    memoryOnly.snapshot.workspace.statusAfterArchive === "ARCHIVED" &&
    memoryOnly.snapshot.workflow.stateAfterCreate === "CREATED" &&
    memoryOnly.snapshot.workflow.stateAfterApprove === "APPROVED" &&
    memoryOnly.snapshot.workflow.historyCount === 2 &&
    memoryOnly.snapshot.workflow.eventCount === 2;

  let prismaParityValid = false;
  let prismaAvailable = false;
  let mismatchCount = 0;
  let prismaError: string | undefined;

  try {
    const comparison = await runMemoryPrismaParity(parityInput);
    prismaAvailable = comparison.prismaAvailable;
    prismaError = comparison.prismaError;
    mismatchCount = comparison.mismatches.length;
    prismaParityValid = comparison.passed;

    if (comparison.cleanup) {
      const { prisma } = await import("@/lib/prisma");
      const { cleanup } = comparison;
      if (cleanup.workflowIds.length) {
        await prisma.workflowEvent.deleteMany({ where: { workflowId: { in: cleanup.workflowIds } } });
        await prisma.workflowHistory.deleteMany({ where: { workflowId: { in: cleanup.workflowIds } } });
        await prisma.workflowInstance.deleteMany({ where: { id: { in: cleanup.workflowIds } } });
      }
      if (cleanup.quoteIds.length) {
        await prisma.quote.deleteMany({ where: { id: { in: cleanup.quoteIds } } });
      }
      if (cleanup.workspaceIds.length) {
        await prisma.workspace.deleteMany({ where: { id: { in: cleanup.workspaceIds } } });
      }
    }
  } catch (error) {
    prismaError = error instanceof Error ? error.message : String(error);
  }

  const detectorValid =
    detectParityMismatches(memoryOnly.snapshot, memoryOnly.snapshot).length === 0;

  const valid =
    selfParity &&
    memoryBaselineValid &&
    detectorValid &&
    prismaAvailable &&
    prismaParityValid;

  return {
    valid,
    summary: `p6Tag=${SAAS_PRODUCT_PERSISTENCE_P6_TAG} selfParity=${selfParity} prismaAvailable=${prismaAvailable} mismatchCount=${mismatchCount} prismaError=${prismaError ?? "none"}`,
  };
}
