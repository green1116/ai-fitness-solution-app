/**
 * E06-P5 — Self Optimization Loop verification
 * Self optimization layer above E06 Enterprise Control Plane
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
import { buildControlRegistryManifest } from "../lib/autonomous/e06/control/control.registry";
import { E06_CONTROL_BASE } from "../lib/autonomous/e06/control/control.constants";
import {
  E06_OPTIMIZATION_BASE,
  E06_OPTIMIZATION_LOOP_ID,
  E06_OPTIMIZATION_VERSION,
  OPTIMIZATION_KINDS,
  OPTIMIZATION_LOOP_PHASES,
  OPTIMIZATION_TRACE_EVENT_KINDS,
} from "../lib/autonomous/e06/optimization/optimization.constants";
import {
  buildOptimizationRegistryManifest,
  getOptimizationById,
  getOptimizationByKind,
  OPTIMIZATION_CATALOG,
} from "../lib/autonomous/e06/optimization/optimization.registry";
import {
  measureOptimization,
} from "../lib/autonomous/e06/optimization/optimization.evaluator";
import {
  runSelfOptimizationLoop,
  runSelfOptimizationLoopOrThrow,
} from "../lib/autonomous/e06/optimization/optimization.loop";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E06_P1_P4 = [
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
  "lib/autonomous/e06/control/control.types.ts",
  "lib/autonomous/e06/control/control.constants.ts",
  "lib/autonomous/e06/control/control.registry.ts",
  "lib/autonomous/e06/control/control.scheduler.ts",
  "lib/autonomous/e06/control/control.monitor.ts",
  "lib/autonomous/e06/control/control.trace.ts",
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
    "lib/autonomous/e06/optimization/optimization.types.ts",
    "lib/autonomous/e06/optimization/optimization.constants.ts",
    "lib/autonomous/e06/optimization/optimization.registry.ts",
    "lib/autonomous/e06/optimization/optimization.loop.ts",
    "lib/autonomous/e06/optimization/optimization.evaluator.ts",
    "lib/autonomous/e06/optimization/optimization.trace.ts",
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
  check(
    buildActionRegistryManifest().catalogComplete === true,
    "E06-P2 actions still complete",
  );
  check(
    buildWorkflowRegistryManifest().catalogComplete === true,
    "E06-P3 workflows still complete",
  );
  check(
    buildControlRegistryManifest().catalogComplete === true,
    "E06-P4 controls still complete",
  );
  check(
    E06_CONTROL_BASE === "enterprise-e06-p3-autonomous-workflow-agent-v1",
    "E06-P4 base constant",
  );
  check(
    E06_OPTIMIZATION_BASE === "enterprise-e06-p4-enterprise-control-plane-v1",
    "E06-P5 base constant",
  );
  console.log("✓ upstream + E06-P1..P4 unmodified / bases intact");
}

function testRegistryAndEvaluator() {
  check(OPTIMIZATION_KINDS.length === 3, "optimization kinds");
  check(OPTIMIZATION_LOOP_PHASES.length === 4, "loop phases");
  check(OPTIMIZATION_TRACE_EVENT_KINDS.length === 7, "trace event kinds");
  check(OPTIMIZATION_CATALOG.length === 3, "optimizations");

  const manifest = buildOptimizationRegistryManifest();
  check(manifest.catalogComplete === true, "optimization catalog complete");
  check(manifest.loopId === E06_OPTIMIZATION_LOOP_ID, "loop id");
  check(manifest.version === E06_OPTIMIZATION_VERSION, "version");
  check(manifest.base === E06_OPTIMIZATION_BASE, "base e06-p4");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getOptimizationByKind("throughput")?.id === "e06.opt.response-throughput",
    "by kind",
  );
  check(
    getOptimizationById("e06.opt.risk-resilience")?.controlId ===
      "e06.control.risk-supervised",
    "by id",
  );

  const measurement = measureOptimization(
    {
      planId: "a",
      healthStatus: "red",
      score: 0,
      completedSteps: 0,
      stepCount: 4,
      findings: ["blocked"],
      needsOptimization: true,
      readOnly: true,
    },
    {
      planId: "b",
      healthStatus: "green",
      score: 100,
      completedSteps: 4,
      stepCount: 4,
      findings: [],
      needsOptimization: false,
      readOnly: true,
    },
    100,
  );
  check(measurement.delta === 100, "measurement delta");
  check(measurement.improved === true, "measurement improved");
  check(measurement.reachedTarget === true, "measurement target");
  console.log("✓ optimization registry + evaluator");
}

function testLoop() {
  const throughput = getOptimizationById("e06.opt.response-throughput");
  check(Boolean(throughput), "throughput optimization");

  // Degraded baseline: unsafe input blocks the workflow, knobs must repair it
  const repair = runSelfOptimizationLoopOrThrow(throughput!, {
    input: {
      goal: "星河科技园健身中心自优化闭环",
      projectHint: "星河科技园企业健身中心",
      unsafe: true,
    },
    metadata: { source: "verify-e06-p5" },
  });

  check(repair.result.success === true, "repair loop success");
  check(repair.result.status === "result", "repair status result");
  check(repair.result.baseline.needsOptimization === true, "baseline degraded");
  check(repair.result.baseline.score < 100, "baseline score low");
  check(repair.result.appliedKnobs.length === 2, "knobs applied");
  check(repair.result.optimized.score === 100, "optimized score 100");
  check(repair.result.optimized.healthStatus === "green", "optimized green");
  check(repair.result.measurement.improved === true, "measured improvement");
  check(repair.result.measurement.reachedTarget === true, "target reached");
  console.log(repair.result.measurement.verdict);

  check(repair.trace.eventCount >= 6, "trace events recorded");
  for (const kind of ["evaluate", "optimize", "apply", "measure", "result"]) {
    check(
      repair.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(repair.trace.finishedAt), "trace finished");

  // Healthy baseline: no knobs required, loop still reaches target
  for (const optimization of OPTIMIZATION_CATALOG) {
    const bundle = runSelfOptimizationLoopOrThrow(optimization, {
      input: { goal: `probe:${optimization.kind}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${optimization.id} success`);
    check(
      bundle.result.baseline.needsOptimization === false,
      `${optimization.id} healthy baseline`,
    );
    check(
      bundle.result.appliedKnobs.length === 0,
      `${optimization.id} no knobs needed`,
    );
    check(
      bundle.result.measurement.reachedTarget === true,
      `${optimization.id} target`,
    );
  }

  // Unknown control fails fast at definition assert
  let threw = false;
  try {
    runSelfOptimizationLoop({
      ...throughput!,
      controlId: "e06.control.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error && error.message.includes("missing E06 control");
  }
  check(threw, "broken definition rejected");

  console.log("✓ self optimization loop (evaluate → optimize → apply → measure)");
}

function main() {
  console.log("E06-P5 — Self Optimization Loop Verification\n");

  const frozen = [...FROZEN_E06_P1_P4, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E06-P1..P4", FROZEN_E06_P1_P4, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndEvaluator();
  testLoop();
  checkFrozen("E06-P1..P4", FROZEN_E06_P1_P4, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E06 P5 self optimization loop");
}

main();
