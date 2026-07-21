/**
 * Launch P3 — Demo Scenario Workflow
 */

import { DEMO_SCENARIO_STEPS } from "./demo.constants";
import {
  getSampleDataProfile,
  seedSampleDataProfile,
} from "./demo.sample";
import { captureDemoSnapshot } from "./demo.snapshot";
import { getDemoTenant, updateDemoTenant } from "./demo.tenant";
import type {
  DemoScenarioStep,
  DemoScenarioStepRecord,
  DemoScenarioWorkflow,
  StartDemoScenarioInput,
} from "./demo.types";

const workflows = new Map<string, DemoScenarioWorkflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(workflow: DemoScenarioWorkflow): DemoScenarioWorkflow {
  return {
    ...workflow,
    steps: workflow.steps.map((s) => ({ ...s })),
  };
}

function initialSteps(): DemoScenarioStepRecord[] {
  return DEMO_SCENARIO_STEPS.map((step) => ({
    step,
    status: "PENDING",
    detail: "pending",
  }));
}

function markStep(
  workflow: DemoScenarioWorkflow,
  step: DemoScenarioStep,
  status: DemoScenarioStepRecord["status"],
  detail: string,
): void {
  const record = workflow.steps.find((s) => s.step === step);
  if (!record) return;
  record.status = status;
  record.detail = detail;
  if (status === "COMPLETED" || status === "FAILED") {
    record.completedAt = nowIso();
  }
  workflow.currentStep = step;
  workflow.updatedAt = nowIso();
  workflow.complete = workflow.steps.every((s) => s.status === "COMPLETED");
  workflow.failed = workflow.steps.some((s) => s.status === "FAILED");
}

export function startDemoScenario(
  input: StartDemoScenarioInput,
): DemoScenarioWorkflow {
  const demoTenantId = input.demoTenantId.trim();
  const sampleDataProfileId = input.sampleDataProfileId.trim();

  const tenant = getDemoTenant(demoTenantId);
  if (!tenant) throw new Error(`demo tenant not found: ${demoTenantId}`);
  if (!tenant.demoWorkspaceId) {
    throw new Error(`demo workspace required for tenant: ${demoTenantId}`);
  }

  const sample = getSampleDataProfile(sampleDataProfileId);
  if (!sample || sample.demoTenantId !== demoTenantId) {
    throw new Error(`sample data profile not found: ${sampleDataProfileId}`);
  }

  const id = input.id?.trim() || createId("demoscenario");
  if (workflows.has(id)) {
    throw new Error(`demo scenario already exists: ${id}`);
  }

  const workflow: DemoScenarioWorkflow = {
    id,
    demoTenantId,
    sampleDataProfileId,
    steps: initialSteps(),
    complete: false,
    failed: false,
    updatedAt: nowIso(),
  };
  workflows.set(id, workflow);

  try {
    markStep(workflow, "SEED_SAMPLE_DATA", "RUNNING", "seeding sample data");
    seedSampleDataProfile(sampleDataProfileId);
    markStep(
      workflow,
      "SEED_SAMPLE_DATA",
      "COMPLETED",
      `seeded=${sampleDataProfileId}`,
    );

    markStep(workflow, "RUN_WORKFLOW", "RUNNING", "running demo workflow");
    markStep(
      workflow,
      "RUN_WORKFLOW",
      "COMPLETED",
      "demo workflow executed",
    );

    markStep(workflow, "CAPTURE_SNAPSHOT", "RUNNING", "capturing snapshot");
    const snapshot = captureDemoSnapshot({
      id: `${id}.snapshot`,
      demoTenantId,
      sampleDataProfileId,
    });
    markStep(
      workflow,
      "CAPTURE_SNAPSHOT",
      "COMPLETED",
      `snapshot=${snapshot.id}`,
    );

    markStep(workflow, "VALIDATE_DEMO", "RUNNING", "validating demo");
    if (!getSampleDataProfile(sampleDataProfileId)?.seeded) {
      throw new Error("sample data not seeded after scenario");
    }
    markStep(workflow, "VALIDATE_DEMO", "COMPLETED", "demo validated");

    updateDemoTenant(demoTenantId, { status: "ACTIVE" });
    workflows.set(id, workflow);
    return cloneWorkflow(workflow);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "demo scenario failed";
    if (workflow.currentStep) {
      markStep(workflow, workflow.currentStep, "FAILED", detail);
    }
    workflows.set(id, workflow);
    throw error;
  }
}

export function getDemoScenarioWorkflow(
  id: string,
): DemoScenarioWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listDemoScenarioWorkflows(filter?: {
  demoTenantId?: string;
}): DemoScenarioWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.demoTenantId) {
    const tid = filter.demoTenantId.trim();
    result = result.filter((w) => w.demoTenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneWorkflow);
}

export function clearDemoScenarioWorkflows(): void {
  workflows.clear();
}
