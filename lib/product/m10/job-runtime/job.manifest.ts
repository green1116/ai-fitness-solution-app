/**
 * Product M10 — AI Job Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_RUNTIME_FOUNDATION_ID } from "../foundation/runtime.constants";
import {
  clearAiJobCapabilityBindings,
  listAiJobCapabilityBindings,
} from "./binding.registry";
import {
  PRODUCT_AI_JOB_RUNTIME_BASE,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_JOB_RUNTIME_ID,
  PRODUCT_AI_JOB_RUNTIME_VERSION,
} from "./job.constants";
import { getAiJobRuntimeMetadata } from "./job.metadata";
import { clearAiJobs, listAiJobs } from "./job.registry";
import type {
  AiJobReadinessCheck,
  AiJobReadinessResult,
  AiJobRuntimeManifest,
} from "./job.types";
import { clearAiJobSteps, listAiJobSteps } from "./step.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiJobReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiJobRuntimeLayer(): void {
  clearAiJobCapabilityBindings();
  clearAiJobSteps();
  clearAiJobs();
}

export function buildAiJobRuntimeManifest(): AiJobRuntimeManifest {
  const jobs = listAiJobs();
  const steps = listAiJobSteps();
  const bindings = listAiJobCapabilityBindings();
  const metadata = getAiJobRuntimeMetadata();

  const payload = {
    jobRuntimeId: PRODUCT_AI_JOB_RUNTIME_ID,
    version: PRODUCT_AI_JOB_RUNTIME_VERSION,
    freezeVersion: PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
    base: PRODUCT_AI_JOB_RUNTIME_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    jobs: jobs.map((j) => ({
      jobKey: j.jobKey,
      kind: j.kind,
      status: j.status,
    })),
    steps: steps.map((s) => ({
      stepKey: s.stepKey,
      sequence: s.sequence,
      status: s.status,
      jobId: s.jobId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      capabilityKeyRef: b.capabilityKeyRef,
      status: b.status,
      jobId: b.jobId,
    })),
  };

  return {
    jobRuntimeId: PRODUCT_AI_JOB_RUNTIME_ID,
    version: PRODUCT_AI_JOB_RUNTIME_VERSION,
    freezeVersion: PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
    base: PRODUCT_AI_JOB_RUNTIME_BASE,
    jobCount: jobs.length,
    stepCount: steps.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiJobRuntimeReadiness(): AiJobReadinessResult {
  const checks: AiJobReadinessCheck[] = [];
  const metadata = getAiJobRuntimeMetadata();
  const jobs = listAiJobs();
  const steps = listAiJobSteps();
  const bindings = listAiJobCapabilityBindings();
  const manifest = buildAiJobRuntimeManifest();

  checks.push(
    check(
      "AIJOB-BASE",
      "job-runtime",
      "ai runtime foundation base aligned",
      PRODUCT_AI_JOB_RUNTIME_BASE === PRODUCT_AI_RUNTIME_FOUNDATION_ID &&
        PRODUCT_AI_RUNTIME_FOUNDATION_ID ===
          "enterprise-product-ai-runtime-foundation-v1",
      `base=${PRODUCT_AI_JOB_RUNTIME_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIJOB-META",
      "metadata",
      "Job runtime metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIJOB-REG",
      "job",
      "Active job definitions present",
      jobs.some((j) => j.status === "ACTIVE"),
      `jobs=${jobs.length}`,
    ),
  );

  checks.push(
    check(
      "AIJOB-STEP",
      "step",
      "Declared job steps present",
      steps.some((s) => s.status === "DECLARED"),
      `steps=${steps.length}`,
    ),
  );

  checks.push(
    check(
      "AIJOB-BIND",
      "binding",
      "Bound runtime capability refs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AIJOB-MAN",
      "manifest",
      "Job runtime manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.jobRuntimeId === PRODUCT_AI_JOB_RUNTIME_ID &&
        manifest.jobCount >= 1 &&
        manifest.stepCount >= 1 &&
        manifest.bindingCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-ai-job-runtime readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiJobRuntimeReadinessReady(
  result: AiJobReadinessResult,
): asserts result is AiJobReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product ai job runtime not ready: ${result.summary}`);
  }
}
