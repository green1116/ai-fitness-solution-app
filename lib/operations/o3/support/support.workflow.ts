/**
 * Operations O3 — Support workflow
 */

import { SUPPORT_WORKFLOW_STAGES } from "../ticket/ticket.constants";
import { getTicket } from "../ticket/ticket.registry";
import type {
  AdvanceSupportWorkflowInput,
  SupportWorkflow,
  SupportWorkflowStage,
} from "./support.types";

const workflows = new Map<string, SupportWorkflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(workflow: SupportWorkflow): SupportWorkflow {
  return { ...workflow, metadata: { ...workflow.metadata } };
}

export function advanceSupportWorkflow(
  input: AdvanceSupportWorkflowInput,
): SupportWorkflow {
  const ticketId = input.ticketId.trim();
  if (!ticketId) throw new Error("support.ticketId is required");
  if (!getTicket(ticketId)) {
    throw new Error(`ticket not found: ${ticketId}`);
  }
  if (
    !(SUPPORT_WORKFLOW_STAGES as readonly string[]).includes(input.stage)
  ) {
    throw new Error(`invalid support workflow stage: ${input.stage}`);
  }

  const id = input.id?.trim() || createId("o3wf");
  if (workflows.has(id)) {
    throw new Error(`support workflow already exists: ${id}`);
  }

  const note = (input.note ?? "").trim() || `stage=${input.stage}`;
  const workflow: SupportWorkflow = {
    id,
    ticketId,
    stage: input.stage,
    note,
    detail: `ticket=${ticketId} stage=${input.stage}`,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: nowIso(),
  };
  workflows.set(id, workflow);
  return cloneWorkflow(workflow);
}

export function getSupportWorkflow(
  id: string,
): SupportWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listSupportWorkflows(filter?: {
  ticketId?: string;
  stage?: SupportWorkflowStage;
}): SupportWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.ticketId) {
    const tid = filter.ticketId.trim();
    result = result.filter((w) => w.ticketId === tid);
  }
  if (filter?.stage) result = result.filter((w) => w.stage === filter.stage);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearSupportWorkflows(): void {
  workflows.clear();
}
