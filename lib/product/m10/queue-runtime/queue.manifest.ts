/**
 * Product M10 — AI Queue Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_JOB_RUNTIME_ID } from "../job-runtime/job.constants";
import {
  clearAiQueueJobBindings,
  listAiQueueJobBindings,
} from "./binding.registry";
import {
  clearAiQueueChannels,
  listAiQueueChannels,
} from "./channel.registry";
import {
  PRODUCT_AI_QUEUE_RUNTIME_BASE,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_QUEUE_RUNTIME_ID,
  PRODUCT_AI_QUEUE_RUNTIME_VERSION,
} from "./queue.constants";
import { getAiQueueRuntimeMetadata } from "./queue.metadata";
import { clearAiQueues, listAiQueues } from "./queue.registry";
import type {
  AiQueueReadinessCheck,
  AiQueueReadinessResult,
  AiQueueRuntimeManifest,
} from "./queue.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiQueueReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiQueueRuntimeLayer(): void {
  clearAiQueueJobBindings();
  clearAiQueueChannels();
  clearAiQueues();
}

export function buildAiQueueRuntimeManifest(): AiQueueRuntimeManifest {
  const queues = listAiQueues();
  const channels = listAiQueueChannels();
  const bindings = listAiQueueJobBindings();
  const metadata = getAiQueueRuntimeMetadata();

  const payload = {
    queueRuntimeId: PRODUCT_AI_QUEUE_RUNTIME_ID,
    version: PRODUCT_AI_QUEUE_RUNTIME_VERSION,
    freezeVersion: PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
    base: PRODUCT_AI_QUEUE_RUNTIME_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    queues: queues.map((q) => ({
      queueKey: q.queueKey,
      kind: q.kind,
      status: q.status,
    })),
    channels: channels.map((c) => ({
      channelKey: c.channelKey,
      status: c.status,
      queueId: c.queueId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      jobKeyRef: b.jobKeyRef,
      status: b.status,
      queueId: b.queueId,
    })),
  };

  return {
    queueRuntimeId: PRODUCT_AI_QUEUE_RUNTIME_ID,
    version: PRODUCT_AI_QUEUE_RUNTIME_VERSION,
    freezeVersion: PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
    base: PRODUCT_AI_QUEUE_RUNTIME_BASE,
    queueCount: queues.length,
    channelCount: channels.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiQueueRuntimeReadiness(): AiQueueReadinessResult {
  const checks: AiQueueReadinessCheck[] = [];
  const metadata = getAiQueueRuntimeMetadata();
  const queues = listAiQueues();
  const channels = listAiQueueChannels();
  const bindings = listAiQueueJobBindings();
  const manifest = buildAiQueueRuntimeManifest();

  checks.push(
    check(
      "AIQ-BASE",
      "queue-runtime",
      "ai job runtime base aligned",
      PRODUCT_AI_QUEUE_RUNTIME_BASE === PRODUCT_AI_JOB_RUNTIME_ID &&
        PRODUCT_AI_JOB_RUNTIME_ID === "enterprise-product-ai-job-runtime-v1",
      `base=${PRODUCT_AI_QUEUE_RUNTIME_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIQ-META",
      "metadata",
      "Queue runtime metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 6,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIQ-REG",
      "queue",
      "Active queue definitions present",
      queues.some((q) => q.status === "ACTIVE"),
      `queues=${queues.length}`,
    ),
  );

  checks.push(
    check(
      "AIQ-CHAN",
      "channel",
      "Declared queue channels present",
      channels.some((c) => c.status === "DECLARED"),
      `channels=${channels.length}`,
    ),
  );

  checks.push(
    check(
      "AIQ-BIND",
      "binding",
      "Bound job refs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AIQ-MAN",
      "manifest",
      "Queue runtime manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.queueRuntimeId === PRODUCT_AI_QUEUE_RUNTIME_ID &&
        manifest.queueCount >= 1 &&
        manifest.channelCount >= 1 &&
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
    summary: `product-ai-queue-runtime readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiQueueRuntimeReadinessReady(
  result: AiQueueReadinessResult,
): asserts result is AiQueueReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product ai queue runtime not ready: ${result.summary}`);
  }
}
