/**
 * E06-P6 — Enterprise Digital Twin verification
 * Digital twin layer above E06 Self Optimization Loop
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
import { buildOptimizationRegistryManifest } from "../lib/autonomous/e06/optimization/optimization.registry";
import { E06_OPTIMIZATION_BASE } from "../lib/autonomous/e06/optimization/optimization.constants";
import {
  E06_TWIN_BASE,
  E06_TWIN_ID,
  E06_TWIN_VERSION,
  TWIN_DOMAINS,
  TWIN_RUN_PHASES,
  TWIN_STATE_HEALTH,
  TWIN_TRACE_EVENT_KINDS,
} from "../lib/autonomous/e06/digital-twin/twin.constants";
import {
  buildTwinRegistryManifest,
  getTwinByDomain,
  getTwinById,
  TWIN_CATALOG,
} from "../lib/autonomous/e06/digital-twin/twin.registry";
import {
  buildTwinStateModel,
  projectTwinState,
} from "../lib/autonomous/e06/digital-twin/twin.model";
import {
  simulateDigitalTwin,
  simulateDigitalTwinOrThrow,
} from "../lib/autonomous/e06/digital-twin/twin.engine";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E06_P1_P5 = [
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/policy/operation.policy.ts",
  "lib/autonomous/e06/policy/operation.policy.registry.ts",
  "lib/autonomous/e06/index.ts",
  "lib/autonomous/e06/action/action.registry.ts",
  "lib/autonomous/e06/action/action.executor.ts",
  "lib/autonomous/e06/workflow/workflow.registry.ts",
  "lib/autonomous/e06/workflow/workflow.planner.ts",
  "lib/autonomous/e06/workflow/workflow.executor.ts",
  "lib/autonomous/e06/control/control.registry.ts",
  "lib/autonomous/e06/control/control.scheduler.ts",
  "lib/autonomous/e06/control/control.monitor.ts",
  "lib/autonomous/e06/optimization/optimization.types.ts",
  "lib/autonomous/e06/optimization/optimization.constants.ts",
  "lib/autonomous/e06/optimization/optimization.registry.ts",
  "lib/autonomous/e06/optimization/optimization.loop.ts",
  "lib/autonomous/e06/optimization/optimization.evaluator.ts",
  "lib/autonomous/e06/optimization/optimization.trace.ts",
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
    "lib/autonomous/e06/digital-twin/twin.types.ts",
    "lib/autonomous/e06/digital-twin/twin.constants.ts",
    "lib/autonomous/e06/digital-twin/twin.registry.ts",
    "lib/autonomous/e06/digital-twin/twin.model.ts",
    "lib/autonomous/e06/digital-twin/twin.engine.ts",
    "lib/autonomous/e06/digital-twin/twin.trace.ts",
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
    buildOptimizationRegistryManifest().catalogComplete === true,
    "E06-P5 optimizations still complete",
  );
  check(
    E06_OPTIMIZATION_BASE === "enterprise-e06-p4-enterprise-control-plane-v1",
    "E06-P5 base constant",
  );
  check(
    E06_TWIN_BASE === "enterprise-e06-p5-self-optimization-loop-v1",
    "E06-P6 base constant",
  );
  console.log("✓ upstream + E06-P1..P5 unmodified / bases intact");
}

function testRegistryAndModel() {
  check(TWIN_DOMAINS.length === 3, "twin domains");
  check(TWIN_STATE_HEALTH.length === 3, "state health values");
  check(TWIN_RUN_PHASES.length === 4, "run phases");
  check(TWIN_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(TWIN_CATALOG.length === 3, "twins");

  const manifest = buildTwinRegistryManifest();
  check(manifest.catalogComplete === true, "twin catalog complete");
  check(manifest.twinId === E06_TWIN_ID, "twin id");
  check(manifest.version === E06_TWIN_VERSION, "version");
  check(manifest.base === E06_TWIN_BASE, "base e06-p5");
  check(manifest.domains.length === 3, "domains covered");

  check(
    getTwinByDomain("operations")?.id === "e06.twin.operations",
    "by domain",
  );
  check(
    getTwinById("e06.twin.risk")?.optimizationId === "e06.opt.risk-resilience",
    "by id",
  );

  const operations = getTwinById("e06.twin.operations")!;
  const stableModel = buildTwinStateModel(operations);
  check(stableModel.health === "stable", "default model stable");
  check(stableModel.score >= 80, "default model score");
  check(stableModel.signalCount === 2, "model signal count");

  const strainedModel = buildTwinStateModel(operations, {
    readyRatio: 0.4,
    loadFactor: 0.3,
  });
  check(strainedModel.score < 80, "strained score lower");
  check(strainedModel.health !== "stable", "strained not stable");

  const projection = projectTwinState(operations, strainedModel, 100);
  check(projection.projectedScore === 100, "projection capped at 100");
  check(projection.converged === true, "projection converged");
  check(projection.delta > 0, "projection delta positive");
  console.log("✓ twin registry + state model");
  console.log(stableModel.narrative);
}

function testEngine() {
  const operations = getTwinById("e06.twin.operations")!;

  const run = simulateDigitalTwinOrThrow(operations, {
    input: {
      goal: "星河科技园健身中心企业数字孪生",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e06-p6" },
  });

  check(run.result.success === true, "simulate success");
  check(run.result.status === "result", "status result");
  check(run.result.model.health === "stable", "model stable");
  check(run.result.projection.converged === true, "projection converged");
  check(run.result.optimizationKind === "throughput", "bound optimization kind");
  check(
    typeof run.result.output.projectedScore === "number",
    "output projected score",
  );

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["model", "simulate", "project", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const twin of TWIN_CATALOG) {
    const bundle = simulateDigitalTwinOrThrow(twin, {
      input: { goal: `probe:${twin.domain}`, ready: true, riskScore: 10 },
    });
    check(bundle.result.success === true, `${twin.id} success`);
    check(
      bundle.result.projection.converged === true,
      `${twin.id} converged`,
    );
  }

  // Invalid definition fails fast at assert
  let threw = false;
  try {
    simulateDigitalTwin({
      ...operations,
      optimizationId: "e06.opt.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error &&
      error.message.includes("missing E06 optimization");
  }
  check(threw, "broken twin definition rejected");

  console.log("✓ digital twin engine (model → simulate → project)");
  console.log(run.result.projection.verdict);
}

function main() {
  console.log("E06-P6 — Enterprise Digital Twin Verification\n");

  const frozen = [...FROZEN_E06_P1_P5, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E06-P1..P5", FROZEN_E06_P1_P5, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndModel();
  testEngine();
  checkFrozen("E06-P1..P5", FROZEN_E06_P1_P5, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E06 P6 enterprise digital twin");
}

main();
