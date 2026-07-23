/**
 * Launch L4 — Workflow engine
 */

import { getScenario } from "../scenario/scenario.registry";
import { initializeWorkflowSteps } from "./workflow.steps";
import type {
  CreateWorkflowInput,
  WorkflowDefinition,
} from "./workflow.types";

const workflows = new Map<string, WorkflowDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(workflow: WorkflowDefinition): WorkflowDefinition {
  return {
    ...workflow,
    stepLabels: [...workflow.stepLabels],
    metadata: { ...workflow.metadata },
  };
}

export function createWorkflow(
  input: CreateWorkflowInput,
): WorkflowDefinition {
  const name = input.name.trim();
  const scenarioId = input.scenarioId.trim();
  if (!name) throw new Error("workflow.name is required");
  if (!scenarioId) throw new Error("workflow.scenarioId is required");
  if (!getScenario(scenarioId)) {
    throw new Error(`scenario not found: ${scenarioId}`);
  }

  const stepLabels = (input.stepLabels ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (stepLabels.length < 1) {
    throw new Error("workflow.stepLabels must include at least one step");
  }

  const id = input.id?.trim() || createId("l4wf");
  if (workflows.has(id)) {
    throw new Error(`workflow already exists: ${id}`);
  }

  const workflow: WorkflowDefinition = {
    id,
    scenarioId,
    name,
    stepLabels,
    detail: `steps=${stepLabels.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  workflows.set(id, workflow);
  initializeWorkflowSteps(id, stepLabels);
  return cloneWorkflow(workflow);
}

export function getWorkflow(id: string): WorkflowDefinition | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listWorkflows(filter?: {
  scenarioId?: string;
}): WorkflowDefinition[] {
  let result = [...workflows.values()];
  if (filter?.scenarioId) {
    const sid = filter.scenarioId.trim();
    result = result.filter((w) => w.scenarioId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearWorkflows(): void {
  workflows.clear();
}
