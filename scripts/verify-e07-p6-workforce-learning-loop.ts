/**
 * E07-P6 — Workforce Learning Loop verification
 * Learning layer above E07 Human-AI Collaboration
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildWorkforceFoundation,
  E07_WORKFORCE_PLATFORM_ID,
} from "../lib/workforce/e07";
import { buildEmployeeRegistryManifest } from "../lib/workforce/e07/employee/employee.registry";
import { buildRoleRegistryManifest } from "../lib/workforce/e07/marketplace/role.registry";
import { buildOrchestrationRegistryManifest } from "../lib/workforce/e07/orchestration/orchestration.registry";
import { buildCollaborationRegistryManifest } from "../lib/workforce/e07/collaboration/collaboration.registry";
import { E07_COLLABORATION_BASE } from "../lib/workforce/e07/collaboration/collaboration.constants";
import {
  E07_LEARNING_BASE,
  E07_LEARNING_LOOP_ID,
  E07_LEARNING_VERSION,
  LEARNING_KINDS,
  LEARNING_LOOP_PHASES,
  LEARNING_TRACE_EVENT_KINDS,
} from "../lib/workforce/e07/learning/learning.constants";
import {
  buildLearningRegistryManifest,
  getLearningById,
  getLearningByKind,
  LEARNING_CATALOG,
} from "../lib/workforce/e07/learning/learning.registry";
import { measureLearning } from "../lib/workforce/e07/learning/learning.evaluator";
import {
  runWorkforceLearningLoop,
  runWorkforceLearningLoopOrThrow,
} from "../lib/workforce/e07/learning/learning.updater";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E07_P1_P5 = [
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/skill/skill.registry.ts",
  "lib/workforce/e07/index.ts",
  "lib/workforce/e07/employee/employee.registry.ts",
  "lib/workforce/e07/employee/employee.executor.ts",
  "lib/workforce/e07/marketplace/role.registry.ts",
  "lib/workforce/e07/marketplace/role.deployer.ts",
  "lib/workforce/e07/orchestration/orchestration.registry.ts",
  "lib/workforce/e07/orchestration/orchestration.executor.ts",
  "lib/workforce/e07/collaboration/collaboration.types.ts",
  "lib/workforce/e07/collaboration/collaboration.constants.ts",
  "lib/workforce/e07/collaboration/collaboration.registry.ts",
  "lib/workforce/e07/collaboration/collaboration.request.ts",
  "lib/workforce/e07/collaboration/collaboration.executor.ts",
  "lib/workforce/e07/collaboration/collaboration.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/index.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
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
    "lib/workforce/e07/learning/learning.types.ts",
    "lib/workforce/e07/learning/learning.constants.ts",
    "lib/workforce/e07/learning/learning.registry.ts",
    "lib/workforce/e07/learning/learning.evaluator.ts",
    "lib/workforce/e07/learning/learning.updater.ts",
    "lib/workforce/e07/learning/learning.trace.ts",
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
  const foundation = buildWorkforceFoundation();
  check(foundation.ready === true, "E07-P1 foundation still ready");
  check(
    foundation.platformId === E07_WORKFORCE_PLATFORM_ID,
    "E07-P1 platform id intact",
  );
  check(
    buildEmployeeRegistryManifest().catalogComplete === true,
    "E07-P2 employees still complete",
  );
  check(
    buildRoleRegistryManifest().catalogComplete === true,
    "E07-P3 roles still complete",
  );
  check(
    buildOrchestrationRegistryManifest().catalogComplete === true,
    "E07-P4 orchestrations still complete",
  );
  check(
    buildCollaborationRegistryManifest().catalogComplete === true,
    "E07-P5 collaborations still complete",
  );
  check(
    E07_COLLABORATION_BASE === "enterprise-e07-p4-workforce-orchestration-v1",
    "E07-P5 base constant",
  );
  check(
    E07_LEARNING_BASE === "enterprise-e07-p5-human-ai-collaboration-v1",
    "E07-P6 base constant",
  );
  console.log("✓ upstream + E07-P1..P5 unmodified / bases intact");
}

function testRegistryAndEvaluator() {
  check(LEARNING_KINDS.length === 3, "learning kinds");
  check(LEARNING_LOOP_PHASES.length === 4, "loop phases");
  check(LEARNING_TRACE_EVENT_KINDS.length === 7, "trace event kinds");
  check(LEARNING_CATALOG.length === 3, "learnings");

  const manifest = buildLearningRegistryManifest();
  check(manifest.catalogComplete === true, "learning catalog complete");
  check(manifest.loopId === E07_LEARNING_LOOP_ID, "loop id");
  check(manifest.version === E07_LEARNING_VERSION, "version");
  check(manifest.base === E07_LEARNING_BASE, "base e07-p5");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getLearningByKind("outcome")?.id === "e07.learn.campaign-outcome",
    "by kind",
  );
  check(
    getLearningById("e07.learn.guardrail-gate")?.collaborationId ===
      "e07.collab.guardrail-approve",
    "by id",
  );

  const measurement = measureLearning(
    {
      collaborationId: "a",
      score: 0,
      completedSteps: 0,
      stepCount: 2,
      status: "blocked",
      findings: ["blocked"],
      needsImprovement: true,
      readOnly: true,
    },
    {
      collaborationId: "a",
      score: 100,
      completedSteps: 2,
      stepCount: 2,
      status: "result",
      findings: [],
      needsImprovement: false,
      readOnly: true,
    },
    100,
  );
  check(measurement.delta === 100, "measurement delta");
  check(measurement.improved === true, "measurement improved");
  check(measurement.reachedTarget === true, "measurement target");
  console.log("✓ learning registry + evaluator");
}

function testLoop() {
  const outcome = getLearningById("e07.learn.campaign-outcome");
  check(Boolean(outcome), "outcome learning");

  // Degraded baseline: unsafe input blocks after human approve, adjustments repair
  const repair = runWorkforceLearningLoopOrThrow(outcome!, {
    input: {
      goal: "星河科技园健身中心劳动力学习闭环",
      projectHint: "星河科技园企业健身中心",
      humanDecision: "approve",
      unsafe: true,
    },
    metadata: { source: "verify-e07-p6" },
  });

  check(repair.result.success === true, "repair loop success");
  check(repair.result.status === "result", "repair status result");
  check(repair.result.baseline.needsImprovement === true, "baseline degraded");
  check(repair.result.baseline.score < 100, "baseline score low");
  check(repair.result.appliedAdjustments.length === 3, "adjustments applied");
  check(repair.result.updated.score === 100, "updated score 100");
  check(repair.result.measurement.improved === true, "measured improvement");
  check(repair.result.measurement.reachedTarget === true, "target reached");
  console.log(repair.result.measurement.verdict);

  check(repair.trace.eventCount >= 6, "trace events recorded");
  for (const kind of ["evaluate", "improve", "update", "measure", "result"]) {
    check(
      repair.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(repair.trace.finishedAt), "trace finished");

  // Healthy baseline: no adjustments required
  for (const learning of LEARNING_CATALOG) {
    const bundle = runWorkforceLearningLoopOrThrow(learning, {
      input: {
        goal: `probe:${learning.kind}`,
        ready: true,
        riskScore: 10,
        humanDecision: "approve",
      },
    });
    check(bundle.result.success === true, `${learning.id} success`);
    check(
      bundle.result.baseline.needsImprovement === false,
      `${learning.id} healthy baseline`,
    );
    check(
      bundle.result.appliedAdjustments.length === 0,
      `${learning.id} no adjustments needed`,
    );
    check(
      bundle.result.measurement.reachedTarget === true,
      `${learning.id} target`,
    );
  }

  // Missing collaboration rejected at assert
  let threw = false;
  try {
    runWorkforceLearningLoop({
      ...outcome!,
      collaborationId: "e07.collab.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error &&
      error.message.includes("missing E07 collaboration");
  }
  check(threw, "broken learning definition rejected");

  console.log("✓ learning loop (evaluate → improve → update → measure)");
}

function main() {
  console.log("E07-P6 — Workforce Learning Loop Verification\n");

  const frozen = [...FROZEN_E07_P1_P5, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E07-P1..P5", FROZEN_E07_P1_P5, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndEvaluator();
  testLoop();
  checkFrozen("E07-P1..P5", FROZEN_E07_P1_P5, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E07 P6 workforce learning loop");
}

main();
