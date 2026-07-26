/**
 * Product M10 — AI Scheduler manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_QUEUE_RUNTIME_ID } from "../queue-runtime/queue.constants";
import {
  clearAiScheduleQueueBindings,
  listAiScheduleQueueBindings,
} from "./binding.registry";
import {
  clearAiSchedules,
  listAiSchedules,
} from "./schedule.registry";
import {
  PRODUCT_AI_SCHEDULER_BASE,
  PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  PRODUCT_AI_SCHEDULER_ID,
  PRODUCT_AI_SCHEDULER_VERSION,
} from "./scheduler.constants";
import { getAiSchedulerMetadata } from "./scheduler.metadata";
import type {
  AiScheduleReadinessCheck,
  AiScheduleReadinessResult,
  AiSchedulerManifest,
} from "./scheduler.types";
import {
  clearAiScheduleTriggers,
  listAiScheduleTriggers,
} from "./trigger.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiScheduleReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiSchedulerLayer(): void {
  clearAiScheduleQueueBindings();
  clearAiScheduleTriggers();
  clearAiSchedules();
}

export function buildAiSchedulerManifest(): AiSchedulerManifest {
  const schedules = listAiSchedules();
  const triggers = listAiScheduleTriggers();
  const bindings = listAiScheduleQueueBindings();
  const metadata = getAiSchedulerMetadata();

  const payload = {
    schedulerId: PRODUCT_AI_SCHEDULER_ID,
    version: PRODUCT_AI_SCHEDULER_VERSION,
    freezeVersion: PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
    base: PRODUCT_AI_SCHEDULER_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    schedules: schedules.map((s) => ({
      scheduleKey: s.scheduleKey,
      kind: s.kind,
      status: s.status,
      expression: s.expression,
    })),
    triggers: triggers.map((t) => ({
      triggerKey: t.triggerKey,
      status: t.status,
      scheduleId: t.scheduleId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      queueKeyRef: b.queueKeyRef,
      status: b.status,
      scheduleId: b.scheduleId,
    })),
  };

  return {
    schedulerId: PRODUCT_AI_SCHEDULER_ID,
    version: PRODUCT_AI_SCHEDULER_VERSION,
    freezeVersion: PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
    base: PRODUCT_AI_SCHEDULER_BASE,
    scheduleCount: schedules.length,
    triggerCount: triggers.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiSchedulerReadiness(): AiScheduleReadinessResult {
  const checks: AiScheduleReadinessCheck[] = [];
  const metadata = getAiSchedulerMetadata();
  const schedules = listAiSchedules();
  const triggers = listAiScheduleTriggers();
  const bindings = listAiScheduleQueueBindings();
  const manifest = buildAiSchedulerManifest();

  checks.push(
    check(
      "AISCH-BASE",
      "scheduler",
      "ai queue runtime base aligned",
      PRODUCT_AI_SCHEDULER_BASE === PRODUCT_AI_QUEUE_RUNTIME_ID &&
        PRODUCT_AI_QUEUE_RUNTIME_ID ===
          "enterprise-product-ai-queue-runtime-v1",
      `base=${PRODUCT_AI_SCHEDULER_BASE}`,
    ),
  );

  checks.push(
    check(
      "AISCH-META",
      "metadata",
      "Scheduler metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AISCH-REG",
      "schedule",
      "Active schedule definitions present",
      schedules.some((s) => s.status === "ACTIVE"),
      `schedules=${schedules.length}`,
    ),
  );

  checks.push(
    check(
      "AISCH-TRIG",
      "trigger",
      "Declared schedule triggers present",
      triggers.some((t) => t.status === "DECLARED"),
      `triggers=${triggers.length}`,
    ),
  );

  checks.push(
    check(
      "AISCH-BIND",
      "binding",
      "Bound queue refs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AISCH-MAN",
      "manifest",
      "Scheduler manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.schedulerId === PRODUCT_AI_SCHEDULER_ID &&
        manifest.scheduleCount >= 1 &&
        manifest.triggerCount >= 1 &&
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
    summary: `product-ai-scheduler readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiSchedulerReadinessReady(
  result: AiScheduleReadinessResult,
): asserts result is AiScheduleReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product ai scheduler not ready: ${result.summary}`);
  }
}
