/** V80 CODE P3 — workflow retry / idempotency / recovery */
import type { V80WorkflowJob, V80WorkflowStepState } from "../runtime/types";
import { V80RuntimeError } from "../runtime/errors";

const MAX_STEP_RETRIES = 3;
const BASE_BACKOFF_MS = 200;

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runStepWithRetry<T>(
  fn: () => Promise<T>,
  opts?: { maxRetries?: number },
): Promise<T> {
  const max = opts?.maxRetries ?? MAX_STEP_RETRIES;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= max; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt >= max) break;
      await sleep(Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), 4000));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export function resolveWorkflowExecution(job: V80WorkflowJob): {
  action: "run" | "return" | "resume" | "conflict";
  job: V80WorkflowJob;
} {
  if (job.status === "completed") {
    return { action: "return", job };
  }
  if (job.status === "running") {
    throw new V80RuntimeError("Workflow already in progress", "WORKFLOW_IN_PROGRESS", 409);
  }
  if (job.status === "failed") {
    const resumed = resumeFailedJob(job);
    return { action: "resume", job: resumed };
  }
  return { action: "run", job };
}

export function resumeFailedJob(job: V80WorkflowJob): V80WorkflowJob {
  const steps = job.steps.map((s) => {
    if (s.status === "failed") {
      return { ...s, status: "pending" as const, error: undefined };
    }
    return s;
  });
  return {
    ...job,
    status: "running",
    steps,
    updatedAt: new Date(),
  };
}

export function firstRunnableStepIndex(steps: V80WorkflowStepState[]) {
  const idx = steps.findIndex((s) => s.status !== "completed");
  return idx === -1 ? steps.length : idx;
}

export async function persistJobProgress(
  job: V80WorkflowJob,
  save: (j: V80WorkflowJob) => Promise<void>,
) {
  job.updatedAt = new Date();
  await save(job);
}
