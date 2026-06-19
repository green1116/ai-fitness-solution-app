import { prisma } from "@/lib/prisma";
import type { AppendWorkflowHistoryInput, WorkflowHistoryRecord } from "../shared/persistence-types";
import { toWorkflowHistoryDomain } from "../mappers/workflow-history-mapper";
import type { WorkflowHistoryRepository } from "../contracts/persistence-contracts";
import { assertWorkflowTenant } from "./tenant-guard";

export const workflowHistoryRepository: WorkflowHistoryRepository = {
  async append(input: AppendWorkflowHistoryInput): Promise<WorkflowHistoryRecord> {
    await assertWorkflowTenant(input.workflowId, input.tenantId);
    const row = await prisma.workflowHistory.create({
      data: {
        workflowId: input.workflowId,
        fromState: input.fromState,
        toState: input.toState,
        actor: input.actor,
        reason: input.reason,
      },
    });
    return toWorkflowHistoryDomain(row);
  },

  async listByWorkflowId(workflowId: string, tenantId: string): Promise<WorkflowHistoryRecord[]> {
    await assertWorkflowTenant(workflowId, tenantId);
    const rows = await prisma.workflowHistory.findMany({
      where: { workflowId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toWorkflowHistoryDomain);
  },
};

export const appendWorkflowHistory = workflowHistoryRepository.append.bind(workflowHistoryRepository);
export const listWorkflowHistoryByWorkflowId =
  workflowHistoryRepository.listByWorkflowId.bind(workflowHistoryRepository);
