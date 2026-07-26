/**
 * Product M10 — AI Scheduler Release Gate
 * MODULE: Scheduler (M10-P4)
 * BASE: enterprise-product-ai-queue-runtime-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AI_QUEUE_RUNTIME_ID } from "../queue-runtime/queue.constants";
import { bindAiScheduleQueue } from "../scheduler/binding.registry";
import {
  registerAiSchedule,
  updateAiScheduleStatus,
} from "../scheduler/schedule.registry";
import {
  AI_SCHEDULE_BINDING_STATUSES,
  AI_SCHEDULE_KINDS,
  AI_SCHEDULE_READINESS_VERDICTS,
  AI_SCHEDULE_STATUSES,
  AI_SCHEDULE_TRIGGER_STATUSES,
  PRODUCT_AI_SCHEDULER_BASE,
  PRODUCT_AI_SCHEDULER_FREEZE_TAG,
  PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  PRODUCT_AI_SCHEDULER_ID,
  PRODUCT_AI_SCHEDULER_VERSION,
} from "../scheduler/scheduler.constants";
import {
  assertAiSchedulerReadinessReady,
  buildAiSchedulerManifest,
  clearAiSchedulerLayer,
  evaluateAiSchedulerReadiness,
} from "../scheduler/scheduler.manifest";
import {
  getAiSchedulerMetadata,
  isAiSchedulerMetadataIntact,
} from "../scheduler/scheduler.metadata";
import {
  registerAiScheduleTrigger,
  updateAiScheduleTriggerStatus,
} from "../scheduler/trigger.registry";

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

export const PRODUCT_AI_SCHEDULER_SIGNOFF_VERSION =
  "product-ai-scheduler-signoff-1" as const;

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
  clearAiSchedulerLayer();
}

export function checkProductAiSchedulerReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiSchedulerMetadata();

  checks.push(
    check(
      "AISCH-CONSTANTS",
      "scheduler",
      "Product AI scheduler version constants",
      PRODUCT_AI_SCHEDULER_ID === "enterprise-product-ai-scheduler-v1" &&
        PRODUCT_AI_SCHEDULER_VERSION === "product-ai-scheduler-1" &&
        PRODUCT_AI_SCHEDULER_BASE === PRODUCT_AI_QUEUE_RUNTIME_ID &&
        PRODUCT_AI_SCHEDULER_FREEZE_VERSION ===
          "product-ai-scheduler-freeze-1" &&
        PRODUCT_AI_SCHEDULER_FREEZE_TAG === "product-ai-scheduler-freeze-1" &&
        AI_SCHEDULE_KINDS.length === 4 &&
        AI_SCHEDULE_STATUSES.length === 4 &&
        AI_SCHEDULE_TRIGGER_STATUSES.length === 4 &&
        AI_SCHEDULE_BINDING_STATUSES.length === 3 &&
        AI_SCHEDULE_READINESS_VERDICTS.length === 3 &&
        isAiSchedulerMetadataIntact(metadata),
      `id=${PRODUCT_AI_SCHEDULER_ID} base=${PRODUCT_AI_SCHEDULER_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AISCH-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AISCH-UPSTREAM",
      "compatibility",
      "Depends on AI queue runtime chain",
      PRODUCT_AI_SCHEDULER_BASE ===
        "enterprise-product-ai-queue-runtime-v1" &&
        PRODUCT_AI_QUEUE_RUNTIME_ID ===
          "enterprise-product-ai-queue-runtime-v1",
      `queueRuntime=${PRODUCT_AI_QUEUE_RUNTIME_ID}`,
    ),
  );

  try {
    cleanup();

    const schedule = registerAiSchedule({
      id: "aisch.gate.sched",
      scheduleKey: "DOMAIN_CRON_SCHEDULE",
      kind: "CRON",
      title: "Domain cron schedule definition",
      expression: "0 * * * *",
      summary: "Declared cron schedule for domain reuse",
    });
    const active = updateAiScheduleStatus({
      scheduleId: schedule.id,
      status: "ACTIVE",
    });
    const trigger = registerAiScheduleTrigger({
      id: "aisch.gate.trig",
      scheduleId: schedule.id,
      triggerKey: "HOURLY_FIRE",
      summary: "Declared hourly trigger",
    });
    const declared = updateAiScheduleTriggerStatus({
      triggerId: trigger.id,
      status: "DECLARED",
    });
    const binding = bindAiScheduleQueue({
      id: "aisch.gate.bind",
      scheduleId: schedule.id,
      triggerId: trigger.id,
      bindingKey: "DOMAIN_CRON_TO_FIFO",
      queueKeyRef: "DOMAIN_FIFO_QUEUE",
    });
    const manifest = buildAiSchedulerManifest();
    const readiness = evaluateAiSchedulerReadiness();

    const ok =
      schedule.scheduleKey === "DOMAIN_CRON_SCHEDULE" &&
      schedule.expression === "0 * * * *" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      binding.status === "BOUND" &&
      binding.queueKeyRef === "DOMAIN_FIFO_QUEUE" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiSchedulerReadinessReady(readiness);
      checks.push(
        check(
          "AISCH-STACK",
          "scheduler",
          "Schedule / trigger / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AISCH-STACK",
          "scheduler",
          "Schedule / trigger / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai scheduler not ready",
        ),
      );
    }

    checks.push(
      check(
        "AISCH-SCOPE",
        "scope",
        "No scheduler runtime / timer / cron / queue-dispatch / provider / model / workflow / retry",
        ok && metadata.declarationOnly === true,
        "ai-scheduler-definition-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai scheduler probe failed";
    checks.push(
      check(
        "AISCH-STACK",
        "scheduler",
        "Schedule / trigger / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AISCH-SCOPE",
        "scope",
        "No scheduler runtime / timer / cron / queue-dispatch / provider / model / workflow / retry",
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
      `product-ai-scheduler-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiSchedulerReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiSchedulerReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI scheduler release gate failed: ${gate.summary}`,
    );
  }
}
