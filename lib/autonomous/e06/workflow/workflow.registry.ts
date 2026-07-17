/**
 * E06-P3 — Autonomous Workflow Registry
 * Workflows bind ordered E06 action sequences to goals
 */

import { getActionById } from "../action/action.registry";
import {
  E06_WORKFLOW_AGENT_ID,
  E06_WORKFLOW_BASE,
  E06_WORKFLOW_FREEZE_VERSION,
  E06_WORKFLOW_VERSION,
  WORKFLOW_GOAL_KINDS,
} from "./workflow.constants";
import type {
  WorkflowDefinition,
  WorkflowGoalKind,
  WorkflowRegistryManifest,
} from "./workflow.types";

export const WORKFLOW_CATALOG: WorkflowDefinition[] = [
  {
    id: "e06.workflow.enterprise-response",
    name: "Enterprise Response Workflow",
    goalKind: "respond",
    goal: "Respond to enterprise opportunity end-to-end",
    description:
      "Observe opportunity, dispatch pricing, verify compliance, orchestrate synthesis",
    actionIds: [
      "e06.action.notify-opportunity",
      "e06.action.dispatch-pricing",
      "e06.action.verify-compliance",
      "e06.action.orchestrate-synthesis",
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.workflow.risk-guard",
    name: "Risk Guard Workflow",
    goalKind: "guard",
    goal: "Guard business posture against risk anomalies",
    description: "Observe opportunity, adjust risk posture, verify compliance",
    actionIds: [
      "e06.action.notify-opportunity",
      "e06.action.adjust-risk",
      "e06.action.verify-compliance",
    ],
    optional: false,
    readOnly: true,
  },
  {
    id: "e06.workflow.delivery-escalation",
    name: "Delivery Escalation Workflow",
    goalKind: "escalate",
    goal: "Escalate delivery posture with synthesis coordination",
    description:
      "Adjust risk posture, report delivery escalation, orchestrate synthesis",
    actionIds: [
      "e06.action.adjust-risk",
      "e06.action.report-delivery",
      "e06.action.orchestrate-synthesis",
    ],
    optional: false,
    readOnly: true,
  },
];

export function assertWorkflowDefinition(workflow: WorkflowDefinition): void {
  if (!workflow.id.trim()) throw new Error("workflow.id is required");
  if (!workflow.name.trim()) throw new Error("workflow.name is required");
  if (!workflow.goal.trim()) throw new Error("workflow.goal is required");
  if (!(WORKFLOW_GOAL_KINDS as readonly string[]).includes(workflow.goalKind)) {
    throw new Error(`invalid goal kind: ${workflow.goalKind}`);
  }
  if (workflow.readOnly !== true) throw new Error("readOnly must be true");
  if (workflow.actionIds.length === 0) {
    throw new Error(`workflow ${workflow.id} requires actions`);
  }

  for (const actionId of workflow.actionIds) {
    if (!getActionById(actionId)) {
      throw new Error(`unknown action ${actionId} on ${workflow.id}`);
    }
  }
}

export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return WORKFLOW_CATALOG.find((w) => w.id === id);
}

export function getWorkflowByGoalKind(
  goalKind: WorkflowGoalKind,
): WorkflowDefinition | undefined {
  return WORKFLOW_CATALOG.find((w) => w.goalKind === goalKind);
}

export function buildWorkflowRegistryManifest(
  workflows: WorkflowDefinition[] = WORKFLOW_CATALOG,
): WorkflowRegistryManifest {
  for (const workflow of workflows) {
    assertWorkflowDefinition(workflow);
  }

  const goalKinds = [...new Set(workflows.map((w) => w.goalKind))];
  const catalogComplete = WORKFLOW_GOAL_KINDS.every((k) =>
    goalKinds.includes(k),
  );
  if (!catalogComplete) {
    throw new Error("Workflow catalog incomplete: missing goal kinds");
  }

  return {
    agentId: E06_WORKFLOW_AGENT_ID,
    version: E06_WORKFLOW_VERSION,
    freezeVersion: E06_WORKFLOW_FREEZE_VERSION,
    base: E06_WORKFLOW_BASE,
    workflowCount: workflows.length,
    goalKinds,
    workflows,
    catalogComplete: true,
    readOnly: true,
  };
}
