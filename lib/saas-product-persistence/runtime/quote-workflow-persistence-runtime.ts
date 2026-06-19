import { PERSISTENCE_ERROR_CODES, SaasProductPersistenceError } from "../shared/persistence-errors";
import type {
  CreateQuoteWorkflowInput,
  QuoteWorkflowMutationResult,
  TransitionQuoteWorkflowInput,
  WorkflowRecord,
  WorkflowState,
} from "../shared/persistence-types";
import { workflowRepository } from "../repositories/workflow-repository";
import { workflowHistoryRepository } from "../repositories/workflow-history-repository";
import { workflowEventRepository } from "../repositories/workflow-event-repository";
import { runPersistenceTransaction } from "../repositories/transaction";

function assertTenantId(tenantId: string): void {
  if (!tenantId.trim()) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      "tenantId is required",
    );
  }
}

function assertQuoteWorkflowState(toState: WorkflowState): void {
  if (toState !== "APPROVED" && toState !== "REJECTED") {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
      `quote workflow transition only supports APPROVED or REJECTED, got: ${toState}`,
    );
  }
}

function assertQuoteWorkflowType(workflow: WorkflowRecord): void {
  if (workflow.workflowType !== "QUOTE") {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_WORKFLOW_TYPE,
      `quote workflow runtime only supports QUOTE, got: ${workflow.workflowType}`,
    );
  }
}

export async function createQuoteWorkflow(
  input: CreateQuoteWorkflowInput,
): Promise<QuoteWorkflowMutationResult> {
  assertTenantId(input.tenantId);

  return runPersistenceTransaction(async () => {
    const workflow = await workflowRepository.create({
      workspaceId: input.workspaceId,
      tenantId: input.tenantId,
      quoteId: input.quoteId,
      workflowType: "QUOTE",
      currentState: "CREATED",
      metadata: input.metadata,
    });

    const history = await workflowHistoryRepository.append({
      workflowId: workflow.id,
      tenantId: input.tenantId,
      fromState: "CREATED",
      toState: "CREATED",
      actor: input.actor,
      reason: input.reason,
    });

    const event = await workflowEventRepository.append({
      workflowId: workflow.id,
      tenantId: input.tenantId,
      eventType: "WORKFLOW_CREATED",
      toState: "CREATED",
      actor: input.actor,
      reason: input.reason,
    });

    return { workflow, history, event };
  });
}

export async function transitionQuoteWorkflow(
  input: TransitionQuoteWorkflowInput,
): Promise<QuoteWorkflowMutationResult> {
  assertTenantId(input.tenantId);
  assertQuoteWorkflowState(input.toState);

  const current = await workflowRepository.findById(input.workflowId, input.tenantId);
  if (!current) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Quote workflow not found: ${input.workflowId}`,
    );
  }
  assertQuoteWorkflowType(current);

  return runPersistenceTransaction(async () => {
    const workflow = await workflowRepository.updateCurrentState({
      workflowId: input.workflowId,
      tenantId: input.tenantId,
      toState: input.toState,
    });

    const history = await workflowHistoryRepository.append({
      workflowId: input.workflowId,
      tenantId: input.tenantId,
      fromState: current.currentState,
      toState: input.toState,
      actor: input.actor,
      reason: input.reason,
    });

    const event = await workflowEventRepository.append({
      workflowId: input.workflowId,
      tenantId: input.tenantId,
      eventType: "STATE_CHANGED",
      fromState: current.currentState,
      toState: input.toState,
      actor: input.actor,
      reason: input.reason,
    });

    return { workflow, history, event };
  });
}

export async function listQuoteWorkflows(
  workspaceId: string,
  tenantId: string,
): Promise<WorkflowRecord[]> {
  assertTenantId(tenantId);
  const workflows = await workflowRepository.listByWorkspaceId(workspaceId, tenantId);
  return workflows.filter((workflow) => workflow.workflowType === "QUOTE");
}

export const quoteWorkflowPersistenceRuntime = {
  create: createQuoteWorkflow,
  transition: transitionQuoteWorkflow,
  list: listQuoteWorkflows,
} as const;
