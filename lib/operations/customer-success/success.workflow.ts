/**
 * Post-Launch P2 — Success Workflow
 */

import { SUCCESS_WORKFLOW_STEPS } from "./success.constants";
import { getLatestAdoption, recordAdoption } from "./success.adoption";
import {
  getCustomerHealthProfile,
  reassessCustomerHealth,
} from "./success.health";
import { runLifecycleOperation } from "./success.lifecycle";
import type {
  StartSuccessWorkflowInput,
  SuccessStepRecord,
  SuccessWorkflow,
  SuccessWorkflowStep,
} from "./success.types";

const workflows = new Map<string, SuccessWorkflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(workflow: SuccessWorkflow): SuccessWorkflow {
  return {
    ...workflow,
    steps: workflow.steps.map((s) => ({ ...s })),
  };
}

function initialSteps(): SuccessStepRecord[] {
  return SUCCESS_WORKFLOW_STEPS.map((step) => ({
    step,
    status: "PENDING" as const,
    detail: "pending",
  }));
}

function setStep(
  workflow: SuccessWorkflow,
  step: SuccessWorkflowStep,
  status: SuccessStepRecord["status"],
  detail: string,
): void {
  const record = workflow.steps.find((s) => s.step === step);
  if (!record) throw new Error(`workflow step missing: ${step}`);
  record.status = status;
  record.detail = detail;
  if (status === "COMPLETED" || status === "FAILED" || status === "SKIPPED") {
    record.completedAt = nowIso();
  }
  workflow.currentStep = step;
  workflow.updatedAt = nowIso();
}

export function startSuccessWorkflow(
  input: StartSuccessWorkflowInput,
): SuccessWorkflow {
  const customerHealthProfileId = input.customerHealthProfileId.trim();
  const profile = getCustomerHealthProfile(customerHealthProfileId);
  if (!profile) {
    throw new Error(
      `customer health profile not found: ${customerHealthProfileId}`,
    );
  }

  const id = input.id?.trim() || createId("cswf");
  if (workflows.has(id)) {
    throw new Error(`success workflow already exists: ${id}`);
  }

  const workflow: SuccessWorkflow = {
    id,
    customerHealthProfileId,
    steps: initialSteps(),
    complete: false,
    failed: false,
    updatedAt: nowIso(),
  };

  try {
    // ASSESS_HEALTH
    setStep(workflow, "ASSESS_HEALTH", "RUNNING", "assessing");
    const assessed = reassessCustomerHealth(profile.id, {
      detail: "workflow health assess",
    });
    setStep(
      workflow,
      "ASSESS_HEALTH",
      "COMPLETED",
      `health=${assessed.health} score=${assessed.score}`,
    );

    // TRACK_ADOPTION
    setStep(workflow, "TRACK_ADOPTION", "RUNNING", "tracking");
    let adoption = getLatestAdoption(profile.id);
    if (!adoption) {
      adoption = recordAdoption({
        id: `${id}.adoption`,
        customerHealthProfileId: profile.id,
        stage: "ADOPTING",
        featureCount: 3,
        activeUsers: 5,
        detail: "workflow bootstrap adoption",
      });
    }
    setStep(
      workflow,
      "TRACK_ADOPTION",
      "COMPLETED",
      `stage=${adoption.stage} users=${adoption.activeUsers}`,
    );

    // ENGAGE
    setStep(workflow, "ENGAGE", "RUNNING", "engaging");
    const afterEngage = reassessCustomerHealth(profile.id, {
      score: Math.min(100, getCustomerHealthProfile(profile.id)!.score + 5),
      detail: "engagement touch",
    });
    setStep(
      workflow,
      "ENGAGE",
      "COMPLETED",
      `engaged score=${afterEngage.score}`,
    );

    // OPERATE_LIFECYCLE
    setStep(workflow, "OPERATE_LIFECYCLE", "RUNNING", "lifecycle");
    const target = input.targetLifecycleStage ?? "ACTIVE";
    const lifecycle = runLifecycleOperation({
      id: `${id}.lifecycle`,
      customerHealthProfileId: profile.id,
      stage: target,
      reason: `success-workflow:${target}`,
    });
    setStep(
      workflow,
      "OPERATE_LIFECYCLE",
      "COMPLETED",
      `stage=${lifecycle.stage}`,
    );

    // VALIDATE_SUCCESS
    setStep(workflow, "VALIDATE_SUCCESS", "RUNNING", "validating");
    const finalHealth = getCustomerHealthProfile(profile.id)!;
    if (finalHealth.score < 50 && target === "ACTIVE") {
      throw new Error(
        `success validation failed: score=${finalHealth.score}`,
      );
    }
    setStep(
      workflow,
      "VALIDATE_SUCCESS",
      "COMPLETED",
      `validated health=${finalHealth.health}`,
    );

    workflow.complete = true;
    workflow.failed = false;
    workflow.updatedAt = nowIso();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "success workflow failed";
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

export function getSuccessWorkflow(id: string): SuccessWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listSuccessWorkflows(filter?: {
  customerHealthProfileId?: string;
}): SuccessWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.customerHealthProfileId) {
    const pid = filter.customerHealthProfileId.trim();
    result = result.filter((w) => w.customerHealthProfileId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearSuccessWorkflows(): void {
  workflows.clear();
}
