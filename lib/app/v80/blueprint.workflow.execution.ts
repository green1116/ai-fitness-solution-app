/**
 * V80 APP P3 — Workflow execution blueprint (state machine + retry + steps)
 */
import { TENDER_PACK_WORKFLOW_DAG } from "./engineering.workflow.dag";
import type { WorkflowExecutionBlueprint } from "./blueprint.types";

export const TENDER_PACK_EXECUTION_BLUEPRINT: WorkflowExecutionBlueprint = {
  id: "BLP-WFL-001",
  dagRef: "ENG-DAG-001",
  jobModel: "PlanJob",
  initialState: "pending",
  terminalStates: ["completed", "failed"],
  steps: TENDER_PACK_WORKFLOW_DAG.nodes.map((node, i) => ({
    stepKey: node.stepKey,
    state: "pending" as const,
    maxRetries: node.stepKey.includes("pdf") ? 2 : 3,
    backoffMs: 1000 * (i + 1),
    timeoutMs: node.pdfStage ? 120_000 : 60_000,
    onFailure: node.stepKey === "enterprise-zip" ? "abort" : "retry",
    dagNodeRef: node.id,
  })),
  stateTransitions: [
    { from: "pending", to: "running", event: "job.start" },
    { from: "running", to: "completed", event: "step.success" },
    { from: "running", to: "retrying", event: "step.transient_fail" },
    { from: "retrying", to: "running", event: "retry.scheduled" },
    { from: "retrying", to: "failed", event: "retry.exhausted" },
    { from: "running", to: "failed", event: "step.fatal_fail" },
    { from: "completed", to: "running", event: "next.step" },
  ],
};

export function isWorkflowExecutionBlueprintComplete(): boolean {
  return (
    TENDER_PACK_EXECUTION_BLUEPRINT.steps.length === 8 &&
    TENDER_PACK_EXECUTION_BLUEPRINT.stateTransitions.length >= 6 &&
    TENDER_PACK_EXECUTION_BLUEPRINT.steps.every((s) => s.maxRetries >= 1)
  );
}

export function getWorkflowStepBlueprint(stepKey: string) {
  return TENDER_PACK_EXECUTION_BLUEPRINT.steps.find((s) => s.stepKey === stepKey);
}
