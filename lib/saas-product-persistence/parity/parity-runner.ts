import type { PersistenceRuntime } from "../shared/persistence-types";
import { persistenceRepositories } from "../repositories";
import {
  createMemoryPersistenceRuntime,
  createPrismaPersistenceRuntime,
  registerMemoryPersistenceQuote,
} from "../runtime/persistence-backend";
import { detectParityMismatches } from "./mismatch-detector";
import type {
  ParityBackendSnapshot,
  ParityComparisonResult,
  ParityMismatch,
  ParityRunResult,
  ParityScenarioCleanup,
  ParityScenarioInput,
} from "./parity-types";

export async function runParityScenarioForBackend(
  runtime: PersistenceRuntime,
  input: ParityScenarioInput,
): Promise<{ snapshot: ParityBackendSnapshot; cleanup?: ParityScenarioCleanup }> {
  const cleanup: ParityScenarioCleanup = {
    workspaceIds: [],
    quoteIds: [],
    workflowIds: [],
  };

  const workspace = await runtime.workspace.create({
    tenantId: input.tenantId,
    name: input.workspaceName,
  });
  if (runtime.backend === "prisma") {
    cleanup.workspaceIds.push(workspace.id);
  }

  let quoteId: string;
  if (runtime.backend === "memory") {
    const quote = registerMemoryPersistenceQuote(runtime, {
      workspaceId: workspace.id,
      tenantId: input.tenantId,
      title: input.quoteTitle,
    });
    quoteId = quote.id;
  } else {
    const quote = await persistenceRepositories.quote.create({
      workspaceId: workspace.id,
      tenantId: input.tenantId,
      title: input.quoteTitle,
    });
    quoteId = quote.id;
    cleanup.quoteIds.push(quote.id);
  }

  const archived = await runtime.workspace.archive(workspace.id, input.tenantId);

  const created = await runtime.quoteWorkflow.create({
    workspaceId: workspace.id,
    tenantId: input.tenantId,
    quoteId,
    actor: input.actor,
    reason: "parity-workflow-create",
  });
  if (runtime.backend === "prisma") {
    cleanup.workflowIds.push(created.workflow.id);
  }

  const approved = await runtime.quoteWorkflow.transition({
    workflowId: created.workflow.id,
    tenantId: input.tenantId,
    toState: "APPROVED",
    actor: input.actor,
    reason: "parity-workflow-approve",
  });

  let historyCount = 2;
  let eventCount = 2;
  if (runtime.backend === "prisma") {
    const histories = await persistenceRepositories.workflowHistory.listByWorkflowId(
      created.workflow.id,
      input.tenantId,
    );
    const events = await persistenceRepositories.workflowEvent.listByWorkflowId(
      created.workflow.id,
      input.tenantId,
    );
    historyCount = histories.length;
    eventCount = events.length;
  }

  const snapshot: ParityBackendSnapshot = {
    backend: runtime.backend,
    workspace: {
      tenantId: workspace.tenantId,
      name: workspace.name,
      statusAfterCreate: workspace.status,
      statusAfterArchive: archived.status,
    },
    workflow: {
      workflowType: created.workflow.workflowType,
      stateAfterCreate: created.workflow.currentState,
      stateAfterApprove: approved.workflow.currentState,
      createEventType: created.event.eventType,
      approveEventType: approved.event.eventType,
      approveHistoryFrom: approved.history.fromState,
      approveHistoryTo: approved.history.toState,
      historyCount,
      eventCount,
    },
  };

  return {
    snapshot,
    cleanup: runtime.backend === "prisma" ? cleanup : undefined,
  };
}

export async function runMemoryPrismaParity(input: ParityScenarioInput): Promise<ParityRunResult> {
  const memoryRuntime = createMemoryPersistenceRuntime();
  const memoryResult = await runParityScenarioForBackend(memoryRuntime, input);

  let prismaSnapshot: ParityBackendSnapshot | null = null;
  let prismaAvailable = false;
  let prismaError: string | undefined;
  let cleanup: ParityScenarioCleanup | undefined;
  let mismatches: ParityMismatch[] = [];

  try {
    const prismaRuntime = createPrismaPersistenceRuntime();
    const prismaResult = await runParityScenarioForBackend(prismaRuntime, input);
    prismaSnapshot = prismaResult.snapshot;
    cleanup = prismaResult.cleanup;
    prismaAvailable = true;
    mismatches = detectParityMismatches(memoryResult.snapshot, prismaSnapshot);
  } catch (error) {
    prismaError = error instanceof Error ? error.message : String(error);
  }

  const passed = prismaAvailable && mismatches.length === 0;

  return {
    memory: memoryResult.snapshot,
    prisma: prismaSnapshot,
    prismaAvailable,
    prismaError,
    mismatches,
    passed,
    cleanup,
  };
}

export async function runSelfParityCheck(input: ParityScenarioInput): Promise<boolean> {
  const memoryRuntime = createMemoryPersistenceRuntime();
  const first = await runParityScenarioForBackend(memoryRuntime, input);
  const second = await runParityScenarioForBackend(createMemoryPersistenceRuntime(), input);
  const mismatches = detectParityMismatches(first.snapshot, second.snapshot);
  return mismatches.length === 0;
}
