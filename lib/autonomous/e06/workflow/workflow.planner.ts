/**
 * E06-P3 — Autonomous Workflow Planner
 * Composes ordered action plans from workflow definitions
 */

import { getActionById } from "../action/action.registry";
import { assertWorkflowDefinition } from "./workflow.registry";
import type {
  WorkflowDefinition,
  WorkflowPlan,
  WorkflowPlanStep,
} from "./workflow.types";

export function planWorkflow(workflow: WorkflowDefinition): WorkflowPlan {
  assertWorkflowDefinition(workflow);

  const steps: WorkflowPlanStep[] = workflow.actionIds.map(
    (actionId, index) => {
      const action = getActionById(actionId);
      if (!action) {
        throw new Error(`unknown action ${actionId} on ${workflow.id}`);
      }
      return {
        id: `${workflow.id}.step-${index + 1}`,
        order: index + 1,
        actionId: action.id,
        actionKind: action.kind,
        operationId: action.operationId,
        title: action.name,
        detail: `${action.description} → ${action.effect}`,
        readOnly: true,
      };
    },
  );

  const narrative = [
    `${workflow.name} plans ${steps.length} steps for goal "${workflow.goal}"`,
    `(${steps.map((s) => s.actionKind).join(" → ")})`,
  ].join(" ");

  return {
    workflowId: workflow.id,
    goalKind: workflow.goalKind,
    goal: workflow.goal,
    stepCount: steps.length,
    steps: Object.freeze([...steps]) as WorkflowPlanStep[],
    narrative,
    readOnly: true,
  };
}
