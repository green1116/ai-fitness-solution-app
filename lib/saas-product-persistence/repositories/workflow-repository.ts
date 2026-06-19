import { prisma } from "@/lib/prisma";
import { WORKFLOW_STATE_TRANSITIONS } from "../shared/persistence-constants";
import type {
  CreateWorkflowInput,
  UpdateWorkflowStateInput,
  WorkflowRecord,
  WorkflowState,
} from "../shared/persistence-types";
import { PERSISTENCE_ERROR_CODES, SaasProductPersistenceError } from "../shared/persistence-errors";
import {
  toNullableWorkflowDomain,
  toWorkflowDomain,
  toWorkflowPersistenceMetadata,
} from "../mappers/workflow-mapper";
import type { WorkflowRepository } from "../contracts/persistence-contracts";
import { assertQuoteTenant, assertWorkspaceTenant } from "./tenant-guard";

function assertWorkflowType(workflowType: string): void {
  if (workflowType !== "QUOTE") {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_WORKFLOW_TYPE,
      `Workflow type not enabled in V50 P2: ${workflowType}`,
    );
  }
}

function assertWorkflowTransition(from: WorkflowState, to: WorkflowState): void {
  const allowed = WORKFLOW_STATE_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
      `Workflow transition denied: ${from} -> ${to}`,
    );
  }
}

async function requireWorkflow(id: string, tenantId: string): Promise<WorkflowRecord> {
  const row = await prisma.workflowInstance.findFirst({
    where: {
      id,
      workspace: { tenantId },
    },
  });
  const domain = toNullableWorkflowDomain(row);
  if (!domain) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Workflow not found: ${id}`,
    );
  }
  return domain;
}

export const workflowRepository: WorkflowRepository = {
  async create(input: CreateWorkflowInput): Promise<WorkflowRecord> {
    assertWorkflowType(input.workflowType);
    await assertWorkspaceTenant(input.workspaceId, input.tenantId);
    if (input.quoteId) {
      await assertQuoteTenant(input.quoteId, input.tenantId);
    }

    const row = await prisma.workflowInstance.create({
      data: {
        workspaceId: input.workspaceId,
        quoteId: input.quoteId,
        workflowType: input.workflowType,
        currentState: input.currentState ?? "CREATED",
        metadata: toWorkflowPersistenceMetadata(input.metadata),
      },
    });
    return toWorkflowDomain(row);
  },

  async updateCurrentState(input: UpdateWorkflowStateInput): Promise<WorkflowRecord> {
    const current = await requireWorkflow(input.workflowId, input.tenantId);
    assertWorkflowTransition(current.currentState, input.toState);
    const row = await prisma.workflowInstance.update({
      where: { id: input.workflowId },
      data: { currentState: input.toState },
    });
    return toWorkflowDomain(row);
  },

  async findById(id: string, tenantId: string): Promise<WorkflowRecord | null> {
    const row = await prisma.workflowInstance.findFirst({
      where: {
        id,
        workspace: { tenantId },
      },
    });
    return toNullableWorkflowDomain(row);
  },

  async findByQuoteId(quoteId: string, tenantId: string): Promise<WorkflowRecord[]> {
    await assertQuoteTenant(quoteId, tenantId);
    const rows = await prisma.workflowInstance.findMany({
      where: {
        quoteId,
        workspace: { tenantId },
      },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toWorkflowDomain);
  },

  async listByWorkspaceId(workspaceId: string, tenantId: string): Promise<WorkflowRecord[]> {
    await assertWorkspaceTenant(workspaceId, tenantId);
    const rows = await prisma.workflowInstance.findMany({
      where: { workspaceId, workspace: { tenantId } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toWorkflowDomain);
  },
};

export const createWorkflow = workflowRepository.create.bind(workflowRepository);
export const updateWorkflowCurrentState = workflowRepository.updateCurrentState.bind(workflowRepository);
export const findWorkflowById = workflowRepository.findById.bind(workflowRepository);
export const findWorkflowsByQuoteId = workflowRepository.findByQuoteId.bind(workflowRepository);
export const listWorkflowsByWorkspaceId = workflowRepository.listByWorkspaceId.bind(workflowRepository);
