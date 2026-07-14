/**
 * E04-P2 — Business Workflow Registry
 * Definitions bind steps onto E04 business agents
 */

import { getBusinessAgentById } from "../core/business-agent.registry";
import { getCapabilityById } from "../capability/capability.registry";
import {
  E04_WORKFLOW_BASE,
  E04_WORKFLOW_FREEZE_VERSION,
  E04_WORKFLOW_RUNTIME_ID,
  E04_WORKFLOW_VERSION,
} from "./workflow.constants";
import type {
  WorkflowDefinition,
  WorkflowRegistryManifest,
  WorkflowStepDefinition,
} from "./workflow.types";

export const WORKFLOW_CATALOG: WorkflowDefinition[] = [
  {
    id: "e04.workflow.tender-response",
    name: "Tender Response Workflow",
    description: "Intake → estimate → price → propose → review → deliver",
    optional: false,
    readOnly: true,
    steps: [
      {
        id: "step.intake",
        name: "Intake",
        description: "Normalize tender intake",
        businessAgentId: "e04.business.tender",
        capabilityId: "e04.cap.intake",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
      {
        id: "step.estimate",
        name: "Estimate",
        description: "Equipment scope estimate",
        businessAgentId: "e04.business.equipment",
        capabilityId: "e04.cap.estimate",
        dependsOn: ["step.intake"],
        optional: false,
        readOnly: true,
      },
      {
        id: "step.price",
        name: "Price",
        description: "Budget/pricing alignment",
        businessAgentId: "e04.business.budget",
        capabilityId: "e04.cap.price",
        dependsOn: ["step.estimate"],
        optional: false,
        readOnly: true,
      },
      {
        id: "step.propose",
        name: "Propose",
        description: "Compose proposal outline",
        businessAgentId: "e04.business.tender",
        capabilityId: "e04.cap.propose",
        dependsOn: ["step.price"],
        optional: false,
        readOnly: true,
      },
      {
        id: "step.review",
        name: "Review",
        description: "Compliance review gate",
        businessAgentId: "e04.business.compliance",
        capabilityId: "e04.cap.review",
        dependsOn: ["step.propose"],
        optional: false,
        readOnly: true,
      },
      {
        id: "step.deliver",
        name: "Deliver",
        description: "Package delivery commitments",
        businessAgentId: "e04.business.delivery",
        capabilityId: "e04.cap.deliver",
        dependsOn: ["step.review"],
        optional: false,
        readOnly: true,
      },
    ],
  },
  {
    id: "e04.workflow.quick-intake",
    name: "Quick Intake Workflow",
    description: "Minimal intake → review path",
    optional: true,
    readOnly: true,
    steps: [
      {
        id: "step.intake",
        name: "Intake",
        description: "Quick intake",
        businessAgentId: "e04.business.tender",
        capabilityId: "e04.cap.intake",
        dependsOn: [],
        optional: false,
        readOnly: true,
      },
      {
        id: "step.review",
        name: "Review",
        description: "Quick review",
        businessAgentId: "e04.business.compliance",
        capabilityId: "e04.cap.review",
        dependsOn: ["step.intake"],
        optional: false,
        readOnly: true,
      },
    ],
  },
];

function assertStep(step: WorkflowStepDefinition): void {
  if (!step.id.trim()) throw new Error("workflow step.id is required");
  if (!step.name.trim()) throw new Error("workflow step.name is required");
  if (step.readOnly !== true) throw new Error("step.readOnly must be true");

  const agent = getBusinessAgentById(step.businessAgentId);
  if (!agent) {
    throw new Error(`unknown business agent: ${step.businessAgentId}`);
  }

  if (step.capabilityId) {
    if (!getCapabilityById(step.capabilityId)) {
      throw new Error(`unknown capability: ${step.capabilityId}`);
    }
    if (!agent.capabilityIds.includes(step.capabilityId)) {
      throw new Error(
        `capability ${step.capabilityId} not owned by ${agent.id}`,
      );
    }
  }
}

export function isWorkflowStepGraphValid(
  steps: WorkflowStepDefinition[],
): boolean {
  const ids = new Set(steps.map((s) => s.id));
  for (const step of steps) {
    for (const dep of step.dependsOn) {
      if (!ids.has(dep)) return false;
    }
  }
  return true;
}

export function assertWorkflowDefinition(workflow: WorkflowDefinition): void {
  if (!workflow.id.trim()) throw new Error("workflow.id is required");
  if (!workflow.name.trim()) throw new Error("workflow.name is required");
  if (workflow.readOnly !== true) throw new Error("readOnly must be true");
  if (workflow.steps.length === 0) {
    throw new Error(`workflow ${workflow.id} has no steps`);
  }
  for (const step of workflow.steps) {
    assertStep(step);
  }
  if (!isWorkflowStepGraphValid(workflow.steps)) {
    throw new Error(`invalid step graph: ${workflow.id}`);
  }
}

export function buildWorkflowRegistryManifest(
  workflows: WorkflowDefinition[] = WORKFLOW_CATALOG,
): WorkflowRegistryManifest {
  for (const workflow of workflows) {
    assertWorkflowDefinition(workflow);
  }

  const required = workflows.some((w) => !w.optional);
  if (!required) {
    throw new Error("workflow catalog missing required workflow");
  }

  return {
    runtimeId: E04_WORKFLOW_RUNTIME_ID,
    version: E04_WORKFLOW_VERSION,
    freezeVersion: E04_WORKFLOW_FREEZE_VERSION,
    base: E04_WORKFLOW_BASE,
    workflowCount: workflows.length,
    workflows,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return WORKFLOW_CATALOG.find((w) => w.id === id);
}

export function listRequiredWorkflows(): WorkflowDefinition[] {
  return WORKFLOW_CATALOG.filter((w) => !w.optional);
}
