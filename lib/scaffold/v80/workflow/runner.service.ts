/** @scaffold BLP-API-004 — hardened DAG workflow executor */
import { randomUUID } from "node:crypto";

import { V80RuntimeError } from "../runtime/errors";
import { withV80Lock } from "../runtime/lock";
import { v80Persist, workflowIdempotencyKey, type V80WorkflowJob, type V80WorkflowStepState } from "../runtime/store";
import { TENDER_PACK_DAG, type TenderPackStep } from "./dag.registry";
import {
  firstRunnableStepIndex,
  persistJobProgress,
  resolveWorkflowExecution,
  runStepWithRetry,
} from "./reliability";
import { recordV80WorkflowStep } from "../ops/observability";
import { executeWorkflowStep, type StepContext } from "./steps";

export type EnqueueWorkflowInput = {
  projectId: string;
  workflowKey: "tender-pack-complete";
  deploymentId?: string;
};

function initSteps(): V80WorkflowStepState[] {
  return TENDER_PACK_DAG.map((step) => ({
    step,
    status: "pending" as const,
    attempts: 0,
  }));
}

async function runJobSteps(job: V80WorkflowJob, startIndex: number) {
  let ctx: StepContext = { projectId: job.projectId };

  for (let i = startIndex; i < job.steps.length; i++) {
    const stepState = job.steps[i]!;
    stepState.status = "running";
    stepState.attempts += 1;
    job.status = "running";
    await persistJobProgress(job, (j) => v80Persist.saveJob(j));

    const stepStarted = Date.now();
    try {
      ctx = await runStepWithRetry(() =>
        executeWorkflowStep(stepState.step as TenderPackStep, ctx),
      );
      stepState.status = "completed";
      stepState.completedAt = new Date();
      stepState.error = undefined;
      recordV80WorkflowStep({
        traceId: job.id,
        projectId: job.projectId,
        step: stepState.step,
        durationMs: Date.now() - stepStarted,
        status: "completed",
      });
    } catch (err) {
      stepState.status = "failed";
      stepState.error = err instanceof Error ? err.message : String(err);
      recordV80WorkflowStep({
        traceId: job.id,
        projectId: job.projectId,
        step: stepState.step,
        durationMs: Date.now() - stepStarted,
        status: "failed",
      });
      job.status = "failed";
      await persistJobProgress(job, (j) => v80Persist.saveJob(j));
      return { jobId: job.id, steps: job.steps, status: job.status };
    }

    await persistJobProgress(job, (j) => v80Persist.saveJob(j));
  }

  job.status = "completed";
  await persistJobProgress(job, (j) => v80Persist.saveJob(j));
  return { jobId: job.id, steps: job.steps, status: job.status };
}

export async function enqueueWorkflowJob(input: EnqueueWorkflowInput) {
  const idempotencyKey = workflowIdempotencyKey(input.projectId, input.workflowKey);

  return withV80Lock(`workflow:${input.projectId}`, async () => {
    const project = await v80Persist.getProject(input.projectId);
    if (!project) {
      throw new V80RuntimeError("Project not found", "PROJECT_NOT_FOUND", 404);
    }

    const org = await v80Persist.getOrg(project.organizationId);
    if (!org || org.plan === "BASIC") {
      throw new V80RuntimeError("Tender package not enabled", "FEATURE_GATE", 403);
    }

    let job = await v80Persist.findJobByIdempotency(idempotencyKey);
    if (job) {
      const decision = resolveWorkflowExecution(job);
      if (decision.action === "return") {
        return { jobId: job.id, steps: job.steps, status: job.status, idempotent: true as const };
      }
      job = decision.job;
      await v80Persist.saveJob(job);
    } else {
      const now = new Date();
      job = {
        id: randomUUID(),
        projectId: input.projectId,
        workflowKey: input.workflowKey,
        status: "running",
        steps: initSteps(),
        idempotencyKey,
        createdAt: now,
        updatedAt: now,
      };
      await v80Persist.saveJob(job);
    }

    await v80Persist.incrementUsage(project.organizationId, "workflow_run");

    const startAt = firstRunnableStepIndex(job.steps);
    return runJobSteps(job, startAt);
  });
}

export async function getWorkflowJob(jobId: string) {
  return v80Persist.getJob(jobId);
}
