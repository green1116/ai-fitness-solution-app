/**
 * E06-P4 — Enterprise Control Plane verification
 * Control layer above E06 Autonomous Workflow Agent
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildOperationFoundation,
  E06_OPERATION_PLATFORM_ID,
} from "../lib/autonomous/e06";
import { buildActionRegistryManifest } from "../lib/autonomous/e06/action/action.registry";
import { buildWorkflowRegistryManifest } from "../lib/autonomous/e06/workflow/workflow.registry";
import { E06_WORKFLOW_BASE } from "../lib/autonomous/e06/workflow/workflow.constants";
import {
  E06_CONTROL_BASE,
  E06_CONTROL_PLANE_ID,
  E06_CONTROL_VERSION,
  CONTROL_HEALTH_STATUSES,
  CONTROL_MODES,
  CONTROL_PLAN_PHASES,
  CONTROL_TRACE_EVENT_KINDS,
} from "../lib/autonomous/e06/control/control.constants";
import {
  buildControlRegistryManifest,
  CONTROL_CATALOG,
  getControlById,
  getControlByMode,
} from "../lib/autonomous/e06/control/control.registry";
import {
  buildControlSchedule,
  executeControlPlan,
  executeControlPlanOrThrow,
} from "../lib/autonomous/e06/control/control.scheduler";
import {
  assertControlHealthPass,
  buildControlHealthReport,
  monitorControlRun,
} from "../lib/autonomous/e06/control/control.monitor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E06_P1_P3 = [
  "lib/autonomous/e06/core/operation.types.ts",
  "lib/autonomous/e06/core/operation.constants.ts",
  "lib/autonomous/e06/core/operation.lifecycle.ts",
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.context.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/policy/operation.policy.ts",
  "lib/autonomous/e06/policy/operation.policy.registry.ts",
  "lib/autonomous/e06/index.ts",
  "lib/autonomous/e06/action/action.types.ts",
  "lib/autonomous/e06/action/action.constants.ts",
  "lib/autonomous/e06/action/action.registry.ts",
  "lib/autonomous/e06/action/action.executor.ts",
  "lib/autonomous/e06/action/action.result.ts",
  "lib/autonomous/e06/action/action.trace.ts",
  "lib/autonomous/e06/workflow/workflow.types.ts",
  "lib/autonomous/e06/workflow/workflow.constants.ts",
  "lib/autonomous/e06/workflow/workflow.registry.ts",
  "lib/autonomous/e06/workflow/workflow.planner.ts",
  "lib/autonomous/e06/workflow/workflow.executor.ts",
  "lib/autonomous/e06/workflow/workflow.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/index.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/autonomous/e06/control/control.types.ts",
    "lib/autonomous/e06/control/control.constants.ts",
    "lib/autonomous/e06/control/control.registry.ts",
    "lib/autonomous/e06/control/control.scheduler.ts",
    "lib/autonomous/e06/control/control.monitor.ts",
    "lib/autonomous/e06/control/control.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildOperationFoundation();
  check(foundation.ready === true, "E06-P1 foundation still ready");
  check(
    foundation.platformId === E06_OPERATION_PLATFORM_ID,
    "E06-P1 platform id intact",
  );

  const actions = buildActionRegistryManifest();
  check(actions.catalogComplete === true, "E06-P2 actions still complete");

  const workflows = buildWorkflowRegistryManifest();
  check(workflows.catalogComplete === true, "E06-P3 workflows still complete");
  check(
    E06_WORKFLOW_BASE === "enterprise-e06-p2-business-action-runtime-v1",
    "E06-P3 base constant",
  );
  check(
    E06_CONTROL_BASE === "enterprise-e06-p3-autonomous-workflow-agent-v1",
    "E06-P4 base constant",
  );
  console.log("✓ upstream + E06-P1/P2/P3 unmodified / bases intact");
}

function testRegistryAndScheduler() {
  check(CONTROL_MODES.length === 3, "control modes");
  check(CONTROL_HEALTH_STATUSES.length === 3, "health statuses");
  check(CONTROL_PLAN_PHASES.length === 4, "plan phases");
  check(CONTROL_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(CONTROL_CATALOG.length === 3, "controls");

  const manifest = buildControlRegistryManifest();
  check(manifest.catalogComplete === true, "control catalog complete");
  check(manifest.planeId === E06_CONTROL_PLANE_ID, "plane id");
  check(manifest.version === E06_CONTROL_VERSION, "version");
  check(manifest.base === E06_CONTROL_BASE, "base e06-p3");
  check(manifest.modes.length === 3, "modes covered");

  check(
    getControlByMode("automatic")?.id === "e06.control.response-auto",
    "by mode",
  );
  check(
    getControlById("e06.control.risk-supervised")?.workflowId ===
      "e06.workflow.risk-guard",
    "by id",
  );

  const schedule = buildControlSchedule();
  check(schedule.slotCount === 3, "schedule slots");
  check(schedule.slots[0].controlId === "e06.control.response-auto", "priority order");
  check(schedule.slots[2].mode === "fallback", "fallback last");
  check(
    schedule.slots.every((s, i) => s.order === i + 1),
    "slot order",
  );
  console.log("✓ control registry + scheduler");
  console.log(schedule.narrative);
}

function testPlanExecutionAndMonitor() {
  const bundle = executeControlPlanOrThrow(CONTROL_CATALOG, {
    input: {
      goal: "星河科技园健身中心企业控制平面",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e06-p4" },
  });

  check(bundle.result.success === true, "plan success");
  check(bundle.result.status === "result", "plan status result");
  check(bundle.result.runs.length === 3, "all slots ran");
  check(
    bundle.result.runs.every((r) => r.success && r.status === "result"),
    "all runs succeeded",
  );
  check(bundle.result.health.status === "green", "health green");
  check(bundle.result.health.healthyCount === 3, "all healthy");
  check(bundle.result.health.successRate === 1, "success rate");
  assertControlHealthPass(bundle.result.health);

  const entry = monitorControlRun(bundle.result.runs[0]);
  check(entry.status === "green", "entry green");
  check(entry.completionRatio === 1, "completion ratio");

  check(bundle.trace.eventCount >= 6, "trace events recorded");
  check(
    bundle.trace.events.some((e) => e.kind === "schedule"),
    "schedule trace event",
  );
  check(
    bundle.trace.events.some((e) => e.kind === "health"),
    "health trace event",
  );
  check(Boolean(bundle.trace.finishedAt), "trace finished");
  console.log(bundle.result.health.summary);

  const degraded = executeControlPlan(CONTROL_CATALOG, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(degraded.result.success === false, "unsafe plan not success");
  check(
    degraded.result.status === "degraded" || degraded.result.status === "failed",
    "unsafe plan degraded/failed",
  );
  check(
    degraded.result.health.status !== "green",
    "unsafe health not green",
  );
  check(
    degraded.trace.events.some((e) => e.kind === "error"),
    "degraded trace error",
  );

  const emptyReport = buildControlHealthReport("empty-plan", []);
  check(emptyReport.status === "amber", "empty report amber");

  console.log("✓ control plan execution + monitor");
}

function main() {
  console.log("E06-P4 — Enterprise Control Plane Verification\n");

  const frozen = [...FROZEN_E06_P1_P3, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E06-P1/P2/P3", FROZEN_E06_P1_P3, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndScheduler();
  testPlanExecutionAndMonitor();
  checkFrozen("E06-P1/P2/P3", FROZEN_E06_P1_P3, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E06 P4 enterprise control plane");
}

main();
