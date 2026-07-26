/**
 * Product M10 — AI Job Runtime Release Gate
 * MODULE: Job Runtime (M10-P2)
 * BASE: enterprise-product-ai-runtime-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AI_RUNTIME_FOUNDATION_ID } from "../foundation/runtime.constants";
import { bindAiJobCapability } from "../job-runtime/binding.registry";
import {
  AI_JOB_BINDING_STATUSES,
  AI_JOB_KINDS,
  AI_JOB_READINESS_VERDICTS,
  AI_JOB_STATUSES,
  AI_JOB_STEP_STATUSES,
  PRODUCT_AI_JOB_RUNTIME_BASE,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_JOB_RUNTIME_ID,
  PRODUCT_AI_JOB_RUNTIME_VERSION,
} from "../job-runtime/job.constants";
import {
  assertAiJobRuntimeReadinessReady,
  buildAiJobRuntimeManifest,
  clearAiJobRuntimeLayer,
  evaluateAiJobRuntimeReadiness,
} from "../job-runtime/job.manifest";
import {
  getAiJobRuntimeMetadata,
  isAiJobRuntimeMetadataIntact,
} from "../job-runtime/job.metadata";
import { registerAiJob, updateAiJobStatus } from "../job-runtime/job.registry";
import {
  registerAiJobStep,
  updateAiJobStepStatus,
} from "../job-runtime/step.registry";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_AI_JOB_RUNTIME_SIGNOFF_VERSION =
  "product-ai-job-runtime-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAiJobRuntimeLayer();
}

export function checkProductAiJobRuntimeReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiJobRuntimeMetadata();

  checks.push(
    check(
      "AIJOB-CONSTANTS",
      "job-runtime",
      "Product AI job runtime version constants",
      PRODUCT_AI_JOB_RUNTIME_ID === "enterprise-product-ai-job-runtime-v1" &&
        PRODUCT_AI_JOB_RUNTIME_VERSION === "product-ai-job-runtime-1" &&
        PRODUCT_AI_JOB_RUNTIME_BASE === PRODUCT_AI_RUNTIME_FOUNDATION_ID &&
        PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION ===
          "product-ai-job-runtime-freeze-1" &&
        PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG ===
          "product-ai-job-runtime-freeze-1" &&
        AI_JOB_KINDS.length === 4 &&
        AI_JOB_STATUSES.length === 4 &&
        AI_JOB_STEP_STATUSES.length === 4 &&
        AI_JOB_BINDING_STATUSES.length === 3 &&
        AI_JOB_READINESS_VERDICTS.length === 3 &&
        isAiJobRuntimeMetadataIntact(metadata),
      `id=${PRODUCT_AI_JOB_RUNTIME_ID} base=${PRODUCT_AI_JOB_RUNTIME_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIJOB-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIJOB-UPSTREAM",
      "compatibility",
      "Depends on AI runtime foundation chain",
      PRODUCT_AI_JOB_RUNTIME_BASE ===
        "enterprise-product-ai-runtime-foundation-v1" &&
        PRODUCT_AI_RUNTIME_FOUNDATION_ID ===
          "enterprise-product-ai-runtime-foundation-v1",
      `foundation=${PRODUCT_AI_RUNTIME_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();

    const job = registerAiJob({
      id: "aijob.gate.job",
      jobKey: "DOMAIN_BATCH_JOB",
      kind: "BATCH",
      title: "Domain batch job definition",
      summary: "Declared batch job for domain reuse",
    });
    const active = updateAiJobStatus({
      jobId: job.id,
      status: "ACTIVE",
    });
    const step = registerAiJobStep({
      id: "aijob.gate.step",
      jobId: job.id,
      stepKey: "PREPARE",
      sequence: 1,
      summary: "Declared prepare step",
    });
    const declared = updateAiJobStepStatus({
      stepId: step.id,
      status: "DECLARED",
    });
    const binding = bindAiJobCapability({
      id: "aijob.gate.bind",
      jobId: job.id,
      stepId: step.id,
      bindingKey: "DOMAIN_BATCH_TO_PLANE",
      capabilityKeyRef: "DOMAIN_RUNTIME_PLANE",
    });
    const manifest = buildAiJobRuntimeManifest();
    const readiness = evaluateAiJobRuntimeReadiness();

    const ok =
      job.jobKey === "DOMAIN_BATCH_JOB" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      binding.status === "BOUND" &&
      binding.capabilityKeyRef === "DOMAIN_RUNTIME_PLANE" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiJobRuntimeReadinessReady(readiness);
      checks.push(
        check(
          "AIJOB-STACK",
          "job-runtime",
          "Job / step / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIJOB-STACK",
          "job-runtime",
          "Job / step / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai job runtime not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIJOB-SCOPE",
        "scope",
        "No job execution / queue / scheduler / provider / model / workflow / retry",
        ok && metadata.declarationOnly === true,
        "ai-job-runtime-definition-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai job runtime probe failed";
    checks.push(
      check(
        "AIJOB-STACK",
        "job-runtime",
        "Job / step / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIJOB-SCOPE",
        "scope",
        "No job execution / queue / scheduler / provider / model / workflow / retry",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-ai-job-runtime-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiJobRuntimeReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiJobRuntimeReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI job runtime release gate failed: ${gate.summary}`,
    );
  }
}
