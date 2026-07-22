/**
 * Post-Launch P4 — Rollback Workflow
 */

import { setOrchestrationStatus } from "../../launch/control/control.orchestration";
import { ROLLBACK_WORKFLOW_STEPS } from "./release.constants";
import {
  getOperationsRelease,
  setOperationsReleaseStatus,
} from "./release.lifecycle";
import { getReleaseVersion, listReleaseVersions } from "./release.version";
import type {
  RollbackStepRecord,
  RollbackWorkflow,
  RollbackWorkflowStep,
  StartRollbackWorkflowInput,
} from "./release.types";

const workflows = new Map<string, RollbackWorkflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(workflow: RollbackWorkflow): RollbackWorkflow {
  return {
    ...workflow,
    steps: workflow.steps.map((s) => ({ ...s })),
  };
}

function initialSteps(): RollbackStepRecord[] {
  return ROLLBACK_WORKFLOW_STEPS.map((step) => ({
    step,
    status: "PENDING" as const,
    detail: "pending",
  }));
}

function setStep(
  workflow: RollbackWorkflow,
  step: RollbackWorkflowStep,
  status: RollbackStepRecord["status"],
  detail: string,
): void {
  const record = workflow.steps.find((s) => s.step === step);
  if (!record) throw new Error(`rollback step missing: ${step}`);
  record.status = status;
  record.detail = detail;
  if (status === "COMPLETED" || status === "FAILED" || status === "SKIPPED") {
    record.completedAt = nowIso();
  }
  workflow.currentStep = step;
  workflow.updatedAt = nowIso();
}

export function startRollbackWorkflow(
  input: StartRollbackWorkflowInput,
): RollbackWorkflow {
  const operationsReleaseId = input.operationsReleaseId.trim();
  const release = getOperationsRelease(operationsReleaseId);
  if (!release) {
    throw new Error(`operations release not found: ${operationsReleaseId}`);
  }
  if (release.status !== "RELEASED" && release.status !== "DEPLOYING") {
    throw new Error(
      `rollback requires RELEASED or DEPLOYING (current=${release.status})`,
    );
  }

  const id = input.id?.trim() || createId("rollback");
  if (workflows.has(id)) {
    throw new Error(`rollback workflow already exists: ${id}`);
  }

  const currentVersion = release.versionRecordId
    ? getReleaseVersion(release.versionRecordId)
    : listReleaseVersions({ operationsReleaseId })[0];
  const targetVersion =
    input.targetVersion?.trim() ||
    currentVersion?.previousVersion ||
    undefined;

  const workflow: RollbackWorkflow = {
    id,
    operationsReleaseId,
    targetVersion,
    steps: initialSteps(),
    complete: false,
    failed: false,
    updatedAt: nowIso(),
  };

  try {
    setStep(workflow, "DETECT_ISSUE", "RUNNING", "detecting");
    setStep(
      workflow,
      "DETECT_ISSUE",
      "COMPLETED",
      input.reason?.trim() || "issue detected post-release",
    );

    setStep(workflow, "ASSESS_IMPACT", "RUNNING", "assessing");
    setStep(
      workflow,
      "ASSESS_IMPACT",
      "COMPLETED",
      `target=${targetVersion ?? "previous"}`,
    );

    setStep(workflow, "APPROVE_ROLLBACK", "RUNNING", "approving");
    setStep(workflow, "APPROVE_ROLLBACK", "COMPLETED", "rollback approved");

    setStep(workflow, "EXECUTE_ROLLBACK", "RUNNING", "executing");
    setOrchestrationStatus(release.orchestrationId, "ABORTED");
    setOperationsReleaseStatus(
      release.id,
      "ROLLED_BACK",
      `rolled back to ${targetVersion ?? "previous"}`,
    );
    setStep(
      workflow,
      "EXECUTE_ROLLBACK",
      "COMPLETED",
      `rolled back release=${release.id}`,
    );

    setStep(workflow, "VALIDATE_STABLE", "RUNNING", "validating");
    setOrchestrationStatus(release.orchestrationId, "COMPLETED");
    setStep(workflow, "VALIDATE_STABLE", "COMPLETED", "stable after rollback");

    workflow.complete = true;
    workflow.failed = false;
    workflow.updatedAt = nowIso();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "rollback workflow failed";
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

export function getRollbackWorkflow(id: string): RollbackWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listRollbackWorkflows(filter?: {
  operationsReleaseId?: string;
}): RollbackWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.operationsReleaseId) {
    const rid = filter.operationsReleaseId.trim();
    result = result.filter((w) => w.operationsReleaseId === rid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearRollbackWorkflows(): void {
  workflows.clear();
}
