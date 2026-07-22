/**
 * Post-Launch P6 — Customer Support Workflow
 */

import { SUPPORT_WORKFLOW_STEPS } from "./support.constants";
import {
  getEnterpriseSupportCase,
  setEnterpriseSupportCaseStatus,
} from "./support.case";
import type {
  CustomerSupportWorkflow,
  StartCustomerSupportWorkflowInput,
  SupportStepRecord,
  SupportWorkflowStep,
} from "./support.types";

const workflows = new Map<string, CustomerSupportWorkflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(
  workflow: CustomerSupportWorkflow,
): CustomerSupportWorkflow {
  return {
    ...workflow,
    steps: workflow.steps.map((s) => ({ ...s })),
  };
}

function initialSteps(): SupportStepRecord[] {
  return SUPPORT_WORKFLOW_STEPS.map((step) => ({
    step,
    status: "PENDING" as const,
    detail: "pending",
  }));
}

function setStep(
  workflow: CustomerSupportWorkflow,
  step: SupportWorkflowStep,
  status: SupportStepRecord["status"],
  detail: string,
): void {
  const record = workflow.steps.find((s) => s.step === step);
  if (!record) throw new Error(`support workflow step missing: ${step}`);
  record.status = status;
  record.detail = detail;
  if (status === "COMPLETED" || status === "FAILED" || status === "SKIPPED") {
    record.completedAt = nowIso();
  }
  workflow.currentStep = step;
  workflow.updatedAt = nowIso();
}

export function startCustomerSupportWorkflow(
  input: StartCustomerSupportWorkflowInput,
): CustomerSupportWorkflow {
  const supportCaseId = input.supportCaseId.trim();
  const supportCase = getEnterpriseSupportCase(supportCaseId);
  if (!supportCase) {
    throw new Error(`enterprise support case not found: ${supportCaseId}`);
  }

  const id = input.id?.trim() || createId("cswf");
  if (workflows.has(id)) {
    throw new Error(`customer support workflow already exists: ${id}`);
  }

  const workflow: CustomerSupportWorkflow = {
    id,
    supportCaseId,
    steps: initialSteps(),
    complete: false,
    failed: false,
    updatedAt: nowIso(),
  };

  try {
    setStep(workflow, "INTAKE", "RUNNING", "intaking");
    setStep(workflow, "INTAKE", "COMPLETED", `intake ${supportCase.id}`);

    setStep(workflow, "TRIAGE", "RUNNING", "triaging");
    setEnterpriseSupportCaseStatus(
      supportCase.id,
      "IN_PROGRESS",
      "triage started",
    );
    setStep(
      workflow,
      "TRIAGE",
      "COMPLETED",
      `priority=${supportCase.priority}`,
    );

    setStep(workflow, "INVESTIGATE", "RUNNING", "investigating");
    setStep(
      workflow,
      "INVESTIGATE",
      "COMPLETED",
      supportCase.knowledgeArticleId
        ? `kb=${supportCase.knowledgeArticleId}`
        : "investigation complete",
    );

    setStep(workflow, "RESPOND", "RUNNING", "responding");
    setStep(workflow, "RESPOND", "COMPLETED", "customer responded");

    setStep(workflow, "RESOLVE", "RUNNING", "resolving");
    setEnterpriseSupportCaseStatus(
      supportCase.id,
      "RESOLVED",
      "workflow resolved",
    );
    setStep(workflow, "RESOLVE", "COMPLETED", "case resolved");

    setStep(workflow, "CLOSE", "RUNNING", "closing");
    setEnterpriseSupportCaseStatus(supportCase.id, "CLOSED", "workflow closed");
    setStep(workflow, "CLOSE", "COMPLETED", "case closed");

    workflow.complete = true;
    workflow.failed = false;
    workflow.updatedAt = nowIso();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "support workflow failed";
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

export function getCustomerSupportWorkflow(
  id: string,
): CustomerSupportWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listCustomerSupportWorkflows(filter?: {
  supportCaseId?: string;
}): CustomerSupportWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.supportCaseId) {
    const cid = filter.supportCaseId.trim();
    result = result.filter((w) => w.supportCaseId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearCustomerSupportWorkflows(): void {
  workflows.clear();
}
