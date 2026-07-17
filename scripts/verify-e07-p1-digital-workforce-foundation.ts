/**
 * E07-P1 — Digital Workforce Foundation verification
 * Digital workforce abstraction above E06 Autonomous Enterprise OS
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildOperationFoundation } from "../lib/autonomous/e06/core/operation.lifecycle";
import {
  E06_OPERATION_PLATFORM_ID,
  E06_OPERATION_VERSION,
} from "../lib/autonomous/e06/core/operation.constants";
import { E06_AUTONOMOUS_OS_FREEZE_VERSION } from "../lib/autonomous/e06/signoff/signoff.types";
import {
  assertWorkforceFoundationPass,
  buildSkillRegistryManifest,
  buildWorkforceFoundation,
  canAdvanceWorkforceLifecycle,
  createWorkforceExecutionContext,
  E07_WORKFORCE_BASE,
  E07_WORKFORCE_PLATFORM_ID,
  E07_WORKFORCE_VERSION,
  executeWorkerOrThrow,
  getWorkerById,
  getWorkerByRole,
  isWorkerDependencyGraphValid,
  listExecutableWorkers,
  SKILL_CATALOG,
  SKILL_KINDS,
  WORKER_CATALOG,
  WORKER_ROLES,
  WORKFORCE_LIFECYCLE_STAGES,
} from "../lib/workforce/e07";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E06 = [
  "lib/autonomous/e06/core/operation.types.ts",
  "lib/autonomous/e06/core/operation.constants.ts",
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/core/operation.lifecycle.ts",
  "lib/autonomous/e06/runtime/operation.context.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/policy/operation.policy.registry.ts",
  "lib/autonomous/e06/index.ts",
  "lib/autonomous/e06/signoff/signoff.types.ts",
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
    "lib/workforce/e07/core/workforce.types.ts",
    "lib/workforce/e07/core/workforce.constants.ts",
    "lib/workforce/e07/core/workforce.lifecycle.ts",
    "lib/workforce/e07/core/workforce.registry.ts",
    "lib/workforce/e07/runtime/workforce.context.ts",
    "lib/workforce/e07/runtime/workforce.executor.ts",
    "lib/workforce/e07/skill/skill.types.ts",
    "lib/workforce/e07/skill/skill.registry.ts",
    "lib/workforce/e07/index.ts",
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
  check(foundation.ready === true, "E06 foundation still ready");
  check(
    foundation.platformId === E06_OPERATION_PLATFORM_ID,
    "E06 platform id intact",
  );
  check(foundation.version === E06_OPERATION_VERSION, "E06 version intact");
  check(
    E06_AUTONOMOUS_OS_FREEZE_VERSION === "e06-autonomous-os-freeze-1",
    "E06 OS freeze version present",
  );
  check(
    E07_WORKFORCE_BASE === "enterprise-e06-autonomous-enterprise-os-freeze-v1",
    "E07 base constant",
  );
  console.log("✓ E03 + E04 + E05 + E06 unmodified / bases intact");
}

function testFoundationAndSkills() {
  check(WORKER_ROLES.length === 6, "worker roles");
  check(WORKFORCE_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(
    canAdvanceWorkforceLifecycle("declared", "registered"),
    "declared→registered",
  );
  check(
    !canAdvanceWorkforceLifecycle("declared", "completed"),
    "skip blocked",
  );

  check(WORKER_CATALOG.length === 6, "workers");
  check(isWorkerDependencyGraphValid(), "dependency graph");
  check(SKILL_CATALOG.length === 6, "skills");
  check(SKILL_KINDS.length === 6, "skill kinds");

  const skills = buildSkillRegistryManifest();
  check(skills.catalogComplete === true, "skill catalog complete");

  const foundation = buildWorkforceFoundation();
  check(foundation.ready === true, "foundation ready");
  check(foundation.platformId === E07_WORKFORCE_PLATFORM_ID, "platform id");
  check(foundation.base === E07_WORKFORCE_BASE, "base e06 freeze");
  check(foundation.version === E07_WORKFORCE_VERSION, "version");
  check(foundation.registry.catalogComplete === true, "registry complete");
  check(foundation.lifecycle.complete === true, "lifecycle complete");
  assertWorkforceFoundationPass(foundation);

  check(
    getWorkerByRole("observer")?.id === "e07.worker.observer",
    "by role",
  );
  check(listExecutableWorkers().length === 5, "executable workers");
  console.log("✓ foundation + skills");
  console.log(foundation.summary);
}

function testExecutorBridge() {
  const observer = getWorkerById("e07.worker.observer");
  check(Boolean(observer), "observer worker");

  const context = createWorkforceExecutionContext({
    workerId: observer!.id,
    operationId: observer!.operationId,
    skillId: "e07.skill.sense",
    input: {
      goal: "星河科技园健身中心数字员工观测",
      projectHint: "星河科技园企业健身中心",
      ready: true,
    },
    metadata: { source: "verify-e07-p1" },
  });

  const run = executeWorkerOrThrow(observer!, context);
  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(
    run.result.operation.result.success === true,
    "E06 operation success",
  );
  check(
    run.result.operationId === "e06.op.observe-opportunity",
    "bound operation",
  );
  check(run.result.output.role === "observer", "role output");
  check(run.result.output.skillKind === "sense", "skill kind output");

  for (const worker of listExecutableWorkers()) {
    const ctx = createWorkforceExecutionContext({
      workerId: worker.id,
      operationId: worker.operationId,
      skillId: worker.skillIds[0],
      input: { goal: `probe:${worker.role}`, ready: true, riskScore: 10 },
    });
    const bundle = executeWorkerOrThrow(worker, ctx);
    check(bundle.result.success === true, `${worker.id} success`);
  }

  // orchestrator via coordinate operation
  const orchestrator = getWorkerById("e07.worker.orchestrator");
  check(Boolean(orchestrator), "orchestrator worker");
  const orch = executeWorkerOrThrow(
    orchestrator!,
    createWorkforceExecutionContext({
      workerId: orchestrator!.id,
      operationId: orchestrator!.operationId,
      skillId: "e07.skill.coordinate",
      input: { goal: "orchestration probe", ready: true },
    }),
  );
  check(orch.result.success === true, "orchestrator success");

  // foreign skill rejected
  let threw = false;
  try {
    executeWorkerOrThrow(
      observer!,
      createWorkforceExecutionContext({
        workerId: observer!.id,
        operationId: observer!.operationId,
        skillId: "e07.skill.coordinate",
        input: { goal: "bad skill", ready: true },
      }),
    );
  } catch (error) {
    threw = error instanceof Error && error.message.includes("not owned");
  }
  check(threw, "foreign skill rejected");

  console.log("✓ workforce executor → E06 autonomous operation bridge");
}

function main() {
  console.log("E07-P1 — Digital Workforce Foundation Verification\n");

  const frozen = [...FROZEN_E06, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E06", FROZEN_E06, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testFoundationAndSkills();
  testExecutorBridge();
  checkFrozen("E06", FROZEN_E06, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E07 P1 digital workforce foundation");
}

main();
