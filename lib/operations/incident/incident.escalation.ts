/**
 * Post-Launch P3 — Escalation Workflow
 */

import { advanceSupportIncident } from "../../launch/support/support.incident";
import { ESCALATION_WORKFLOW_STEPS } from "./incident.constants";
import {
  getOperationsIncident,
  setOperationsIncidentStatus,
} from "./incident.model";
import type {
  EscalationStepRecord,
  EscalationWorkflow,
  EscalationWorkflowStep,
  StartEscalationWorkflowInput,
} from "./incident.types";

const workflows = new Map<string, EscalationWorkflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(workflow: EscalationWorkflow): EscalationWorkflow {
  return {
    ...workflow,
    steps: workflow.steps.map((s) => ({ ...s })),
  };
}

function initialSteps(): EscalationStepRecord[] {
  return ESCALATION_WORKFLOW_STEPS.map((step) => ({
    step,
    status: "PENDING" as const,
    detail: "pending",
  }));
}

function setStep(
  workflow: EscalationWorkflow,
  step: EscalationWorkflowStep,
  status: EscalationStepRecord["status"],
  detail: string,
): void {
  const record = workflow.steps.find((s) => s.step === step);
  if (!record) throw new Error(`escalation step missing: ${step}`);
  record.status = status;
  record.detail = detail;
  if (status === "COMPLETED" || status === "FAILED" || status === "SKIPPED") {
    record.completedAt = nowIso();
  }
  workflow.currentStep = step;
  workflow.updatedAt = nowIso();
}

export function startEscalationWorkflow(
  input: StartEscalationWorkflowInput,
): EscalationWorkflow {
  const operationsIncidentId = input.operationsIncidentId.trim();
  const incident = getOperationsIncident(operationsIncidentId);
  if (!incident) {
    throw new Error(`operations incident not found: ${operationsIncidentId}`);
  }

  const id = input.id?.trim() || createId("escalation");
  if (workflows.has(id)) {
    throw new Error(`escalation workflow already exists: ${id}`);
  }

  const workflow: EscalationWorkflow = {
    id,
    operationsIncidentId,
    steps: initialSteps(),
    complete: false,
    failed: false,
    updatedAt: nowIso(),
  };

  try {
    setStep(workflow, "DETECT", "RUNNING", "detecting");
    setStep(
      workflow,
      "DETECT",
      "COMPLETED",
      `detected ${incident.id}`,
    );

    setStep(workflow, "CLASSIFY", "RUNNING", "classifying");
    setStep(
      workflow,
      "CLASSIFY",
      "COMPLETED",
      `severity=${incident.severity}`,
    );

    setStep(workflow, "TRIAGE", "RUNNING", "triaging");
    setOperationsIncidentStatus(incident.id, "ACKNOWLEDGED", "triage ack");
    if (incident.supportIncidentId) {
      advanceSupportIncident({
        incidentId: incident.supportIncidentId,
        detail: "ops triage acknowledge",
      });
    }
    setStep(workflow, "TRIAGE", "COMPLETED", "acknowledged");

    setStep(workflow, "ESCALATE", "RUNNING", "escalating");
    setOperationsIncidentStatus(incident.id, "ESCALATED", "escalated");
    setStep(
      workflow,
      "ESCALATE",
      "COMPLETED",
      `escalated severity=${incident.severity}`,
    );

    setStep(workflow, "CONTAIN", "RUNNING", "containing");
    setOperationsIncidentStatus(incident.id, "IN_PROGRESS", "containment");
    if (incident.supportIncidentId) {
      const support = advanceSupportIncident({
        incidentId: incident.supportIncidentId,
        detail: "ops containment",
      });
      // ensure support moves toward IN_PROGRESS if still ACKNOWLEDGED path advanced once
      if (support.status === "ACKNOWLEDGED") {
        advanceSupportIncident({
          incidentId: incident.supportIncidentId,
          detail: "ops investigation",
        });
      }
    }
    setStep(workflow, "CONTAIN", "COMPLETED", "contained");

    setStep(workflow, "RESOLVE", "RUNNING", "resolving-prep");
    setStep(workflow, "RESOLVE", "COMPLETED", "ready for resolution tracking");

    setStep(workflow, "REVIEW", "RUNNING", "reviewing");
    setStep(workflow, "REVIEW", "COMPLETED", "escalation reviewed");

    workflow.complete = true;
    workflow.failed = false;
    workflow.updatedAt = nowIso();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "escalation workflow failed";
    if (workflow.currentStep) {
      setStep(workflow, workflow.currentStep, "FAILED", detail);
    }
    workflow.complete = false;
    workflow.failed = true;
    workflow.updatedAt = nowIso();
    workflows.set(id, workflow);
    throw error;
  }

  workflows.set(id, workflow);
  return cloneWorkflow(workflow);
}

export function getEscalationWorkflow(
  id: string,
): EscalationWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listEscalationWorkflows(filter?: {
  operationsIncidentId?: string;
}): EscalationWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.operationsIncidentId) {
    const iid = filter.operationsIncidentId.trim();
    result = result.filter((w) => w.operationsIncidentId === iid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearEscalationWorkflows(): void {
  workflows.clear();
}
