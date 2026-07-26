/**
 * Product M10 — AI Queue Runtime Release Gate
 * MODULE: Queue Runtime (M10-P3)
 * BASE: enterprise-product-ai-job-runtime-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AI_JOB_RUNTIME_ID } from "../job-runtime/job.constants";
import { bindAiQueueJob } from "../queue-runtime/binding.registry";
import {
  registerAiQueueChannel,
  updateAiQueueChannelStatus,
} from "../queue-runtime/channel.registry";
import {
  AI_QUEUE_BINDING_STATUSES,
  AI_QUEUE_CHANNEL_STATUSES,
  AI_QUEUE_KINDS,
  AI_QUEUE_READINESS_VERDICTS,
  AI_QUEUE_STATUSES,
  PRODUCT_AI_QUEUE_RUNTIME_BASE,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_QUEUE_RUNTIME_ID,
  PRODUCT_AI_QUEUE_RUNTIME_VERSION,
} from "../queue-runtime/queue.constants";
import {
  assertAiQueueRuntimeReadinessReady,
  buildAiQueueRuntimeManifest,
  clearAiQueueRuntimeLayer,
  evaluateAiQueueRuntimeReadiness,
} from "../queue-runtime/queue.manifest";
import {
  getAiQueueRuntimeMetadata,
  isAiQueueRuntimeMetadataIntact,
} from "../queue-runtime/queue.metadata";
import {
  registerAiQueue,
  updateAiQueueStatus,
} from "../queue-runtime/queue.registry";

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

export const PRODUCT_AI_QUEUE_RUNTIME_SIGNOFF_VERSION =
  "product-ai-queue-runtime-signoff-1" as const;

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
  clearAiQueueRuntimeLayer();
}

export function checkProductAiQueueRuntimeReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiQueueRuntimeMetadata();

  checks.push(
    check(
      "AIQ-CONSTANTS",
      "queue-runtime",
      "Product AI queue runtime version constants",
      PRODUCT_AI_QUEUE_RUNTIME_ID ===
        "enterprise-product-ai-queue-runtime-v1" &&
        PRODUCT_AI_QUEUE_RUNTIME_VERSION === "product-ai-queue-runtime-1" &&
        PRODUCT_AI_QUEUE_RUNTIME_BASE === PRODUCT_AI_JOB_RUNTIME_ID &&
        PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION ===
          "product-ai-queue-runtime-freeze-1" &&
        PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG ===
          "product-ai-queue-runtime-freeze-1" &&
        AI_QUEUE_KINDS.length === 4 &&
        AI_QUEUE_STATUSES.length === 4 &&
        AI_QUEUE_CHANNEL_STATUSES.length === 4 &&
        AI_QUEUE_BINDING_STATUSES.length === 3 &&
        AI_QUEUE_READINESS_VERDICTS.length === 3 &&
        isAiQueueRuntimeMetadataIntact(metadata),
      `id=${PRODUCT_AI_QUEUE_RUNTIME_ID} base=${PRODUCT_AI_QUEUE_RUNTIME_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIQ-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIQ-UPSTREAM",
      "compatibility",
      "Depends on AI job runtime chain",
      PRODUCT_AI_QUEUE_RUNTIME_BASE ===
        "enterprise-product-ai-job-runtime-v1" &&
        PRODUCT_AI_JOB_RUNTIME_ID === "enterprise-product-ai-job-runtime-v1",
      `jobRuntime=${PRODUCT_AI_JOB_RUNTIME_ID}`,
    ),
  );

  try {
    cleanup();

    const queue = registerAiQueue({
      id: "aiq.gate.queue",
      queueKey: "DOMAIN_FIFO_QUEUE",
      kind: "FIFO",
      title: "Domain FIFO queue definition",
      summary: "Declared FIFO queue for domain reuse",
    });
    const active = updateAiQueueStatus({
      queueId: queue.id,
      status: "ACTIVE",
    });
    const channel = registerAiQueueChannel({
      id: "aiq.gate.chan",
      queueId: queue.id,
      channelKey: "INGEST",
      summary: "Declared ingest channel",
    });
    const declared = updateAiQueueChannelStatus({
      channelId: channel.id,
      status: "DECLARED",
    });
    const binding = bindAiQueueJob({
      id: "aiq.gate.bind",
      queueId: queue.id,
      channelId: channel.id,
      bindingKey: "DOMAIN_FIFO_TO_BATCH",
      jobKeyRef: "DOMAIN_BATCH_JOB",
    });
    const manifest = buildAiQueueRuntimeManifest();
    const readiness = evaluateAiQueueRuntimeReadiness();

    const ok =
      queue.queueKey === "DOMAIN_FIFO_QUEUE" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      binding.status === "BOUND" &&
      binding.jobKeyRef === "DOMAIN_BATCH_JOB" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiQueueRuntimeReadinessReady(readiness);
      checks.push(
        check(
          "AIQ-STACK",
          "queue-runtime",
          "Queue / channel / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIQ-STACK",
          "queue-runtime",
          "Queue / channel / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai queue runtime not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIQ-SCOPE",
        "scope",
        "No queue execution / scheduler / provider / model / workflow / retry",
        ok && metadata.declarationOnly === true,
        "ai-queue-runtime-definition-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai queue runtime probe failed";
    checks.push(
      check(
        "AIQ-STACK",
        "queue-runtime",
        "Queue / channel / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIQ-SCOPE",
        "scope",
        "No queue execution / scheduler / provider / model / workflow / retry",
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
      `product-ai-queue-runtime-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiQueueRuntimeReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiQueueRuntimeReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI queue runtime release gate failed: ${gate.summary}`,
    );
  }
}
