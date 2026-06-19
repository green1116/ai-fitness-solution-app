import { prisma } from "@/lib/prisma";
import type { AppendWorkflowEventInput, EventType, WorkflowEventRecord } from "../shared/persistence-types";
import { toWorkflowEventDomain } from "../mappers/workflow-event-mapper";
import type { WorkflowEventRepository } from "../contracts/persistence-contracts";
import { assertWorkflowTenant } from "./tenant-guard";

export const workflowEventRepository: WorkflowEventRepository = {
  async append(input: AppendWorkflowEventInput): Promise<WorkflowEventRecord> {
    await assertWorkflowTenant(input.workflowId, input.tenantId);
    const row = await prisma.workflowEvent.create({
      data: {
        workflowId: input.workflowId,
        eventType: input.eventType,
        fromState: input.fromState,
        toState: input.toState,
        actor: input.actor,
        reason: input.reason,
      },
    });
    return toWorkflowEventDomain(row);
  },

  async listByWorkflowId(workflowId: string, tenantId: string): Promise<WorkflowEventRecord[]> {
    await assertWorkflowTenant(workflowId, tenantId);
    const rows = await prisma.workflowEvent.findMany({
      where: { workflowId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toWorkflowEventDomain);
  },

  async listByEventType(
    workflowId: string,
    tenantId: string,
    eventType: EventType,
  ): Promise<WorkflowEventRecord[]> {
    await assertWorkflowTenant(workflowId, tenantId);
    const rows = await prisma.workflowEvent.findMany({
      where: { workflowId, eventType },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toWorkflowEventDomain);
  },
};

export const appendWorkflowEvent = workflowEventRepository.append.bind(workflowEventRepository);
export const listWorkflowEventsByWorkflowId =
  workflowEventRepository.listByWorkflowId.bind(workflowEventRepository);
export const listWorkflowEventsByType = workflowEventRepository.listByEventType.bind(workflowEventRepository);
